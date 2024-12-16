import { BaseScreen } from "./BaseScreen";
import { Terminal } from "../Terminal";

export class WelcomeScreen extends BaseScreen {
  constructor(context: { terminal: Terminal }) {
    super(context);
  }

  async render(): Promise<void> {
    await this.terminal.clear();

    await this.terminal.print("Welcome to Project 89 Terminal Interface");
    await this.terminal.print("");
    await this.terminal.print("Available commands:");
    await this.terminal.print("  archive - Access the data vault");
    await this.terminal.print("  help    - Show this help message");
    await this.terminal.print("  clear   - Clear the terminal");
    await this.terminal.print("");
    await this.terminal.print("Type 'help' for more information.");
  }

  async cleanup(): Promise<void> {
    await super.cleanup();
    await this.terminal.clear();
  }
}
