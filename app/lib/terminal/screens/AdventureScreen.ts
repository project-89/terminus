import { BaseScreen } from "./BaseScreen";
import { TERMINAL_COLORS } from "../Terminal";
import { getAdventureResponse } from "@/app/lib/ai/adventureAI";

export class AdventureScreen extends BaseScreen {
  private introText = `
TERMINAL v0.1.2 - STANDARD TEXT INTERFACE
ESTABLISHING CONNECTION...`.trim();

  private chatHistory: { role: string; content: string }[] = [];

  async render(): Promise<void> {
    // Set cursor to left-aligned with small padding
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

    // Add a blank line before AI response
    await this.terminal.print("", { speed: "instant" });

    try {
      // Add initial prompt to chat history
      this.chatHistory.push({
        role: "user",
        content:
          "Before the game starts, print out a short, user friendly message to someone on how to play the text adventure, but DO NOT use weird characters like [object].  Commands are listed with CAPS. You don't need to explain everything, just the basics as a list.  Enough to get them started. Interject a couple commands which are ontological and hyperstitial in nature. Make this casual. Do not simulate the text adventure until you receive the first command after this.",
      });

      // Get initial AI response
      const stream = await getAdventureResponse(this.chatHistory);
      if (!stream) {
        throw new Error("Failed to get AI response");
      }

      // Use the new helper method
      const responseText = await this.terminal.processAIStream(stream, {
        color: TERMINAL_COLORS.primary,
        addSpacing: false,
      });

      console.log("responseText", responseText);

      // Add AI response to history
      this.chatHistory.push({
        role: "assistant",
        content: responseText,
      });

      // Add final spacing
      await this.terminal.print("", { speed: "instant" });
    } catch (error) {
      console.error("Error getting initial AI response:", error);
      await this.terminal.print(
        "\nERROR: Connection interference detected...",
        {
          color: TERMINAL_COLORS.error,
          speed: "normal",
        }
      );
    }
  }

  async cleanup(): Promise<void> {
    await this.terminal.clear();
  }
}
