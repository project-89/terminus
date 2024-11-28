import { CommandConfig } from "../types";
import { TerminalContext } from "../../TerminalContext";
import { TERMINAL_COLORS } from "../../Terminal";
import { analytics } from "@/app/lib/analytics";

interface SavedGameSession {
  messages: { role: string; content: string }[];
  timestamp: number;
  name: string;
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

  const context = TerminalContext.getInstance();
  context.setGameMessages(save.messages);

  await ctx.terminal.print(
    `Loaded save "${name}" from ${new Date(save.timestamp).toLocaleString()}`,
    {
      color: TERMINAL_COLORS.success,
      speed: "fast",
    }
  );

  if (save.messages.length > 0) {
    const lastMessage = save.messages[save.messages.length - 1];
    await ctx.terminal.print(lastMessage.content, {
      color: TERMINAL_COLORS.primary,
      speed: "fast",
    });
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
