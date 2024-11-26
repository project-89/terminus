import { BaseScreen, ScreenContext } from "./BaseScreen";
import { TERMINAL_COLORS, TerminalMiddleware } from "../Terminal";
import { getAdventureResponse } from "@/app/lib/ai/adventureAI";
import { TerminalContext } from "../TerminalContext";
import {
  generateCLIResponse,
  generateOneOffResponse,
} from "@/app/lib/ai/prompts";
import { analytics } from "@/app/lib/analytics";
import { adventureCommandsMiddleware } from "../middleware/adventure-commands";
import { adventureMiddleware } from "../middleware/adventure";

export class AdventureScreen extends BaseScreen {
  private introText = `
TERMINAL v0.1.2 - STANDARD TEXT INTERFACE
ESTABLISHING CONNECTION...`.trim();

  constructor(context: ScreenContext) {
    super(context);

    // Convert terminal middleware to screen middleware
    const adaptMiddleware = (terminalMiddleware: TerminalMiddleware) => {
      return async (command: string, next: () => Promise<void>) => {
        // Create terminal context from command
        const ctx = {
          command,
          args: command.split(" "),
          terminal: this.terminal,
          handled: false,
          flags: {},
        };

        // Run terminal middleware with adapted context
        await terminalMiddleware(ctx, next);
      };
    };

    // Register adapted middlewares
    this.use(adaptMiddleware(adventureCommandsMiddleware));
    this.use(adaptMiddleware(adventureMiddleware));
  }

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
    for (const line of this.introText.split("\n")) {
      await this.terminal.print(line, {
        color: TERMINAL_COLORS.primary,
        speed: "normal",
      });
    }

    await this.terminal.print("\n", { speed: "instant" });

    // Check for returning user
    const { walletConnected, walletAddress, lastSeen } = context.getState();

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

    // Enable command handling
    this.terminal.setCommandAccess(true);
  }

  async cleanup(): Promise<void> {
    // Disable command handling when cleaning up
    this.terminal.setCommandAccess(false);
    await this.terminal.clear();
  }
}
