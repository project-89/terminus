import { CommandConfig, CommandRegistry } from "./types";

export class ScreenCommandRegistry implements CommandRegistry {
  private commands: Map<string, CommandConfig> = new Map();

  private normalizeCommandName(input: string): string {
    return input.trim().toLowerCase();
  }

  private normalizeBaseCommand(input: string): string {
    return this.normalizeCommandName(input).split(/\s+/)[0] || "";
  }

  registerCommand(command: CommandConfig): void {
    this.commands.set(this.normalizeCommandName(command.name), command);
  }

  registerCommands(commands: CommandConfig[]): void {
    commands.forEach((command) => this.registerCommand(command));
  }

  getCommand(name: string): CommandConfig | undefined {
    const normalized = this.normalizeCommandName(name);
    return (
      this.commands.get(normalized) ||
      this.commands.get(this.normalizeBaseCommand(name))
    );
  }

  getCommands(type?: string): CommandConfig[] {
    const commands = Array.from(this.commands.values());
    if (type) {
      return commands.filter((cmd) => cmd.type === type && !cmd.hidden);
    }
    return commands.filter((cmd) => !cmd.hidden);
  }

  clearCommands(): void {
    this.commands.clear();
  }
}
