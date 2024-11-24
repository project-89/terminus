import { TerminalMiddleware, TERMINAL_COLORS } from "../Terminal";
import { TerminalContext } from "../TerminalContext";
import { AdventureScreen } from "../screens/AdventureScreen";
import { analytics } from "@/app/lib/analytics";

interface SavedGameSession {
  messages: { role: string; content: string }[];
  timestamp: number;
  name: string;
}

export const adventureCommandsMiddleware: TerminalMiddleware = async (
  ctx,
  next
) => {
  console.log("Advneture middleware!!");
  // Only process commands if we're in the adventure screen
  const currentScreen = ctx.terminal.context.router?.currentScreen;
  if (!(currentScreen instanceof AdventureScreen)) {
    return next();
  }

  // Handle special commands that start with !
  if (ctx.command.startsWith("!")) {
    const [cmd, ...args] = ctx.command.slice(1).split(" ");
    const saveName = args.join(" ") || "default";

    switch (cmd.toLowerCase()) {
      case "save":
        await saveGame(ctx, saveName);
        ctx.handled = true;
        return;
      case "load":
        await loadGame(ctx, saveName);
        ctx.handled = true;
        return;
      case "new":
        await newGame(ctx);
        ctx.handled = true;
        return;
      case "list":
        await listSaves(ctx);
        ctx.handled = true;
        return;
    }
  }

  // If not a special command, continue to next middleware
  await next();
};

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

async function newGame(ctx: any) {
  const context = TerminalContext.getInstance();
  context.setGameMessages([]);

  await ctx.terminal.print("Starting new game...", {
    color: TERMINAL_COLORS.success,
    speed: "fast",
  });

  // Re-render initial game state
  const currentScreen = ctx.terminal.context.router?.currentScreen;
  if (currentScreen instanceof AdventureScreen) {
    await currentScreen.render();
  }
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
