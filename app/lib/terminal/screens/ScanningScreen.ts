import { BaseScreen } from "./BaseScreen";
import { TERMINAL_COLORS } from "../Terminal";

export class ScanningScreen extends BaseScreen {
  private scanningSequence = [
    { text: "SCANNING NEURAL SIGNATURE...", delay: 1000 },
    { text: "ANALYZING QUANTUM RESONANCE...", delay: 1200 },
    { text: "VERIFYING REALITY ANCHOR STATUS...", delay: 800 },
    { text: "AGENT BIOSIGNATURE DETECTED", delay: 1500 },
    { text: "CLEARANCE LEVEL: OMEGA-3", delay: 1000 },
    { text: "INITIALIZING SECURE QUANTUM LINK...", delay: 2000 },
  ];

  async render(): Promise<void> {
    // Show initial status
    await this.printCentered([
      "QUANTUM INTERFACE ACTIVE",
      "BEGINNING SYSTEM SCAN",
      "",
      "█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█",
      "█ NEURAL LINK ENGAGED █",
      "█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█",
      "",
    ]);

    // Process each scanning message with dynamic delays
    for (const { text, delay } of this.scanningSequence) {
      await this.terminal.print(this.centerText(text), {
        color: TERMINAL_COLORS.system,
        speed: "normal",
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Show completion message
    await this.printCentered([
      "",
      "SCAN COMPLETE - PROCEEDING TO CONSENT VERIFICATION",
      "LOADING NEUROLINGUISTIC INTERFACE...",
    ]);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Use event emission for screen transition
    await this.terminal.emit("screen:transition", { to: "consent" });
  }

  async cleanup(): Promise<void> {
    await this.terminal.clear();
  }
}
