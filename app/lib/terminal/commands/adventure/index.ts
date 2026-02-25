import { CommandConfig } from "../types";
import { TerminalContext } from "../../TerminalContext";
import { TERMINAL_COLORS } from "../../Terminal";
import { analytics } from "@/app/lib/analytics";
import { toolEvents } from "../../tools/registry";
import {
  DEFAULT_RENDER_STYLE_PRESET,
  listRenderStylePresets,
  resolveRenderStylePreset,
  type RenderStylePresetId,
} from "@/app/lib/render/stylePresets";
import {
  getRenderReferences,
  pushRenderReference,
} from "@/app/lib/render/clientRenderReferences";

interface SavedGameSession {
  messages: { role: string; content: string }[];
  timestamp: number;
  name: string;
}

type RenderMode =
  | "modal"
  | "subliminal"
  | "peripheral"
  | "corruption"
  | "afterimage"
  | "glitch_scatter"
  | "creep";

type RenderQuality = "fast" | "high" | "ultra";
type RenderAspectRatio =
  | "1:1"
  | "2:3"
  | "3:2"
  | "3:4"
  | "4:3"
  | "4:5"
  | "5:4"
  | "9:16"
  | "16:9"
  | "21:9";
type RenderResolution = "1K" | "2K" | "4K";

type ParsedRenderCommand = {
  prompt?: string;
  style?: string;
  preset: RenderStylePresetId;
  mode: RenderMode;
  quality: RenderQuality;
  aspectRatio: RenderAspectRatio;
  resolution: RenderResolution;
  intensity: number;
  injectClue: boolean;
  includeReferences: boolean;
  floatingPov: boolean;
};

const MAX_SENT_RENDER_REFERENCES = 2;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toRenderMode(value: string): RenderMode | undefined {
  const allowed: RenderMode[] = [
    "modal",
    "subliminal",
    "peripheral",
    "corruption",
    "afterimage",
    "glitch_scatter",
    "creep",
  ];
  return allowed.includes(value as RenderMode) ? (value as RenderMode) : undefined;
}

function toRenderQuality(value: string): RenderQuality | undefined {
  if (value === "fast" || value === "high" || value === "ultra") return value;
  return undefined;
}

function toRenderAspect(value: string): RenderAspectRatio | undefined {
  const allowed: RenderAspectRatio[] = [
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
  return allowed.includes(value as RenderAspectRatio)
    ? (value as RenderAspectRatio)
    : undefined;
}

function toRenderResolution(value: string): RenderResolution | undefined {
  if (value === "1K" || value === "2K" || value === "4K") return value;
  return undefined;
}

function parseRenderCommand(command: string): ParsedRenderCommand {
  const tokens = command.trim().split(/\s+/).slice(1);
  const promptTokens: string[] = [];

  let mode: RenderMode = "modal";
  let preset: RenderStylePresetId = DEFAULT_RENDER_STYLE_PRESET;
  let quality: RenderQuality = "ultra";
  let aspectRatio: RenderAspectRatio = "16:9";
  let resolution: RenderResolution = "4K";
  let intensity = 1;
  let style: string | undefined;
  let injectClue = false;
  let includeReferences = true;
  let floatingPov = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token.startsWith("--")) {
      promptTokens.push(token);
      continue;
    }

    const [rawKey, inlineValue] = token.slice(2).split("=", 2);
    const key = rawKey.toLowerCase();
    const hasInlineValue = inlineValue !== undefined;
    const nextValue = !hasInlineValue ? tokens[i + 1] : undefined;
    const value = hasInlineValue ? inlineValue : nextValue;
    const consumeNext = !hasInlineValue && typeof nextValue === "string" && !nextValue.startsWith("--");

    if (consumeNext) i += 1;

    switch (key) {
      case "mode": {
        const parsed = value ? toRenderMode(value.toLowerCase()) : undefined;
        if (parsed) mode = parsed;
        break;
      }
      case "preset": {
        if (!value) break;
        const normalized = value.toLowerCase();
        const resolved = resolveRenderStylePreset(normalized);
        preset = resolved.id;
        break;
      }
      case "quality": {
        const parsed = value ? toRenderQuality(value.toLowerCase()) : undefined;
        if (parsed) quality = parsed;
        break;
      }
      case "aspect":
      case "aspectratio": {
        const parsed = value ? toRenderAspect(value) : undefined;
        if (parsed) aspectRatio = parsed;
        break;
      }
      case "size":
      case "resolution": {
        const parsed = value ? toRenderResolution(value.toUpperCase()) : undefined;
        if (parsed) resolution = parsed;
        break;
      }
      case "intensity": {
        if (value) intensity = clamp(Number(value), 0, 1);
        break;
      }
      case "style": {
        if (value) style = value;
        break;
      }
      case "clue":
      case "clues":
      case "inject-clue":
        injectClue = true;
        break;
      case "no-clues":
        injectClue = false;
        break;
      case "refs":
      case "reference":
      case "references":
        includeReferences = true;
        break;
      case "no-refs":
      case "norefs":
        includeReferences = false;
        break;
      case "pov":
      case "floating-pov":
        floatingPov = true;
        break;
      default:
        // Ignore unknown flags so users can iterate quickly.
        break;
    }
  }

  const prompt = promptTokens.join(" ").trim() || undefined;
  const cameraStyle = floatingPov
    ? "first-person floating camera POV, bodiless viewpoint, no visible hands, arms, or body"
    : undefined;
  const mergedStyle = [style, cameraStyle].filter(Boolean).join(" ").trim() || undefined;
  return {
    prompt,
    style: mergedStyle,
    preset,
    mode,
    quality,
    aspectRatio,
    resolution,
    intensity: Number.isFinite(intensity) ? intensity : 1,
    injectClue,
    includeReferences,
    floatingPov,
  };
}

// Helper functions
async function saveGame(ctx: any, name: string) {
  const context = TerminalContext.getInstance();
  const currentSession: SavedGameSession = {
    messages: context.getGameMessages() || [],
    timestamp: Date.now(),
    name,
  };

  const saves = getSavedGames();
  saves[name] = currentSession;
  localStorage.setItem("p89_saved_games", JSON.stringify(saves));

  analytics.trackGameSave(name);

  await ctx.terminal.print(`Game saved as "${name}"`, {
    color: TERMINAL_COLORS.success,
    speed: "fast",
  });
}

async function loadGame(ctx: any, name: string) {
  const saves = getSavedGames();
  const save = saves[name];

  if (!save) {
    await ctx.terminal.print(`No save found with name "${name}"`, {
      color: TERMINAL_COLORS.error,
      speed: "fast",
    });
    return;
  }

  // Clear terminal first
  await ctx.terminal.clear();

  const context = TerminalContext.getInstance();
  context.setGameMessages(save.messages);

  await ctx.terminal.print(
    `Loading save "${name}" from ${new Date(
      save.timestamp
    ).toLocaleString()}...`,
    {
      color: TERMINAL_COLORS.system,
      speed: "fast",
    }
  );

  // Replay all messages in the conversation
  for (const message of save.messages) {
    if (message.role === "user") {
      await ctx.terminal.print(`> ${message.content}`, {
        color: TERMINAL_COLORS.secondary,
        speed: "instant",
      });
    } else {
      await ctx.terminal.print(message.content, {
        color: TERMINAL_COLORS.primary,
        speed: "instant",
      });
    }
    // Add a small spacing between messages
    await ctx.terminal.print("", { speed: "instant" });
  }

  analytics.trackGameLoad(name);
}

async function listSaves(ctx: any) {
  const saves = getSavedGames();
  const saveNames = Object.entries(saves);

  if (saveNames.length === 0) {
    await ctx.terminal.print("No saved games found", {
      color: TERMINAL_COLORS.warning,
      speed: "fast",
    });
    return;
  }

  await ctx.terminal.print("Saved games:", {
    color: TERMINAL_COLORS.primary,
    speed: "fast",
  });

  for (const [name, save] of saveNames) {
    await ctx.terminal.print(
      `  ${name} - ${new Date(save.timestamp).toLocaleString()}`,
      {
        color: TERMINAL_COLORS.secondary,
        speed: "fast",
      }
    );
  }
}

function getSavedGames(): Record<string, SavedGameSession> {
  const saves = localStorage.getItem("p89_saved_games");
  return saves ? JSON.parse(saves) : {};
}

// Adventure screen commands
export const adventureCommands: CommandConfig[] = [
  {
    name: "!render",
    type: "game",
    description: "Render the current scene as an image overlay",
    handler: async (ctx) => {
      const terminalContext = TerminalContext.getInstance();
      await terminalContext.ensureIdentity();
      const handle = terminalContext.ensureHandle("agent");
      const sessionId = await terminalContext.ensureSession({ handle, reset: false });

      if (!sessionId) {
        await ctx.terminal.print("Unable to establish session for scene render.", {
          color: TERMINAL_COLORS.error,
          speed: "normal",
        });
        return;
      }

      const parsed = parseRenderCommand(ctx.command);
      const referenceImages = parsed.includeReferences
        ? getRenderReferences(sessionId, MAX_SENT_RENDER_REFERENCES)
        : [];

      await ctx.terminal.print("\n[RENDERING CURRENT SCENE...]", {
        color: TERMINAL_COLORS.system,
        speed: "fast",
      });

      try {
        const response = await fetch("/api/render", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            prompt: parsed.prompt,
            style: parsed.style,
            preset: parsed.preset,
            mode: parsed.mode,
            quality: parsed.quality,
            aspectRatio: parsed.aspectRatio,
            resolution: parsed.resolution,
            intensity: parsed.intensity,
            injectClue: parsed.injectClue,
            referenceImages,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || "Render failed");
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        const mode = parsed.mode;
        if (mode === "modal") {
          await ctx.terminal.printInlineImage(imageUrl, {
            label: parsed.prompt || "scene continuity",
          });
        } else {
          const position =
            mode === "peripheral"
              ? "edge"
              : mode === "glitch_scatter"
              ? "random"
              : "center";

          toolEvents.emit("tool:display_image", {
            url: imageUrl,
            mode,
            intensity: parsed.intensity,
            position,
          });
        }

        await pushRenderReference(sessionId, blob, parsed.prompt || "scene continuity");

        await ctx.terminal.print(
          `[SCENE RENDERED: ${mode.toUpperCase()} | ${parsed.aspectRatio} | ${parsed.quality} | ${parsed.preset}${parsed.floatingPov ? " | floating-pov" : ""}]`,
          {
            color: TERMINAL_COLORS.success,
            speed: "fast",
          }
        );
      } catch (error: any) {
        await ctx.terminal.print(`Render failed: ${error.message}`, {
          color: TERMINAL_COLORS.error,
          speed: "normal",
        });
      }
    },
  },
  {
    name: "!render-presets",
    type: "game",
    description: "List available render style presets",
    handler: async (ctx) => {
      const presets = listRenderStylePresets();
      await ctx.terminal.print("\nAVAILABLE RENDER PRESETS:", {
        color: TERMINAL_COLORS.system,
        speed: "fast",
      });
      for (const preset of presets) {
        const suffix = preset.id === DEFAULT_RENDER_STYLE_PRESET ? " [default]" : "";
        await ctx.terminal.print(`  ${preset.id}${suffix}`, {
          color: TERMINAL_COLORS.primary,
          speed: "fast",
        });
        await ctx.terminal.print(`    ${preset.description}`, {
          color: TERMINAL_COLORS.secondary,
          speed: "fast",
        });
      }
      await ctx.terminal.print(
        "\nUsage: !render what is under the bed --preset matrix90s --pov",
        {
          color: TERMINAL_COLORS.system,
          speed: "fast",
        }
      );
    },
  },
  {
    name: "!renders",
    type: "game",
    description: "List recent scene renders for this session",
    handler: async (ctx) => {
      const terminalContext = TerminalContext.getInstance();
      const handle = terminalContext.ensureHandle("agent");
      const sessionId = await terminalContext.ensureSession({ handle, reset: false });
      if (!sessionId) {
        await ctx.terminal.print("No active session.", {
          color: TERMINAL_COLORS.warning,
          speed: "fast",
        });
        return;
      }

      try {
        const response = await fetch(`/api/render?sessionId=${encodeURIComponent(sessionId)}&limit=10`);
        if (!response.ok) throw new Error("Failed to load render history");
        const data = await response.json();
        const renders = Array.isArray(data.renders) ? data.renders : [];

        if (renders.length === 0) {
          await ctx.terminal.print("No scene renders recorded for this session yet.", {
            color: TERMINAL_COLORS.warning,
            speed: "fast",
          });
          return;
        }

        await ctx.terminal.print("\nRECENT SCENE RENDERS:", {
          color: TERMINAL_COLORS.system,
          speed: "fast",
        });

        for (const item of renders) {
          const timestamp = item.createdAt
            ? new Date(item.createdAt).toLocaleTimeString()
            : "unknown";
          const room = item.roomName || "Unknown room";
          const fmt = `${item.aspectRatio || "?"}/${item.resolution || "?"}`;
          const mode = item.mode || "modal";
          await ctx.terminal.print(
            `  ${timestamp}  ${room}  ${mode}  ${fmt}${item.clueInjected ? "  [clue]" : ""}`,
            {
              color: TERMINAL_COLORS.secondary,
              speed: "fast",
            }
          );
        }
      } catch (error: any) {
        await ctx.terminal.print(`Failed to load renders: ${error.message}`, {
          color: TERMINAL_COLORS.error,
          speed: "fast",
        });
      }
    },
  },
  {
    name: "!save",
    type: "game",
    description: "Save current game state",
    handler: async (ctx) => {
      const [_, ...args] = ctx.command.split(" ");
      const saveName = args.join(" ") || "default";
      await saveGame(ctx, saveName);
    },
  },
  {
    name: "!load",
    type: "game",
    description: "Load a saved game",
    handler: async (ctx) => {
      const [_, ...args] = ctx.command.split(" ");
      const saveName = args.join(" ") || "default";
      await loadGame(ctx, saveName);
    },
  },
  {
    name: "!list",
    type: "game",
    description: "List saved games",
    handler: async (ctx) => {
      await listSaves(ctx);
    },
  },
];
