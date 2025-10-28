export interface TerminalState {
  hasFullAccess: boolean;
  walletConnected: boolean;
  walletAddress?: string;
  tokenBalance?: number;
  lastSeen?: Date;
  gameMessages?: { role: string; content: string }[];
  accessTier?: number; // 0=normal,1=override,2=elevated
  threadId?: string;
}

export class TerminalContext {
  private static instance: TerminalContext;
  private state: TerminalState = {
    hasFullAccess: false,
    walletConnected: false,
    accessTier: 0,
    threadId: undefined,
  };

  private constructor() {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("terminalState");
      if (saved) {
        try {
          this.state = JSON.parse(saved);
        } catch (error) {
          console.warn("Failed to parse terminal state from storage", error);
        }
      }
    }
  }

  static getInstance(): TerminalContext {
    if (!TerminalContext.instance) {
      TerminalContext.instance = new TerminalContext();
    }
    return TerminalContext.instance;
  }

  getState(): TerminalState {
    return { ...this.state };
  }

  setState(newState: Partial<TerminalState>) {
    this.state = { ...this.state, ...newState };
    if (typeof window !== "undefined") {
      window.localStorage.setItem("terminalState", JSON.stringify(this.state));
    }
  }

  async ensureThread(handle: string = "anonymous"): Promise<string> {
    if (this.state.threadId) return this.state.threadId;
    try {
      const res = await fetch("/api/thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle }),
      });
      if (!res.ok) {
        throw new Error(`Thread create failed: ${res.status}`);
      }
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      const threadId = data.threadId as string;
      if (!threadId) throw new Error("No threadId returned");
      this.setState({ threadId });
      return threadId;
    } catch (e) {
      console.error("Failed to create thread", e);
      return "";
    }
  }

  clearState() {
    this.state = {
      hasFullAccess: false,
      walletConnected: false,
      accessTier: 0,
      threadId: undefined,
    };
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("terminalState");
    }
  }

  getGameMessages(): { role: string; content: string }[] {
    return this.state.gameMessages || [];
  }

  setGameMessages(messages: { role: string; content: string }[]) {
    this.setState({ gameMessages: messages });
    // Best-effort persist to server thread if available
    const threadId = this.state.threadId;
    if (threadId) {
      fetch("/api/thread", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          messages: messages.slice(-5), // send recent window to reduce traffic
        }),
      }).catch(() => {});
    }
  }

  addGameMessage(message: { role: string; content: string }) {
    const messages = this.getGameMessages();
    messages.push(message);
    this.setGameMessages(messages);
  }
}
