import { useEffect } from "react";
import { ToolRegistry } from "./ToolRegistry";

// Define all possible event types
export type UIEvent =
  // System Events
  | { type: "system:notification"; payload: NotificationPayload }
  | { type: "system:error"; payload: ErrorPayload }
  | { type: "system:status"; payload: StatusPayload }
  // User Events
  | { type: "user:login"; payload: UserPayload }
  | { type: "user:logout"; payload?: never };

// Payload types
export type NotificationPayload = {
  message: string;
  level: "info" | "warning" | "error" | "success";
};

export type ErrorPayload = {
  message: string;
  code?: string;
  details?: unknown;
};

export type StatusPayload = {
  status: "online" | "offline" | "maintenance";
  message?: string;
};

export type UserPayload = {
  id: string;
  role: "AGENT" | "ADMIN";
};

type EventCallback<T extends UIEvent> = (event: T) => void;

export class EventSystem {
  private static instance: EventSystem;
  private subscribers: Map<UIEvent["type"], EventCallback<any>[]>;
  private toolRegistry: ToolRegistry;

  private constructor() {
    this.subscribers = new Map();
    this.toolRegistry = ToolRegistry.getInstance();
  }

  public static getInstance(): EventSystem {
    if (!EventSystem.instance) {
      EventSystem.instance = new EventSystem();
    }
    return EventSystem.instance;
  }

  public subscribe<T extends UIEvent>(
    type: T["type"],
    callback: EventCallback<T>
  ) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, []);
    }
    this.subscribers.get(type)?.push(callback);

    return () => {
      const callbacks = this.subscribers.get(type);
      const index = callbacks?.indexOf(callback) ?? -1;
      if (index > -1) {
        callbacks?.splice(index, 1);
      }
    };
  }

  public emit<T extends UIEvent>(event: T) {
    // Validate tool calls using the registry
    if (event.type.includes(":")) {
      this.toolRegistry.validateToolCall(event.type, event.payload);
    }

    const callbacks = this.subscribers.get(event.type) as EventCallback<T>[];
    callbacks?.forEach((callback) => callback(event));
  }

  // Get tool definitions for AI
  public getToolDefinitions() {
    return this.toolRegistry.getToolDefinitions();
  }
}

// React hook for subscribing to events
export function useUIEvent<T extends UIEvent>(
  type: T["type"],
  callback: EventCallback<T>
) {
  useEffect(() => {
    const eventSystem = EventSystem.getInstance();
    return eventSystem.subscribe(type, callback);
  }, [type, callback]);
}

// Helper to emit events
export const emitUIEvent = <T extends UIEvent>(event: T) => {
  const eventSystem = EventSystem.getInstance();
  eventSystem.emit(event);
};
