export interface TerminalState {
  hasFullAccess: boolean;
  walletConnected: boolean;
  walletAddress?: string;
  tokenBalance?: number;
  lastSeen?: Date;
  gameMessages?: { role: string; content: string }[];
  syncedMessageCount?: number;
  accessTier?: number; // 0=normal,1=override,2=elevated
  threadId?: string;
  handle?: string;
  sessionId?: string;
  activeMissionRunId?: string;
  expectingReport?: boolean;
  profile?: {
    traits: Record<string, any>;
    skills: Record<string, any>;
    preferences: Record<string, any>;
  };
  userId?: string;
  agentId?: string;
  isReferred?: boolean;
  identityLocked?: boolean;
  lastIdentityCheck?: number;
}

export class TerminalContext {
  private static instance: TerminalContext;
  private state: TerminalState = {
    hasFullAccess: false,
    walletConnected: false,
    accessTier: 0,
    threadId: undefined,
    handle: undefined,
    sessionId: undefined,
    activeMissionRunId: undefined,
    expectingReport: false,
    profile: undefined,
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

  async ensureThread(handle?: string): Promise<string> {
    if (this.state.threadId) return this.state.threadId;
    
    const resolvedHandle = handle || this.state.handle || "anonymous";
    
    try {
      const res = await fetch("/api/thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          handle: resolvedHandle,
          userId: this.state.userId,
        }),
      });
      if (!res.ok) {
        throw new Error(`Thread create failed: ${res.status}`);
      }
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      const threadId = data.threadId as string;
      if (!threadId) throw new Error("No threadId returned");
      this.setState({ threadId, handle });
      return threadId;
    } catch (e) {
      console.error("Failed to create thread", e);
      return "";
    }
  }

  clearState() {
    const handle = this.state.handle;
    this.state = {
      hasFullAccess: false,
      walletConnected: false,
      accessTier: 0,
      threadId: undefined,
      handle,
      sessionId: undefined,
      activeMissionRunId: undefined,
      expectingReport: false,
      profile: undefined,
      gameMessages: [],
    };
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("terminalState");
      window.localStorage.setItem("terminalState", JSON.stringify(this.state));
    }
  }

  ensureHandle(prefix: string = "agent") {
    if (!this.state.handle) {
      const alias = `${prefix}-${Math.random().toString(36).slice(2, 6)}`;
      this.setState({ handle: alias });
    }
    return this.state.handle as string;
  }

  setSessionId(sessionId?: string) {
    this.setState({ sessionId });
  }

  setActiveMissionRun(runId?: string) {
    this.setState({ activeMissionRunId: runId });
  }

  setExpectingReport(flag: boolean) {
    this.setState({ expectingReport: flag });
  }

  setThreadId(threadId?: string) {
    this.setState({ threadId });
  }

  getGameMessages(): { role: string; content: string }[] {
    return this.state.gameMessages || [];
  }

  setGameMessages(messages: { role: string; content: string }[], options?: { skipSync?: boolean }) {
    const syncedCount = this.state.syncedMessageCount ?? 0;
    const newMessages = options?.skipSync ? [] : messages.slice(syncedCount);

    this.setState({ gameMessages: messages, syncedMessageCount: messages.length });

    const threadId = this.state.threadId;
    if (threadId && newMessages.length > 0) {
      console.log(`[TerminalContext] Syncing ${newMessages.length} new messages to thread ${threadId}:`,
        newMessages.map(m => ({ role: m.role, contentLen: m.content?.length ?? 0, preview: m.content?.substring(0, 50) })));
      fetch("/api/thread", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          messages: newMessages,
        }),
      }).catch((err) => {
        console.error("[TerminalContext] Failed to sync messages:", err);
        this.setState({ syncedMessageCount: syncedCount });
      });
    }
  }

  addGameMessage(message: { role: string; content: string }) {
    const messages = this.getGameMessages();
    messages.push(message);
    this.setGameMessages(messages);
  }

  private syncMessagesToServer(sessionId: string, messages: { role: string; content: string }[]) {
    fetch("/api/session", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, messages }),
    }).then(res => {
      if (res.ok) {
        console.log("[TerminalContext] Synced messages to server");
      }
    }).catch(err => {
      console.warn("[TerminalContext] Failed to sync messages:", err);
    });
  }

  async ensureProfile(force: boolean = false): Promise<TerminalState['profile'] | undefined> {
    if (this.state.profile && !force) return this.state.profile;
    
    // We need a sessionId or handle to fetch profile
    let params = "";
    if (this.state.sessionId) params = `sessionId=${this.state.sessionId}`;
    else if (this.state.handle) params = `handle=${this.state.handle}`;
    
    if (!params) return undefined;

    try {
      const res = await fetch(`/api/profile?${params}`);
      if (res.ok) {
        const profile = await res.json();
        this.setState({ profile });
        return profile;
      }
    } catch (e) {
      console.warn("Failed to fetch profile", e);
    }
    return undefined;
  }

  async ensureSession(options: { reset?: boolean; handle?: string } = {}) {
    const handle = this.ensureHandle(options.handle || "agent");
    const shouldReset = options.reset === true;

    if (!shouldReset && this.state.sessionId) {
      return this.state.sessionId;
    }

    const attempt = async (reset: boolean) => {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, reset }),
      });
      if (!res.ok) {
        throw new Error(`Session request failed: ${res.status}`);
      }
      const data = (await res.json()) as {
        sessionId: string;
        handle: string;
      };
      this.setState({ sessionId: data.sessionId, handle: data.handle });
      if (reset) {
        this.setGameMessages([]);
        this.setActiveMissionRun(undefined);
        this.setExpectingReport(false);
      } else {
        const existingMessages = this.getGameMessages();
        if (existingMessages.length > 0) {
          this.syncMessagesToServer(data.sessionId, existingMessages);
        }
      }
      return data.sessionId;
    };

    try {
      if (shouldReset) {
        return await attempt(true);
      }
      return await attempt(false);
    } catch (error) {
      console.warn("ensureSession primary attempt failed", error);
      if (shouldReset) return undefined;
      try {
        return await attempt(true);
      } catch (finalError) {
        console.error("Failed to ensure session", finalError);
        return undefined;
      }
    }
  }

  async ensureIdentity(): Promise<{ userId: string; agentId: string } | undefined> {
    if (this.state.userId && this.state.agentId) {
      return { userId: this.state.userId, agentId: this.state.agentId };
    }

    const savedUserId = typeof window !== "undefined" ? localStorage.getItem("p89_userId") : null;
    const savedAgentId = typeof window !== "undefined" ? localStorage.getItem("p89_agentId") : null;
    
    if (savedUserId && savedAgentId) {
      try {
        const verifyRes = await fetch(`/api/identity?userId=${savedUserId}`);
        if (verifyRes.ok) {
          const data = await verifyRes.json();
          if (data.identity) {
            const handle = data.identity.handle || savedAgentId.toLowerCase();
            this.setState({ userId: savedUserId, agentId: savedAgentId, handle });
            return { userId: savedUserId, agentId: savedAgentId };
          }
        }
        localStorage.removeItem("p89_userId");
        localStorage.removeItem("p89_agentId");
      } catch {
        localStorage.removeItem("p89_userId");
        localStorage.removeItem("p89_agentId");
      }
    }

    try {
      const res = await fetch("/api/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create" }),
      });
      if (!res.ok) throw new Error("Identity creation failed");
      const data = await res.json();
      const { id, agentId, handle } = data.identity;
      
      if (typeof window !== "undefined") {
        localStorage.setItem("p89_userId", id);
        localStorage.setItem("p89_agentId", agentId);
        this.requestGeolocation(id);
      }
      
      this.setState({ userId: id, agentId, handle: handle || agentId.toLowerCase() });
      return { userId: id, agentId };
    } catch (e) {
      console.error("Failed to create identity", e);
      return undefined;
    }
  }

  async checkIdentityStatus(): Promise<{ promptIdentityLock: boolean; narrative: string | null; isReferred: boolean; identityLocked: boolean } | undefined> {
    const now = Date.now();
    if (this.state.lastIdentityCheck && now - this.state.lastIdentityCheck < 60000) {
      return undefined;
    }

    const identity = await this.ensureIdentity();
    if (!identity) return undefined;

    try {
      const res = await fetch("/api/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check", userId: identity.userId }),
      });
      if (!res.ok) return undefined;
      const data = await res.json();
      
      this.setState({
        lastIdentityCheck: now,
        isReferred: data.status?.isReferred ?? false,
        identityLocked: !data.status?.canLockIdentity && data.status?.isReferred,
      });
      
      return {
        promptIdentityLock: data.status?.promptIdentityLock ?? false,
        narrative: data.narrative ?? null,
        isReferred: data.status?.isReferred ?? false,
        identityLocked: !data.status?.canLockIdentity && data.status?.isReferred,
      };
    } catch (e) {
      console.warn("Identity check failed", e);
      return undefined;
    }
  }

  private requestGeolocation(userId: string): void {
    if (!navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await fetch("/api/identity/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
            }),
          });
        } catch (e) {
          console.warn("Failed to save location", e);
        }
      },
      () => {},
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }
}
