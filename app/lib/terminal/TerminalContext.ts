export interface TerminalState {
  hasFullAccess: boolean;
  walletConnected: boolean;
  walletAddress?: string;
  tokenBalance?: number;
  lastSeen?: Date;
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
}
