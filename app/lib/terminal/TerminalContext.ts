// Session inactivity timeout - after this period, a new session is created
// This allows the adventure to continue while tracking engagement in separate sessions
const SESSION_INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

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
  signalInstabilityShownCount?: number;
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
    // If we have a cached threadId, validate it still exists
    if (this.state.threadId) {
      try {
        const validateRes = await fetch(`/api/thread?threadId=${this.state.threadId}`);
        if (validateRes.ok) {
          const data = await validateRes.json();
          // If server says reset is required (e.g., anonymous user), clear and recreate
          if (data.resetRequired) {
            console.log("[TerminalContext] Thread reset required, creating new thread");
            this.setState({ threadId: undefined });
          } else {
            return this.state.threadId;
          }
        } else {
          // Thread doesn't exist anymore, clear it
          console.log("[TerminalContext] Cached thread no longer exists, creating new thread");
          this.setState({ threadId: undefined });
        }
      } catch (e) {
        // Network error, assume thread is valid for now
        console.warn("[TerminalContext] Could not validate thread:", e);
        return this.state.threadId;
      }
    }

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
      }).then(async (res) => {
        if (!res.ok) {
          if (res.status === 404 || res.status === 500) {
            // Thread doesn't exist or DB error - clear cached threadId
            console.warn("[TerminalContext] Thread sync failed, clearing cached threadId");
            this.setState({ threadId: undefined, syncedMessageCount: syncedCount });
          }
        }
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
    }).then(async res => {
      if (res.ok) {
        console.log("[TerminalContext] Synced messages to server");
      } else if (res.status === 404) {
        // Session doesn't exist - clear cached sessionId so next call creates a new one
        console.warn("[TerminalContext] Session not found during sync, clearing cached sessionId");
        this.setState({ sessionId: undefined });
        // Don't lose messages - they'll be synced when a new session is created
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

    // IMPORTANT: threadId and sessionId are both GameSession IDs
    // If we have a threadId but no sessionId, use the threadId as sessionId to avoid duplicates
    if (!shouldReset && !this.state.sessionId && this.state.threadId) {
      console.log("[TerminalContext] Using threadId as sessionId to avoid duplicate sessions");
      this.setState({ sessionId: this.state.threadId });
    }

    // If we have a cached sessionId, validate it still exists and is not stale
    if (!shouldReset && this.state.sessionId) {
      try {
        const validateRes = await fetch(`/api/session?sessionId=${this.state.sessionId}`);
        if (validateRes.ok) {
          const sessionData = await validateRes.json();
          const updatedAt = new Date(sessionData.updatedAt).getTime();
          const now = Date.now();
          const inactivityDuration = now - updatedAt;

          // Check if session is stale (inactive for too long)
          if (inactivityDuration > SESSION_INACTIVITY_TIMEOUT_MS) {
            console.log(`[TerminalContext] Session inactive for ${Math.round(inactivityDuration / 60000)} minutes, creating new session`);
            // Close the old session before creating new one
            await fetch("/api/session", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId: this.state.sessionId }),
            }).catch(() => {}); // Ignore errors closing old session
            this.setState({ sessionId: undefined });
            // Continue to create new session below
          } else {
            // Session still exists and is active, reuse it
            return this.state.sessionId;
          }
        } else {
          // Session doesn't exist anymore, clear it and continue to create new one
          console.log("[TerminalContext] Cached session no longer exists, creating new session");
          this.setState({ sessionId: undefined });
        }
      } catch (e) {
        // Network error, assume session is valid for now
        console.warn("[TerminalContext] Could not validate session:", e);
        return this.state.sessionId;
      }
    }

    // Get userId from state or localStorage to ensure session is tied to the correct user
    const userId = this.state.userId || (typeof window !== "undefined" ? localStorage.getItem("p89_userId") : null);

    const attempt = async (reset: boolean) => {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, reset, userId }),
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
    
    if (savedUserId) {
      try {
        const verifyRes = await fetch(`/api/identity?userId=${savedUserId}`);
        if (verifyRes.ok) {
          const data = await verifyRes.json();
          if (data.identity) {
            // Always use the server's authoritative values
            const serverAgentId = data.identity.agentId;
            const handle = data.identity.handle || serverAgentId.toLowerCase();

            // Sync localStorage if it was stale/mismatched
            if (typeof window !== "undefined") {
              if (savedAgentId !== serverAgentId) {
                localStorage.setItem("p89_agentId", serverAgentId);
              }
              // Always ensure handle is synced
              localStorage.setItem("p89_handle", handle);
            }

            this.setState({ userId: savedUserId, agentId: serverAgentId, handle });
            return { userId: savedUserId, agentId: serverAgentId };
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
      
      const resolvedHandle = handle || agentId.toLowerCase();
      if (typeof window !== "undefined") {
        localStorage.setItem("p89_userId", id);
        localStorage.setItem("p89_agentId", agentId);
        localStorage.setItem("p89_handle", resolvedHandle);
        // Geolocation now requires explicit consent - see requestLocationWithConsent()
      }

      this.setState({ userId: id, agentId, handle: resolvedHandle });
      return { userId: id, agentId };
    } catch (e) {
      console.error("Failed to create identity", e);
      return undefined;
    }
  }

  async checkIdentityStatus(): Promise<{ promptIdentityLock: boolean; narrative: string | null; isReferred: boolean; identityLocked: boolean } | undefined> {
    const now = Date.now();

    // Adaptive cooldown: starts at 5 minutes, increases after each showing
    // Max 3 showings, then stop entirely (player gets the point)
    const shownCount = this.state.signalInstabilityShownCount ?? 0;
    const MAX_SHOWINGS = 3;
    const BASE_COOLDOWN = 5 * 60 * 1000; // 5 minutes
    const cooldown = BASE_COOLDOWN * Math.pow(2, shownCount); // 5min, 10min, 20min...

    if (this.state.lastIdentityCheck && now - this.state.lastIdentityCheck < cooldown) {
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

      const isReferred = data.status?.isReferred ?? false;
      const identityLocked = !data.status?.canLockIdentity && isReferred;

      this.setState({
        lastIdentityCheck: now,
        isReferred,
        identityLocked,
      });

      // Don't show signal instability message if already shown enough times
      // or if player is now referred/locked
      let narrative = data.narrative ?? null;
      if (narrative && !isReferred && !identityLocked) {
        if (shownCount >= MAX_SHOWINGS) {
          narrative = null; // Stop showing after MAX_SHOWINGS
        } else {
          // Increment shown count
          this.setState({ signalInstabilityShownCount: shownCount + 1 });
        }
      }

      return {
        promptIdentityLock: data.status?.promptIdentityLock ?? false,
        narrative,
        isReferred,
        identityLocked,
      };
    } catch (e) {
      console.warn("Identity check failed", e);
      return undefined;
    }
  }

  /**
   * Request location with explicit user consent.
   * Call this when the user agrees to share their location through the narrative.
   */
  async requestLocationWithConsent(): Promise<boolean> {
    const userId = this.state.userId;
    if (!userId) return false;

    // Check if user has already given consent
    const hasConsent = typeof window !== "undefined" &&
      localStorage.getItem("p89_locationConsent") === "true";

    if (!hasConsent) {
      // Store consent
      if (typeof window !== "undefined") {
        localStorage.setItem("p89_locationConsent", "true");
      }
    }

    return this.requestGeolocation(userId);
  }

  /**
   * Check if user has given location consent
   */
  hasLocationConsent(): boolean {
    return typeof window !== "undefined" &&
      localStorage.getItem("p89_locationConsent") === "true";
  }

  private async requestGeolocation(userId: string): Promise<boolean> {
    if (!navigator.geolocation) return false;

    return new Promise((resolve) => {
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
            resolve(true);
          } catch (e) {
            console.warn("Failed to save location", e);
            resolve(false);
          }
        },
        () => resolve(false),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    });
  }
}
