import { BaseScreen } from "./BaseScreen";
import { TERMINAL_COLORS } from "../Terminal";

export class WelcomeScreen extends BaseScreen {
  private warningBanner = `
╔════════════════════════════ ! WARNING ! ════════════════════════════╗
║                                                                     ║
║     AUTHORIZED PERSONNEL ONLY - QUANTUM REALITY MANIPULATION        ║
║          UNAUTHORIZED ACCESS WILL FRAGMENT YOUR CONSCIOUSNESS       ║
║                                                                     ║
║        ◢█◣    PROJECT 89 CLASSIFIED ACCESS POINT    ◢█◣             ║
║        ◥█◤          PROCEED WITH CAUTION            ◥█◤             ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝`.trim();

  async render(): Promise<void> {
    // Add more padding to the cursor
    this.terminal.setCursorOptions({
      centered: false,
      leftPadding: 30,
    });

    // Show warning banner with red color
    await this.printCentered(this.warningBanner.split("\n"), {
      startFromCenter: true,
    });

    // Use router's setTimeout
    await new Promise<void>((resolve) => this.setTimeout(resolve, 3000));

    // Clear screen
    await this.terminal.clear();

    // Show access verification
    await this.printCentered([
      "INITIATING SECURITY PROTOCOLS",
      "VERIFYING ACCESS CREDENTIALS",
      "SCANNING NEURAL PATTERNS",
      "...",
      "ACCESS GRANTED",
    ]);

    // Ensure we wait a bit before transitioning
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      // Add debug logging
      console.log("Attempting transition to scanning screen");
      await this.transition("scanning", { type: "instant" }); // Changed to instant for debugging
      console.log("Transition completed");
    } catch (error) {
      console.error("Error during transition:", error);
    }
  }

  async cleanup(): Promise<void> {
    console.log("Welcome screen cleanup");
    await this.terminal.clear();
  }
}
