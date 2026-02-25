import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getSessionById } from "@/app/lib/server/sessionService";
import { getOrCreateGameState } from "@/app/lib/server/gameStateService";
import { getSessionWorld } from "@/app/lib/server/worldGraphService";
import {
  generateImageAsset,
  type AspectRatio,
  type ImageQuality,
  type ImageResolution,
  type ReferenceImageInput,
} from "@/app/lib/server/imageGenerationService";
import {
  buildSceneRenderPrompt,
  choosePuzzleClue,
  type RenderPuzzleSnapshot,
} from "@/app/lib/server/sceneRenderPrompt";
import { resolveRenderStylePreset } from "@/app/lib/render/stylePresets";

type DisplayMode =
  | "modal"
  | "subliminal"
  | "peripheral"
  | "corruption"
  | "afterimage"
  | "glitch_scatter"
  | "creep";

type RenderRequestBody = {
  sessionId?: string;
  prompt?: string;
  style?: string;
  preset?: string;
  aspectRatio?: AspectRatio;
  quality?: ImageQuality;
  resolution?: ImageResolution;
  mode?: DisplayMode;
  intensity?: number;
  injectClue?: boolean;
  allowText?: boolean;
  contextSnippets?: string[];
  referenceImages?: ReferenceImageInput[];
};

type RenderHistoryEntry = {
  id: string;
  createdAt: string;
  roomId?: string;
  roomName: string;
  region?: string;
  quality: ImageQuality;
  aspectRatio: AspectRatio;
  resolution?: ImageResolution;
  mode: DisplayMode;
  intensity: number;
  model: string;
  referencesUsed: number;
  preset: string;
  prompt?: string;
  clueInjected: boolean;
};

const MAX_RENDER_HISTORY = 50;
const DEFAULT_MODE: DisplayMode = "modal";
const DEFAULT_QUALITY: ImageQuality = "ultra";
const DEFAULT_ASPECT: AspectRatio = "16:9";
const DEFAULT_RESOLUTION: ImageResolution = "4K";

function normalizeMode(value?: string): DisplayMode {
  const allowed: DisplayMode[] = [
    "modal",
    "subliminal",
    "peripheral",
    "corruption",
    "afterimage",
    "glitch_scatter",
    "creep",
  ];
  return allowed.includes(value as DisplayMode) ? (value as DisplayMode) : DEFAULT_MODE;
}

function normalizeQuality(value?: string): ImageQuality {
  if (value === "fast" || value === "high" || value === "ultra") return value;
  return DEFAULT_QUALITY;
}

function normalizeAspect(value?: string): AspectRatio {
  const allowed: AspectRatio[] = [
    "1:1",
    "2:3",
    "3:2",
    "3:4",
    "4:3",
    "4:5",
    "5:4",
    "9:16",
    "16:9",
    "21:9",
  ];
  return allowed.includes(value as AspectRatio) ? (value as AspectRatio) : DEFAULT_ASPECT;
}

function normalizeResolution(value?: string): ImageResolution | undefined {
  if (value === "1K" || value === "2K" || value === "4K") return value;
  return undefined;
}

function normalizeIntensity(value: unknown): number {
  const n = Number(value);
  if (Number.isNaN(n)) return 1;
  return Math.max(0, Math.min(1, n));
}

function sanitizeMomentContent(content: string): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.startsWith("{") && normalized.includes('"tool"')) return "";
  if (
    /\b(nano banana|gemini(?:-|\s*)\d|google search|prompting guide|image generation docs?|model selection)\b/i.test(
      normalized
    )
  ) {
    return "";
  }

  return normalized
    .replace(/\[(?:[A-Z0-9+_\-: %|.]{3,80}|CLICK TO DISMISS)\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 260);
}

function summarizeObjectDetail(obj: any): string {
  const name = typeof obj?.name === "string" ? obj.name.trim() : String(obj?.id || "object");
  const description =
    typeof obj?.description === "string"
      ? obj.description.replace(/\s+/g, " ").trim().slice(0, 260)
      : "";
  return description ? `${name}: ${description}` : name;
}

function normalizeTextAnchor(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/^[:\-–—\s]+/, "")
    .replace(/\s+$/, "")
    .slice(0, 120);
}

function firstSentence(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  const match = normalized.match(/^(.+?[.!?])(?:\s|$)/);
  const candidate = match?.[1] || normalized;
  return candidate.replace(/[.!?]+$/, "").trim();
}

function extractQuotedAnchors(source: string): string[] {
  const matches: string[] = [];
  const quotePattern = /["“]([^"”]{2,120})["”]/g;
  let match: RegExpExecArray | null;
  while ((match = quotePattern.exec(source)) !== null) {
    const normalized = normalizeTextAnchor(match[1] || "");
    if (normalized.length >= 2) {
      matches.push(normalized);
    }
  }
  return matches;
}

function extractDiegeticTextAnchors(input: {
  roomDescription: string;
  visibleObjectDetails: string[];
  recentMoments: string[];
  playerFocus?: string;
}): string[] {
  const textObjectKeywords =
    /\b(note|sticky|post-?it|poster|comic|page|screen|monitor|label|graffiti|writing|text|words?|sign|sticker|paper|newspaper|book)\b/i;

  const candidates: string[] = [];
  const sources = [
    input.roomDescription,
    ...input.visibleObjectDetails,
    ...input.recentMoments,
    input.playerFocus || "",
  ].filter(Boolean);

  for (const source of sources) {
    candidates.push(...extractQuotedAnchors(source));

    if (textObjectKeywords.test(source)) {
      const colonIdx = source.indexOf(":");
      if (colonIdx > -1 && colonIdx < source.length - 1) {
        const rhs = normalizeTextAnchor(firstSentence(source.slice(colonIdx + 1)));
        if (rhs.length >= 3) {
          candidates.push(rhs);
        }
      }

      const readsMatch = source.match(
        /\b(?:reads?|says?|written|spells?|shows?|display(?:s|ed)?|screams?|warns?|writes?)\b[:\s-]+([^.,;]{2,200})/i
      );
      if (readsMatch?.[1]) {
        const phrase = normalizeTextAnchor(firstSentence(readsMatch[1]));
        if (phrase.length >= 2) {
          candidates.push(phrase);
        }
      }
    }
  }

  const blockedPatterns = [
    /click to dismiss/i,
    /^querying logos ledger/i,
    /^signal stability/i,
    /^logos status/i,
    /\bnano banana\b/i,
    /\bgemini(?:-|\s*)\d\b/i,
    /\bimage generation\b/i,
  ];

  const seen = new Set<string>();
  const anchors: string[] = [];
  for (const candidate of candidates) {
    const normalized = normalizeTextAnchor(candidate);
    if (!normalized) continue;
    if (blockedPatterns.some((p) => p.test(normalized))) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    anchors.push(normalized);
    if (anchors.length >= 10) break;
  }

  return anchors;
}

function shouldAllowDiegeticText(body: RenderRequestBody, anchors: string[]): boolean {
  if (body.allowText === true) return true;
  if (anchors.length === 0) return false;
  const focus = `${body.prompt || ""} ${body.style || ""}`.toLowerCase();
  return /\b(note|sticky|post-?it|poster|comic|page|screen|monitor|label|graffiti|writing|text|word|sign)\b/.test(
    focus
  );
}

async function getRecentMoments(sessionId: string): Promise<string[]> {
  const messages: Array<{ role: string; content: string }> = await prisma.gameMessage.findMany({
    where: { gameSessionId: sessionId },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { role: true, content: true },
  });

  return messages
    .reverse()
    .map((msg: { role: string; content: string }) => {
      const sanitized = sanitizeMomentContent(msg.content);
      if (!sanitized) return "";
      if (msg.role === "user") return `Player action: ${sanitized}`;
      if (msg.role === "assistant") return `World response: ${sanitized}`;
      return `Context event: ${sanitized}`;
    })
    .filter((line: string) => line.trim().length > 0);
}

function collectPuzzleSnapshots(worldPuzzles: any[], enginePuzzles: any[]): RenderPuzzleSnapshot[] {
  const seen = new Set<string>();
  const merged: RenderPuzzleSnapshot[] = [];

  for (const puzzle of enginePuzzles || []) {
    const id = String(puzzle.id || "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    merged.push({
      id,
      name: String(puzzle.name || puzzle.id || "unknown puzzle"),
      hint: typeof puzzle.hint === "string" ? puzzle.hint : undefined,
      solved: Boolean(puzzle.solved),
    });
  }

  for (const puzzle of worldPuzzles || []) {
    const id = String(puzzle.id || puzzle.name || "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    merged.push({
      id,
      name: String(puzzle.name || puzzle.id || "unknown puzzle"),
      hint: typeof puzzle.hint === "string" ? puzzle.hint : undefined,
      solved: Boolean(puzzle.solved),
    });
  }

  return merged;
}

async function appendRenderHistory(sessionId: string, entry: RenderHistoryEntry): Promise<void> {
  const session = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    select: { gameState: true },
  });

  const gameState = (session?.gameState && typeof session.gameState === "object"
    ? (session.gameState as Record<string, any>)
    : {}) as Record<string, any>;

  const historyRaw = Array.isArray(gameState.renderHistory) ? gameState.renderHistory : [];
  const history = [...historyRaw, entry].slice(-MAX_RENDER_HISTORY);

  await prisma.gameSession.update({
    where: { id: sessionId },
    data: {
      gameState: {
        ...gameState,
        renderHistory: history,
      },
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RenderRequestBody;
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const session = await getSessionById(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const quality = normalizeQuality(body.quality);
    const aspectRatio = normalizeAspect(body.aspectRatio);
    const resolution = normalizeResolution(body.resolution) || DEFAULT_RESOLUTION;
    const mode = normalizeMode(body.mode);
    const intensity = normalizeIntensity(body.intensity);
    const preset = resolveRenderStylePreset(
      typeof body.preset === "string" ? body.preset.trim().toLowerCase() : undefined
    );

    const [engine, sessionWorld, dbRecentMoments] = await Promise.all([
      getOrCreateGameState(sessionId),
      getSessionWorld(sessionId),
      getRecentMoments(sessionId),
    ]);

    const requestMoments = Array.isArray(body.contextSnippets)
      ? body.contextSnippets
          .map((line) => sanitizeMomentContent(String(line || "")))
          .filter(Boolean)
          .slice(-6)
          .map((line) => `Immediate context: ${line}`)
      : [];

    const recentMoments = [...dbRecentMoments, ...requestMoments].slice(-12);

    const state = engine.getState();
    const room = engine.getCurrentRoom();
    const roomId = room?.id;
    const roomName = room?.name || "Unknown";
    const region = room?.region || "Unknown";
    const roomDescription = room?.description || "No description available.";

    const visibleObjects = (room?.objects || [])
      .map((objId: string) => engine.getObject(objId))
      .filter(Boolean)
      .filter((obj: any) => !obj?.customState?.hidden)
      .map((obj: any) => String(obj.name || obj.id));
    const visibleObjectDetails = (room?.objects || [])
      .map((objId: string) => engine.getObject(objId))
      .filter(Boolean)
      .filter((obj: any) => !obj?.customState?.hidden)
      .map((obj: any) => summarizeObjectDetail(obj));

    const diegeticTextAnchors = extractDiegeticTextAnchors({
      roomDescription,
      visibleObjectDetails,
      recentMoments,
      playerFocus: body.prompt,
    });
    const allowDiegeticText = shouldAllowDiegeticText(body, diegeticTextAnchors);

    const inventory = (state.inventory || [])
      .map((objId: string) => engine.getObject(objId))
      .filter(Boolean)
      .map((obj: any) => String(obj.name || obj.id));

    const puzzleSnapshots = collectPuzzleSnapshots(
      (sessionWorld as any)?.puzzles || [],
      engine.getAllPuzzles()
    );
    const clueHint = body.injectClue
      ? choosePuzzleClue(puzzleSnapshots, state.puzzlesSolved || [])
      : undefined;

    const prompt = buildSceneRenderPrompt({
      roomId,
      roomName,
      region,
      roomDescription,
      visibleObjects,
      visibleObjectDetails,
      diegeticTextAnchors,
      allowDiegeticText,
      inventory,
      recentMoments,
      playerFocus: body.prompt,
      styleHint: body.style?.trim()
        ? `${preset.stylePrompt} ${body.style.trim()}`
        : preset.stylePrompt,
      clueHint,
    });

    const image = await generateImageAsset({
      prompt,
      quality,
      aspectRatio,
      resolution,
      referenceImages: body.referenceImages,
    });

    const renderId = `render-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const historyEntry: RenderHistoryEntry = {
      id: renderId,
      createdAt: new Date().toISOString(),
      roomId,
      roomName,
      region,
      quality,
      aspectRatio,
      resolution,
      mode,
      intensity,
      model: image.model,
      referencesUsed: image.referencesUsed,
      preset: preset.id,
      prompt: body.prompt?.trim() ? body.prompt.trim() : undefined,
      clueInjected: Boolean(clueHint),
    };

    await appendRenderHistory(sessionId, historyEntry).catch((error) => {
      console.warn("[render] Failed to append render history", error);
    });

    const responseBody = new Uint8Array(image.buffer);
    return new NextResponse(responseBody, {
      headers: {
        "Content-Type": image.mimeType,
        "Cache-Control": "private, max-age=0, no-store",
        "X-Render-Id": renderId,
        "X-Render-Model": image.model,
        "X-Render-Mode": mode,
        "X-Render-Intensity": String(intensity),
        "X-Render-Room": roomName,
        "X-Render-References-Used": String(image.referencesUsed),
        "X-Render-Clue-Injected": clueHint ? "1" : "0",
        "X-Render-Preset": preset.id,
      },
    });
  } catch (error) {
    console.error("[render] POST failed", error);
    return NextResponse.json(
      {
        error: "Failed to render scene",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const limitParam = Number(searchParams.get("limit") || "25");
  const limit = Number.isNaN(limitParam) ? 25 : Math.max(1, Math.min(200, limitParam));

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const session = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    select: { gameState: true },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const gameState = (session.gameState as Record<string, any>) || {};
  const history = Array.isArray(gameState.renderHistory) ? gameState.renderHistory : [];
  const recent = history.slice(-limit).reverse();

  return NextResponse.json({
    sessionId,
    count: recent.length,
    renders: recent,
  });
}
