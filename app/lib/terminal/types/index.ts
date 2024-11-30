import { Terminal } from "../Terminal";
import { TerminalOptions } from "./options";

export * from "./options";

export type TerminalContext = {
  command: string;
  args: string[];
  flags: Record<string, any>;
  terminal: Terminal;
  error?: string;
  handled?: boolean;
  [key: string]: any;
};

export type TerminalMiddleware = (
  ctx: TerminalContext,
  next: () => Promise<void>
) => Promise<void>;

export type MiddlewareType = "system" | "screen" | "adventure" | "fallback";

export interface MiddlewareConfig {
  type: MiddlewareType;
  priority: number;
  middleware: TerminalMiddleware;
}

export interface CommandConfig {
  name: string;
  type: "system" | "adventure";
  description: string;
  handler: (ctx: TerminalContext) => Promise<void>;
  blockProcessing?: boolean;
  hidden?: boolean;
}
