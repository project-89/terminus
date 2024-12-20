import { Terminal } from "../Terminal";
import { EventEmitter } from "../eventSystem";
import { analytics } from "@/app/lib/analytics";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<
    string,
    {
      type: string;
      description: string;
    }
  >;
}

export interface ToolExecution {
  tool: string;
  parameters: Record<string, any>;
}

// Central event emitter for tool executions
export const toolEvents = new EventEmitter();

// Registry of available tools
export const toolRegistry = new Map<string, ToolDefinition>();

// Register a tool definition
export function registerTool(tool: ToolDefinition) {
  toolRegistry.set(tool.name, tool);
}

// Process tool execution from AI
export async function processToolCall(toolData: ToolExecution): Promise<void> {
  const { tool, parameters } = toolData;

  // Track tool execution
  analytics.trackToolExecution(tool, parameters);

  toolEvents.emit(`tool:${tool}`, parameters);
}
