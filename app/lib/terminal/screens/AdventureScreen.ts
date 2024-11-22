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

    // Print intro text
    for (const line of this.introText.split("\n")) {
      await this.terminal.print(line, {
        color: TERMINAL_COLORS.primary,
        speed: "normal",
      });
    }

    await this.terminal.print("", { speed: "instant" });

    // Check for returning user
    const context = TerminalContext.getInstance();
    const { walletConnected, walletAddress, lastSeen } = context.getState();

    console.log("CHECKING WALLET", walletConnected, walletAddress, lastSeen);
    if (walletConnected && walletAddress) {
      // Generate welcome back message

      const prompt = `Returning user detected. Wallet ${walletAddress.slice(
        0,
        6
      )}...${walletAddress.slice(
        -4
      )} has returned after last connecting on ${new Date(
        lastSeen!
      ).toLocaleDateString()}
      
      Generate a welcome back message for the agent. It should be one paragraph, warm, and cryptic.  Do not mention the wallet address, and do not mention missions.  It is a personal welcome message. It should be cryptic.  Do NOT end with the shell environment input.
      `;

      console.log("PROMPT", prompt);

      await generateCLIResponse(prompt, this.terminal, {
        addSpacing: false,
      });
    } else {
      // Regular new user flow
      await generateOneOffResponse(
        "Before the game starts, print out a short, user friendly message to someone on how to play the text adventure, but DO NOT use weird characters like [object].  Commands are listed with CAPS. You don't need to explain everything, just the basics as a list.  Enough to get them started. Interject a couple commands which are ontological and hyperstitial in nature. Make this casual. Do not simulate the text adventure until you receive the first command after this.",
        this.terminal,
        {
          addSpacing: false,
        }
      );
    }
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
