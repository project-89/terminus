import { BaseScreen } from "./BaseScreen";
import { TERMINAL_COLORS } from "../Terminal";
import { getAdventureResponse } from "@/app/lib/ai/adventureAI";
import { TerminalContext } from "../TerminalContext";
import {
  generateCLIResponse,
  generateOneOffResponse,
} from "@/app/lib/ai/prompts";

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
}
