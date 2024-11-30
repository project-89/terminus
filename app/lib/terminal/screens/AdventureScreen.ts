import { BaseScreen, ScreenContext } from "./BaseScreen";
import { TERMINAL_COLORS } from "../Terminal";
import type { TerminalContext } from "../types/index";
import { TerminalContext as GameContext } from "../TerminalContext";
import { toolEvents } from "../tools/registry";
import { systemCommandsMiddleware } from "../middleware/system";
import { overrideMiddleware } from "../middleware/override";
import { adventureMiddleware } from "../middleware/adventure";
import { adventureCommands } from "../commands/adventure";
import { WalletService } from "../../wallet/WalletService";
import { generateCLIResponse, generateOneOffResponse } from "../../ai/prompts";

export class AdventureScreen extends BaseScreen {
  private introText = `
TERMINAL v0.1.2 - STANDARD TEXT INTERFACE
ESTABLISHING CONNECTION...`.trim();

  constructor(context: ScreenContext) {
    super(context);

    // Register middleware in order of priority
    this.registerMiddleware(systemCommandsMiddleware);
    this.registerMiddleware(overrideMiddleware);
    this.registerMiddleware(adventureMiddleware);

    // Register screen-specific commands
    this.registerCommands([
      ...adventureCommands,
      {
        name: "!help",
        type: "system",
        description: "Show available commands",
        handler: async (ctx: TerminalContext) => {
          await this.showHelp();
        },
      },
      {
        name: "!clear",
        type: "system",
        description: "Clear terminal display",
        handler: async (ctx: TerminalContext) => {
          await this.terminal.clear();
        },
      },
      {
        name: "!home",
        type: "system",
        description: "Return to home screen",
        handler: async (ctx: TerminalContext) => {
          await this.terminal.emit("screen:transition", { to: "home" });
        },
      },
    ]);
  }

  private async showHelp() {
    const systemCommands = this.commandRegistry.getCommands("system");
    if (systemCommands.length > 0) {
      await this.terminal.print("\nSystem Commands:", {
        color: TERMINAL_COLORS.system,
        speed: "fast",
      });

      for (const cmd of systemCommands) {
        await this.terminal.print(
          `  ${cmd.name.padEnd(12)} - ${cmd.description}`,
          {
            color: TERMINAL_COLORS.primary,
            speed: "fast",
          }
        );
      }
    }

    const gameCommands = this.commandRegistry.getCommands("game");
    if (gameCommands.length > 0) {
      await this.terminal.print("\nGame Commands:", {
        color: TERMINAL_COLORS.system,
        speed: "fast",
      });

      for (const cmd of gameCommands) {
        await this.terminal.print(
          `  ${cmd.name.padEnd(12)} - ${cmd.description}`,
          {
            color: TERMINAL_COLORS.primary,
            speed: "fast",
          }
        );
      }
    }
  }

  private triggerMatrixRain() {
    toolEvents.emit("tool:matrix_rain", {
      duration: 5000, // 5 seconds
      intensity: 0.8, // High intensity
    });
  }

  private triggerGlitch() {
    toolEvents.emit("tool:glitch_screen", {
      duration: 3000, // 3 seconds
      intensity: 0.7, // Medium-high intensity
    });
  }

  public async processCommand(command: string): Promise<void> {
    const context = GameContext.getInstance();

    // Store user command
    context.addGameMessage({
      role: "user",
      content: command,
    });

    // Handle special commands
    if (command.toLowerCase() === "matrix") {
      this.triggerMatrixRain();
      return;
    }

    if (command.toLowerCase() === "glitch") {
      this.triggerGlitch();
      return;
    }

    try {
      const response = await fetch("/api/adventure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: context.getGameMessages(),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to get adventure response");
      }

      // Process the response and store it
      const content = await this.terminal.processAIStream(response.body);
      if (content) {
        context.addGameMessage({
          role: "assistant",
          content: content,
        });
      }
    } catch (error) {
      console.error("Error processing command:", error);
      await this.terminal.print("Error processing command. Please try again.", {
        color: TERMINAL_COLORS.error,
      });
    }
  }

  async render(): Promise<void> {
    console.log("AdventureScreen render called");

    // Set cursor options
    this.terminal.setCursorOptions({
      centered: false,
      leftPadding: 10,
    });

    // Get terminal context
    const context = GameContext.getInstance();
    const { walletConnected, walletAddress, lastSeen } = context.getState();

    // Clear any existing game messages when starting fresh
    if (!context.getGameMessages().length) {
      context.setGameMessages([
        {
          role: "assistant",
          content: this.introText,
        },
      ]);
    }

    // Print intro text
    for (const line of this.introText.split("\n")) {
      await this.terminal.print(line, {
        color: TERMINAL_COLORS.primary,
        speed: "normal",
      });
    }

    await this.terminal.print("\n", { speed: "instant" });

    // Check for returning user with wallet
    if (walletConnected && walletAddress) {
      // Verify wallet is still connected
      const walletService = new WalletService();
      try {
        await walletService.connect();
        const balance = await walletService.checkTokenBalance();

        // Update balance in context
        context.setState({
          tokenBalance: balance,
          lastSeen: new Date(),
        });

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
        await generateCLIResponse(prompt, this.terminal, { addSpacing: false });
      } catch (error) {
        console.error("Failed to restore wallet connection:", error);
        // Clear wallet state if reconnection fails
        context.setState({
          walletConnected: false,
          walletAddress: undefined,
          lastSeen: undefined,
        });
      }
    } else {
      // Regular new user flow
      await generateOneOffResponse(
        "Before the game starts, print out a short introduction about the Project and its purpose, and on how to play the text adventure, but DO NOT use weird characters like [object].  Commands are listed with CAPS. You don't need to explain everything.  Show commands as a list with a short description of the command.  Enough to get them started. Interject a couple commands which are ontological and hyperstitial in nature. Do not simulate the text adventure until you receive the first command after this.",
        this.terminal,
        {
          addSpacing: false,
        }
      );
    }

    // Enable command handling
    this.terminal.setCommandAccess(true);
  }

  async cleanup(): Promise<void> {
    this.terminal.setCommandAccess(false);
    await this.terminal.clear();
  }
}
