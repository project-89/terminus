import { Terminal } from "../Terminal";
import { CommandConfig } from "../types/options";
import { TERMINAL_COLORS } from "../constants";

export class CommandHandler {
  private static commandRegistry: Map<string, CommandConfig> = new Map();

  constructor(private terminal: Terminal) {}

  public static registerCommand(command: CommandConfig) {
    CommandHandler.commandRegistry.set(command.name, command);
  }

  public static registerCommands(commands: CommandConfig[]) {
    commands.forEach((command) =>
      CommandHandler.commandRegistry.set(command.name, command)
    );
  }

  public static getCommand(name: string): CommandConfig | undefined {
    return CommandHandler.commandRegistry.get(name);
  }

  public static getCommands(type?: "system" | "adventure"): CommandConfig[] {
    const commands = Array.from(CommandHandler.commandRegistry.values());
    if (type) {
      return commands.filter((cmd) => cmd.type === type && !cmd.hidden);
    }
    return commands.filter((cmd) => !cmd.hidden);
  }

  public async processCommand(command: string) {
    const normalizedCommand = command.trim();
    if (!normalizedCommand) {
      return;
    }

    await this.terminal.print(`> ${normalizedCommand}`, {
      color: this.terminal.options.foregroundColor,
      speed: "instant",
    });

    if (this.terminal.context?.currentScreen) {
      try {
        await this.terminal.context.currentScreen.handleCommand({
          command: normalizedCommand,
          args: normalizedCommand.split(/\s+/),
          flags: {},
          terminal: this.terminal,
          handled: false,
        });
      } catch (error: any) {
        await this.terminal.print(`System Error: ${error.message}`, {
          color: TERMINAL_COLORS.error,
          speed: "normal",
        });
      }
    }
  }

  public isCommandHandled(command: string): boolean {
    if (command.startsWith("!")) return true;
    const cmd = CommandHandler.commandRegistry.get(command);
    return cmd?.blockProcessing === true;
  }

  public async showHelp() {
    const systemCommands = CommandHandler.getCommands("system");
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

    const adventureCommands = CommandHandler.getCommands("adventure");
    if (adventureCommands.length > 0) {
      await this.terminal.print("\nAdventure Commands:", {
        color: TERMINAL_COLORS.system,
        speed: "fast",
      });

      for (const cmd of adventureCommands) {
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
}
