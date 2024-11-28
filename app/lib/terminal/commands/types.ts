import { Terminal } from "../Terminal";

export interface TerminalContext {
  command: string;
  args: string[];
  flags: Record<string, any>;
  terminal: Terminal;
  error?: string;
  handled?: boolean;
  [key: string]: any;
}

export interface CommandConfig {
  name: string;
  type: "system" | "adventure" | "game";
  description: string;
  handler: (ctx: TerminalContext) => Promise<void>;
  hidden?: boolean;
}

export interface CommandRegistry {
  registerCommand: (command: CommandConfig) => void;
  registerCommands: (commands: CommandConfig[]) => void;
  getCommand: (name: string) => CommandConfig | undefined;
  getCommands: (type?: string) => CommandConfig[];
  clearCommands: () => void;
}
