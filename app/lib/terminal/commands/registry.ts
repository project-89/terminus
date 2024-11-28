import { CommandConfig, CommandRegistry } from "./types";

export class ScreenCommandRegistry implements CommandRegistry {
  private commands: Map<string, CommandConfig> = new Map();

  registerCommand(command: CommandConfig): void {
    this.commands.set(command.name, command);
  }

  registerCommands(commands: CommandConfig[]): void {
    commands.forEach((command) => this.registerCommand(command));
  }

  getCommand(name: string): CommandConfig | undefined {
    return this.commands.get(name);
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
