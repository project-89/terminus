import { useEffect } from "react";

type EventCallback = (...args: any[]) => void;

export type TerminalEffect =
  | "glitch"
  | "flicker"
  | "scanline"
  | "sound"
  | "matrix"
  | "error"
  | "success"
  | "warning"
  | "clear";

export type EffectOptions = {
  duration?: number;
  intensity?: number;
  color?: string;
  sound?: string;
  text?: string;
};

export class TerminalEventSystem {
  private static instance: TerminalEventSystem;
  private subscribers: Map<TerminalEffect, EventCallback[]>;

  private constructor() {
    this.subscribers = new Map();
  }

  public static getInstance(): TerminalEventSystem {
    if (!TerminalEventSystem.instance) {
      TerminalEventSystem.instance = new TerminalEventSystem();
    }
    return TerminalEventSystem.instance;
  }

  public subscribe(effect: TerminalEffect, callback: EventCallback) {
    if (!this.subscribers.has(effect)) {
      this.subscribers.set(effect, []);
    }
    this.subscribers.get(effect)?.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(effect);
      const index = callbacks?.indexOf(callback) ?? -1;
      if (index > -1) {
        callbacks?.splice(index, 1);
      }
    };
  }

  public trigger(effect: TerminalEffect, options?: EffectOptions) {
    const callbacks = this.subscribers.get(effect);
    callbacks?.forEach((callback) => callback(options));
  }
}

// Create a hook for easy use in React components
export function useTerminalEffect(
  effect: TerminalEffect,
  callback: EventCallback
) {
  useEffect(() => {
    const eventSystem = TerminalEventSystem.getInstance();
    return eventSystem.subscribe(effect, callback);
  }, [effect, callback]);
}

// Helper to trigger effects
export const triggerEffect = (
  effect: TerminalEffect,
  options?: EffectOptions
) => {
  const eventSystem = TerminalEventSystem.getInstance();
  eventSystem.trigger(effect, options);
};

export class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return this;
  }

  off(event: string, callback: Function) {
    if (!this.events[event]) return this;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
    return this;
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return false;
    this.events[event].forEach((callback) => callback(...args));
    return true;
  }
}
