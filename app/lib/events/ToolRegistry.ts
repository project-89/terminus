import { z } from "zod";

// Define the schema for tool parameters with descriptions
export const ToolSchemas = {
  system: {
    notification: z.object({
      message: z
        .string()
        .describe("The text content of the notification to display."),
      level: z
        .enum(["info", "warning", "error", "success"])
        .describe(
          "The severity level of the notification, affecting its appearance and behavior."
        ),
      duration: z
        .number()
        .optional()
        .describe(
          "How long to show the notification in milliseconds. Defaults to 3000ms."
        ),
    }),
    error: z.object({
      message: z.string().describe("Main error message to display."),
      code: z
        .string()
        .optional()
        .describe("Error code for categorizing the type of error."),
      severity: z
        .enum(["low", "medium", "high", "critical"])
        .optional()
        .describe(
          "How severe the error is, affecting visual and behavioral response."
        ),
    }),
  },
} as const;

// Enhanced tool descriptions with more context and use cases
export const ToolDescriptions = {
  "system:notification": {
    description:
      "Displays a notification message to the user with configurable severity levels and duration. Used for system alerts, feedback, and important updates.",
    examples: [
      "Show success message: { message: 'Operation completed', level: 'success', duration: 3000 }",
      "Show warning alert: { message: 'Low memory warning', level: 'warning' }",
      "Show error notification: { message: 'Connection failed', level: 'error', duration: 5000 }",
    ],
    contextualUse: [
      "Provide user feedback for actions",
      "Alert users to system status changes",
      "Display operation results",
    ],
  },

  "system:error": {
    description:
      "Handles system errors with different severity levels and optional error codes. Provides structured error reporting and appropriate visual feedback.",
    examples: [
      "Show critical error: { message: 'System crash detected', severity: 'critical', code: 'SYS_001' }",
      "Show minor error: { message: 'Cache miss', severity: 'low' }",
      "Show medium severity: { message: 'Network timeout', severity: 'medium', code: 'NET_002' }",
    ],
    contextualUse: [
      "System error handling",
      "Network failure notifications",
      "Security alert reporting",
    ],
  },
} as const;

// Type for all available tool names
export type ToolName = keyof typeof ToolSchemas;

// Modified type for tool registration
type ToolRegistration = {
  schema: z.ZodType<any>;
  description: string;
  examples: readonly string[];
};

// Registry to manage tool registrations and subscriptions
export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, ToolRegistration>;
  private subscribers: Map<string, Set<(args: any) => void>>;

  constructor() {
    this.tools = new Map();
    this.subscribers = new Map();
    this.initializeTools();
  }

  public static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  private initializeTools() {
    Object.entries(ToolSchemas).forEach(([category, tools]) => {
      Object.entries(tools).forEach(([name, schema]) => {
        const toolKey = `${category}:${name}`;
        const description =
          ToolDescriptions[toolKey as keyof typeof ToolDescriptions];

        if (!description) {
          throw new Error(
            `Missing description for tool: ${toolKey}. All tools must have descriptions.`
          );
        }

        this.tools.set(toolKey, {
          schema,
          description: description.description,
          examples: description.examples,
        });
      });
    });
  }

  public subscribe(toolName: string, callback: (args: any) => void) {
    if (!this.subscribers.has(toolName)) {
      this.subscribers.set(toolName, new Set());
    }
    this.subscribers.get(toolName)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(toolName)?.delete(callback);
    };
  }

  public async emit(toolName: string, args: any) {
    const validatedArgs = this.validateToolCall(toolName, args);
    const subscribers = this.subscribers.get(toolName);

    if (subscribers) {
      const promises = Array.from(subscribers).map((callback) =>
        Promise.resolve(callback(validatedArgs))
      );
      await Promise.all(promises);
    }
  }

  public getToolDefinitions() {
    const definitions: Record<
      string,
      {
        description: string;
        parameters: z.ZodType<any>;
      }
    > = {};

    this.tools.forEach((tool, name) => {
      definitions[name] = {
        description: `${tool.description}\nExamples:\n${tool.examples.join(
          "\n"
        )}`,
        parameters: tool.schema,
      };
    });

    return definitions;
  }

  public validateToolCall(name: string, args: unknown) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }
    return tool.schema.parse(args);
  }

  public getAvailableTools(): string[] {
    return Array.from(this.tools.keys());
  }

  public getToolDetails(name: string): ToolRegistration | undefined {
    return this.tools.get(name);
  }
}
