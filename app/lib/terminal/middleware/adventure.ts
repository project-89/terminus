import { TERMINAL_COLORS } from "../constants";
import { getAdventureResponse } from "@/app/lib/ai/adventureAI";
import { toolEvents } from "../tools/registry";
import { AdventureScreen } from "../screens/AdventureScreen";
import { TerminalContext } from "../TerminalContext";
import {
  TerminalMiddleware,
  TerminalContext as CommandContext,
} from "../types";
import {
  getRenderReferences,
  pushRenderReference,
} from "@/app/lib/render/clientRenderReferences";

type AutoRenderIntent =
  | {
      kind: "room";
      prompt: string;
      allowText: false;
      key: "room";
      quality: "high";
      resolution: "2K";
      style: string;
      label: string;
    }
  | {
      kind: "focus";
      prompt: string;
      allowText: boolean;
      key: string;
      quality: "ultra";
      resolution: "4K";
      style: string;
      label: string;
    };

type AutoRenderCooldownState = {
  roomLastRenderedAt: number;
  targetLastRenderedAt: Map<string, number>;
};

const ROOM_RENDER_COOLDOWN_MS = 45_000;
const TARGET_RENDER_COOLDOWN_MS = 20_000;
const MAX_TRACKED_TARGETS = 24;

const autoRenderCooldownBySession = new Map<string, AutoRenderCooldownState>();

const VISUAL_COMMAND_RE = /^(look|examine|inspect|read|study|observe|check)\b/i;
const ROOM_LOOK_RE =
  /^(look|examine|inspect|observe)(?:\s+(?:around|room|here|surroundings|area|everything))?$/i;
const TEXT_FOCUS_RE =
  /\b(note|sticky|post-?it|poster|comic|page|book|journal|screen|monitor|label|graffiti|writing|text|word|sign|newspaper|document|letter)\b/i;
const VISUAL_FOCUS_RE =
  /\b(under|behind|inside|room|window|wall|desk|bed|shelf|door|monitor|screen|computer|poster|book|comic|note|map|photo|painting)\b/i;
const NON_VISUAL_FOCUS_RE =
  /\b(inventory|status|trust|score|points|ledger|mission|objective|profile|memory|log|logs|stats)\b/i;
const BAD_COMMAND_RESPONSE_RE =
  /\b(i don'?t understand that command|unknown command|invalid command|not sure what you mean)\b/i;

function normalizeCommand(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeFocusTarget(value: string): string {
  return value
    .replace(/^(at|the|a|an|to|into|inside|in|on|under|behind)\s+/i, "")
    .replace(/[^\w\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function parseAutoRenderIntent(rawCommand: string): AutoRenderIntent | null {
  const command = normalizeCommand(rawCommand);
  if (!command || !VISUAL_COMMAND_RE.test(command)) return null;

  if (ROOM_LOOK_RE.test(command)) {
    return {
      kind: "room",
      prompt:
        "Render an environmental establishing shot of the full current room. Preserve layout continuity and include room-defining anchors from the described scene.",
      allowText: false,
      key: "room",
      quality: "high",
      resolution: "2K",
      style:
        "wide cinematic frame, floating observer camera, no visible hands, arms, or player body, grounded physical textures and practical lighting",
      label: "room continuity",
    };
  }

  const verbMatch = command.match(VISUAL_COMMAND_RE);
  const verb = verbMatch?.[1]?.toLowerCase() || "";
  const remainder = normalizeFocusTarget(command.replace(VISUAL_COMMAND_RE, ""));
  if (!remainder) {
    return {
      kind: "room",
      prompt:
        "Render an environmental establishing shot of the full current room. Preserve layout continuity and include room-defining anchors from the described scene.",
      allowText: false,
      key: "room",
      quality: "high",
      resolution: "2K",
      style:
        "wide cinematic frame, floating observer camera, no visible hands, arms, or player body, grounded physical textures and practical lighting",
      label: "room continuity",
    };
  }

  if (NON_VISUAL_FOCUS_RE.test(remainder)) {
    return null;
  }

  const allowText = verb === "read" || TEXT_FOCUS_RE.test(remainder);
  const isVisualFocus = allowText || VISUAL_FOCUS_RE.test(remainder);
  if (!isVisualFocus && remainder.split(" ").length > 5) {
    return null;
  }

  return {
    kind: "focus",
    prompt:
      `Render a grounded close-up focused on "${remainder}". Keep it in the same room context and preserve continuity with surrounding props, walls, and lighting.${
        allowText
          ? " If the focus has writing, reproduce exact in-world text from scene context."
          : ""
      }`,
    allowText,
    key: remainder.toLowerCase(),
    quality: "ultra",
    resolution: "4K",
    style:
      "tight insert shot with cinematic depth and high-fidelity detail, floating observer camera, no visible hands, arms, or player body",
    label: remainder,
  };
}

function shouldRenderForIntent(sessionId: string, intent: AutoRenderIntent): boolean {
  const now = Date.now();
  const state = autoRenderCooldownBySession.get(sessionId) || {
    roomLastRenderedAt: 0,
    targetLastRenderedAt: new Map<string, number>(),
  };

  if (intent.kind === "room") {
    if (now - state.roomLastRenderedAt < ROOM_RENDER_COOLDOWN_MS) {
      return false;
    }
    state.roomLastRenderedAt = now;
    autoRenderCooldownBySession.set(sessionId, state);
    return true;
  }

  const last = state.targetLastRenderedAt.get(intent.key) || 0;
  if (now - last < TARGET_RENDER_COOLDOWN_MS) {
    return false;
  }

  state.targetLastRenderedAt.set(intent.key, now);
  if (state.targetLastRenderedAt.size > MAX_TRACKED_TARGETS) {
    const firstKey = state.targetLastRenderedAt.keys().next().value;
    if (firstKey) {
      state.targetLastRenderedAt.delete(firstKey);
    }
  }
  autoRenderCooldownBySession.set(sessionId, state);
  return true;
}

function collectContextSnippets(ctx: CommandContext, maxLines = 10): string[] {
  const blocked =
    /(CLICK TO DISMISS|VISUAL MANIFESTATION|IMAGE RECEIVED|RENDERING CURRENT SCENE|QUERYING LOGOS LEDGER|^>\s*!?\w+)/i;

  return (ctx.terminal.buffer || [])
    .map((entry) => String(entry?.text || "").trim())
    .filter((line) => line.length > 0)
    .filter((line) => !blocked.test(line))
    .slice(-maxLines)
    .map((line) => line.slice(0, 220));
}

async function maybeAutoRenderScene(
  ctx: CommandContext,
  sessionId: string,
  command: string,
  aiResponse: string,
  aiTriggeredImageTool: boolean
): Promise<void> {
  if (aiTriggeredImageTool) return;
  if (BAD_COMMAND_RESPONSE_RE.test(aiResponse)) return;

  const intent = parseAutoRenderIntent(command);
  if (!intent) return;
  if (!shouldRenderForIntent(sessionId, intent)) return;

  try {
    const response = await fetch("/api/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        prompt: intent.prompt,
        style: intent.style,
        preset: "matrix90s",
        mode: "modal",
        quality: intent.quality,
        aspectRatio: "16:9",
        resolution: intent.resolution,
        intensity: 1,
        allowText: intent.allowText,
        contextSnippets: collectContextSnippets(ctx),
        referenceImages: getRenderReferences(sessionId),
        injectClue: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`render failed (${response.status})`);
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    await pushRenderReference(sessionId, blob, intent.label);

    await ctx.terminal.printInlineImage(imageUrl, {
      label: intent.label,
    });
  } catch (error) {
    console.warn("[Adventure] Auto-render skipped due to failure", error);
  }
}

export const adventureMiddleware: TerminalMiddleware = async (
  ctx: CommandContext,
  next: () => Promise<void>
) => {
  // Only process commands if we're in the adventure screen
  const currentScreen = ctx.terminal.context?.currentScreen;
  if (!(currentScreen instanceof AdventureScreen)) {
    return next();
  }

  // Skip if command was already handled (like by override middleware)
  if (ctx.handled || ctx.command.startsWith("!")) {
    return next();
  }

  // Skip empty commands (can happen from race conditions or duplicate calls)
  if (!ctx.command || !ctx.command.trim()) {
    console.log("[Adventure] Skipping empty command");
    return next();
  }

  // Track that we're handling this command
  ctx.handled = true;

  try {
    const context = TerminalContext.getInstance();
    // Ensure identity is established before getting handle
    await context.ensureIdentity();
    const handle = context.ensureHandle("agent");
    // IMPORTANT: Pass reset: false to reuse existing session, not create new one
    const sessionId = await context.ensureSession({ handle, reset: false });
    if (!sessionId) {
      await ctx.terminal.print("Failed to establish session with the Logos.", {
        color: TERMINAL_COLORS.error,
        speed: "normal",
      });
      ctx.handled = true;
      return;
    }

    const state = context.getState();
    let chatHistory = context.getGameMessages();
    const userMessage = {
      role: "user",
      content: ctx.command,
    };

    let reportSummary: string | null = null;

    if (state.expectingReport) {
      if (!state.activeMissionRunId) {
        await ctx.terminal.print(
          "The Logos expected a mission run, but none is active.",
          {
            color: TERMINAL_COLORS.warning,
            speed: "normal",
          }
        );
      } else {
        try {
          const response = await fetch("/api/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              missionRunId: state.activeMissionRunId,
              content: ctx.command,
            }),
          });
          if (!response.ok) {
            throw new Error(`Report failed (${response.status})`);
          }
          const result = await response.json();

          // Only clear mission state if actually completed or failed
          // If status is still ACCEPTED, mission needs more evidence
          const isFinished = result.status === "COMPLETED" || result.status === "FAILED";
          if (isFinished) {
            context.setExpectingReport(false);
            context.setActiveMissionRun(undefined);
            await ctx.terminal.print("Mission report received.", {
              color: TERMINAL_COLORS.system,
              speed: "normal",
            });
          } else {
            // Mission still active - insufficient evidence
            context.setExpectingReport(true);
            await ctx.terminal.print("Report received but requires more detail.", {
              color: TERMINAL_COLORS.warning,
              speed: "normal",
            });
          }

          if (result.feedback) {
            await ctx.terminal.print(result.feedback, {
              color: TERMINAL_COLORS.secondary,
              speed: "normal",
            });
          }
          if (isFinished && typeof result.score === "number") {
            await ctx.terminal.print(
              `Score: ${(result.score * 100).toFixed(0)}%`,
              {
                color: TERMINAL_COLORS.system,
                speed: "fast",
              }
            );
          }
          if (result.reward) {
            await ctx.terminal.print(
              `Reward: ${result.reward.amount} ${result.reward.type}`,
              {
                color: TERMINAL_COLORS.primary,
                speed: "fast",
              }
            );
          }

          const scorePercent =
            typeof result.score === "number"
              ? `${Math.round(result.score * 100)}%`
              : "N/A";
          if (isFinished) {
            reportSummary = `Mission report submitted. Status ${result.status}. Score ${scorePercent}. Reward ${
              result.reward?.amount ?? 0
            } ${result.reward?.type ?? "CREDIT"}.`;
          } else {
            reportSummary = "Mission report incomplete. Awaiting additional evidence.";
          }
        } catch (error: any) {
          console.error("report submission failed", error);
          await ctx.terminal.print(
            `Failed to submit report: ${error.message}`,
            {
              color: TERMINAL_COLORS.error,
              speed: "normal",
            }
          );
        }
      }
    }

    // Add user message to history
    chatHistory.push(userMessage);

    if (reportSummary) {
      chatHistory.push({
        role: "system",
        content: reportSummary,
      });
    }

    // Start loading animation BEFORE the API call
    ctx.terminal.startGeneration();

    // Get AI response
    const stream = await getAdventureResponse(chatHistory, {
      sessionId,
      handle,
      userId: state.userId,
      activeMissionRunId: context.getState().activeMissionRunId,
      reportJustSubmitted: Boolean(reportSummary),
      accessTier: state.accessTier ?? 0,
      hasFullAccess: Boolean(state.hasFullAccess),
    });
    if (!stream) {
      throw new Error("Failed to get adventure response");
    }

    // Process and store the AI response
    let aiTriggeredImageTool = false;
    const markImageToolInvocation = () => {
      aiTriggeredImageTool = true;
    };
    toolEvents.on("tool:generate_image", markImageToolInvocation);
    toolEvents.on("tool:stego_image", markImageToolInvocation);

    let aiResponse = "";
    try {
      aiResponse = await ctx.terminal.processAIStream(stream);
    } finally {
      toolEvents.off("tool:generate_image", markImageToolInvocation);
      toolEvents.off("tool:stego_image", markImageToolInvocation);
    }

    // Add AI response to chat history
    chatHistory.push({
      role: "assistant",
      content: aiResponse,
    });

    // Update chat history with both messages
    context.setGameMessages(chatHistory);

    // CRITICAL: Sync messages to database immediately (don't rely on reconnect)
    try {
      const syncRes = await fetch("/api/session", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          messages: chatHistory,
        }),
      });
      if (!syncRes.ok) {
        if (syncRes.status === 404) {
          // Session doesn't exist - clear cached sessionId so next command creates a new one
          console.warn("[Adventure] Session not found during sync, clearing cached sessionId");
          context.setSessionId(undefined);
        } else {
          console.error("[Adventure] Sync failed:", syncRes.status);
        }
      }
    } catch (syncError) {
      console.error("[Adventure] Failed to sync messages to server:", syncError);
    }

    // Check identity status periodically and show prompts
    const identityStatus = await context.checkIdentityStatus();
    if (identityStatus?.promptIdentityLock && identityStatus.narrative) {
      await ctx.terminal.print(identityStatus.narrative, {
        color: TERMINAL_COLORS.warning,
        speed: "normal",
      });
    }

    await maybeAutoRenderScene(
      ctx,
      sessionId,
      ctx.command,
      aiResponse,
      aiTriggeredImageTool
    );
  } catch (error) {
    console.error("Adventure middleware error:", error);
    // Ensure loading indicator is stopped on error
    ctx.terminal.endGeneration();
    await ctx.terminal.print("Error processing command", {
      color: TERMINAL_COLORS.error,
      speed: "fast",
    });
  }
};
