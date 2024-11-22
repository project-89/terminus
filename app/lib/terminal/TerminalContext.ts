export interface TerminalState {
  hasFullAccess: boolean;
  walletConnected: boolean;
  walletAddress?: string;
  tokenBalance?: number;
  lastSeen?: Date;
  gameMessages?: { role: string; content: string }[];
}

export class TerminalContext {
  private static instance: TerminalContext;
  private state: TerminalState = {
    hasFullAccess: false,
    walletConnected: false,
  };

  private constructor() {
    // Load saved state from localStorage
    const saved = localStorage.getItem("terminalState");
    if (saved) {
      this.state = JSON.parse(saved);
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
    // Save to localStorage
    localStorage.setItem("terminalState", JSON.stringify(this.state));
  }

  clearState() {
    this.state = {
      hasFullAccess: false,
      walletConnected: false,
    };
    localStorage.removeItem("terminalState");
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
