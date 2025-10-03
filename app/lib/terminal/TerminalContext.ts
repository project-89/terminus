export interface TerminalState {
  hasFullAccess: boolean;
  walletConnected: boolean;
  walletAddress?: string;
  tokenBalance?: number;
  lastSeen?: Date;
  gameMessages?: { role: string; content: string }[];
  accessTier?: number; // 0=normal,1=override,2=elevated
}

export class TerminalContext {
  private static instance: TerminalContext;
  private state: TerminalState = {
    hasFullAccess: false,
    walletConnected: false,
    accessTier: 0,
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

  clearState() {
    this.state = {
      hasFullAccess: false,
      walletConnected: false,
      accessTier: 0,
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
  }

  addGameMessage(message: { role: string; content: string }) {
    const messages = this.getGameMessages();
    messages.push(message);
    this.setGameMessages(messages);
  }
}
