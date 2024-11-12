import { BaseScreen } from "./BaseScreen";
import { TERMINAL_COLORS } from "../Terminal";

export class AdventureScreen extends BaseScreen {
  private introText = `
TERMINAL v0.1.2 - STANDARD TEXT INTERFACE
ESTABLISHING CONNECTION...

You find yourself in a dimly lit room, the soft hum of ancient machinery 
filling the air. A single terminal glows with an eerie cyan light, its 
screen flickering with mysterious symbols.

Type your commands to interact with the world.`.trim();

  async render(): Promise<void> {
    // Set cursor to dynamic mode with left padding
    this.terminal.setCursorOptions({
      centered: false,
      leftPadding: 10,
      mode: "dynamic",
    });

    // Print intro text
    for (const line of this.introText.split("\n")) {
      await this.terminal.print(line, {
        color: TERMINAL_COLORS.primary,
        speed: "normal",
      });
    }

    // Add a blank line before cursor
    await this.terminal.print("", {
      speed: "instant",
    });
  }

  async cleanup(): Promise<void> {
    await this.terminal.clear();
  }
}
