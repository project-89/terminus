import { BaseScreen } from "./BaseScreen";
import { TERMINAL_COLORS } from "../Terminal";
import { getAdventureResponse } from "@/app/lib/ai/adventureAI";
import { TerminalContext } from "../TerminalContext";
import {
  generateCLIResponse,
  generateOneOffResponse,
} from "@/app/lib/ai/prompts";
import { analytics } from "@/app/lib/analytics";

interface SavedGameSession {
  messages: { role: string; content: string }[];
  timestamp: number;
  name: string;
}

export class AdventureScreen extends BaseScreen {
  private introText = `
TERMINAL v0.1.2 - STANDARD TEXT INTERFACE
ESTABLISHING CONNECTION...`.trim();

  async render(): Promise<void> {
    console.log("AdventureScreen render called");

    // Set cursor options
    this.terminal.setCursorOptions({
      centered: false,
      leftPadding: 10,
    });

    // Clear any existing game messages when starting fresh
    const context = TerminalContext.getInstance();
    if (!context.getGameMessages().length) {
      context.setGameMessages([]);
    }

    // Print intro text
    await this.terminal.print(this.introText, {
      color: TERMINAL_COLORS.primary,
      speed: "fast",
    });

    // Print welcome message
    await this.terminal.print(
      "\nWelcome to Project 89. Reality is an illusion, and this terminal is your key to unlocking its secrets.",
      {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      }
    );

    await this.terminal.print("\nHere's the basics:", {
      color: TERMINAL_COLORS.primary,
      speed: "fast",
    });

    // Print basic commands
    const commands = [
      "LOOK: To see your surroundings.",
      "EXAMINE [object]: To inspect something closely.",
      "TAKE [object]: To pick something up.",
      "WAIT: To let time pass, or to see if anything changes.",
      "GO [direction]: To move around.",
      "TALK TO [person]: To start a conversation.",
      "ASK [person] ABOUT [topic]: To learn more.",
      "BECOME [concept]: To merge with an idea.",
      "FOCUS ON [object]: To concentrate your awareness.",
    ];

    for (const cmd of commands) {
      await this.terminal.print(`- ${cmd}`, {
        color: TERMINAL_COLORS.secondary,
        speed: "fast",
      });
    }

    await this.terminal.print(
      "\nRemember, unexpected outcomes are expected. Type 'help' if you get stuck. Good luck, Agent.",
      {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      }
    );

    // Print initial prompt
    await this.terminal.print("\n> 00000===-000", {
      color: TERMINAL_COLORS.primary,
      speed: "fast",
    });

    // Enable command handling
    this.terminal.setFullAccess(true);
  }

  async cleanup(): Promise<void> {
    await this.terminal.clear();
  }

  // Add new methods for save/load functionality
  public async processCommand(command: string): Promise<boolean> {
    return this.handleSpecialCommands(command);
  }

  private async handleSpecialCommands(command: string): Promise<boolean> {
    // Special commands start with !
    if (!command.startsWith("!")) return false;

    const [cmd, ...args] = command.slice(1).split(" ");
    const saveName = args.join(" ") || "default";

    switch (cmd.toLowerCase()) {
      case "save":
        await this.saveGame(saveName);
        return true;
      case "load":
        await this.loadGame(saveName);
        return true;
      case "new":
        await this.newGame();
        return true;
      case "list":
        await this.listSaves();
        return true;
      default:
        return false;
    }
  }

  private async saveGame(name: string) {
    const context = TerminalContext.getInstance();
    const currentSession: SavedGameSession = {
      messages: context.getGameMessages() || [],
      timestamp: Date.now(),
      name,
    };

    // Get existing saves
    const saves = this.getSavedGames();
    saves[name] = currentSession;

    // Save to localStorage
    localStorage.setItem("p89_saved_games", JSON.stringify(saves));

    // Track save game action
    analytics.trackGameSave(name);

    await this.terminal.print(`Game saved as "${name}"`, {
      color: TERMINAL_COLORS.success,
      speed: "fast",
    });
  }

  private async loadGame(name: string) {
    const saves = this.getSavedGames();
    const save = saves[name];

    if (!save) {
      await this.terminal.print(`No save found with name "${name}"`, {
        color: TERMINAL_COLORS.error,
        speed: "fast",
      });
      return;
    }

    // Load messages into context
    const context = TerminalContext.getInstance();
    context.setGameMessages(save.messages);

    await this.terminal.print(
      `Loaded save "${name}" from ${new Date(save.timestamp).toLocaleString()}`,
      {
        color: TERMINAL_COLORS.success,
        speed: "fast",
      }
    );

    // Print the last message to show current game state
    if (save.messages.length > 0) {
      const lastMessage = save.messages[save.messages.length - 1];
      await this.terminal.print(lastMessage.content, {
        color: TERMINAL_COLORS.primary,
        speed: "fast",
      });
    }

    // Track load game action
    analytics.trackGameLoad(name);
  }

  private async newGame() {
    const context = TerminalContext.getInstance();
    context.setGameMessages([]);

    await this.terminal.print("Starting new game...", {
      color: TERMINAL_COLORS.success,
      speed: "fast",
    });

    // Re-render initial game state
    await this.render();
  }

  private async listSaves() {
    const saves = this.getSavedGames();
    const saveNames = Object.entries(saves);

    if (saveNames.length === 0) {
      await this.terminal.print("No saved games found", {
        color: TERMINAL_COLORS.warning,
        speed: "fast",
      });
      return;
    }

    await this.terminal.print("Saved games:", {
      color: TERMINAL_COLORS.primary,
      speed: "fast",
    });

    for (const [name, save] of saveNames) {
      await this.terminal.print(
        `  ${name} - ${new Date(save.timestamp).toLocaleString()}`,
        {
          color: TERMINAL_COLORS.secondary,
          speed: "fast",
        }
      );
    }
  }

  private getSavedGames(): Record<string, SavedGameSession> {
    const saves = localStorage.getItem("p89_saved_games");
    return saves ? JSON.parse(saves) : {};
  }
}
