// Define PostHog type to avoid 'any'
interface PostHogInstance {
  init: (key: string, options: Record<string, any>) => void;
  opt_out_capturing: () => void;
  capture: (event: string, properties?: Record<string, any>) => void;
  identify: (id: string, properties?: Record<string, any>) => void;
}

export class Analytics {
  private static instance: Analytics;
  private posthog: PostHogInstance | null = null;
  private isClient: boolean = false;
  private isInitialized: boolean = false;
  private queue: Array<() => void> = [];

  private constructor() {
    this.isClient = typeof window !== "undefined";
    if (this.isClient) {
      this.initPostHog();
    }
  }

  private async initPostHog() {
    if (this.isInitialized) return;

    try {
      const { default: posthog } = await import("posthog-js");
      this.posthog = posthog;

      this.posthog.init("phc_tGyTgnWv01fiiPQ20lcEd6NGCZMuaS71pBxcp1XbZAz", {
        api_host: "https://us.i.posthog.com",
        persistence: "localStorage",
        autocapture: true,
        capture_pageview: true,
        capture_pageleave: true,
        disable_session_recording: true, // Disable session recording for privacy
        loaded: (ph: PostHogInstance) => {
          if (process.env.NODE_ENV === "development") {
            console.log(
              "PostHog initialized in development mode - capturing disabled"
            );
            ph.opt_out_capturing();
          } else {
            console.log("PostHog initialized in production mode");
          }
          this.isInitialized = true;
          this.processQueue();
        },
      });
    } catch (error) {
      console.error("Failed to initialize PostHog:", error);
    }
  }

  private processQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      event?.();
    }
  }

  private queueOrExecute(fn: () => void) {
    if (this.isInitialized && this.posthog) {
      fn();
    } else {
      this.queue.push(fn);
    }
  }

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  trackGameSave(saveName: string) {
    this.queueOrExecute(() => {
      this.posthog?.capture("game_save", {
        save_name: saveName,
        $set: { has_saved_game: true },
      });
    });
  }

  trackGameLoad(saveName: string) {
    this.queueOrExecute(() => {
      this.posthog?.capture("game_load", {
        save_name: saveName,
      });
    });
  }

  trackLLMCall(prompt: string, model: string, tokens: number) {
    this.queueOrExecute(() => {
      this.posthog?.capture("llm_call", {
        prompt_length: prompt.length,
        model,
        tokens,
        $set: { last_llm_interaction: new Date().toISOString() },
      });
    });
  }

  trackToolExecution(toolName: string, parameters: Record<string, any>) {
    this.queueOrExecute(() => {
      this.posthog?.capture("tool_execution", {
        tool_name: toolName,
        parameters,
        $set: { last_tool_used: toolName },
      });
    });
  }

  trackGameAction(action: string, details?: Record<string, any>) {
    this.queueOrExecute(() => {
      this.posthog?.capture("game_action", {
        action,
        ...details,
      });
    });
  }

  identifyUser(walletAddress: string, properties?: Record<string, any>) {
    this.queueOrExecute(() => {
      this.posthog?.identify(walletAddress, {
        wallet_address: walletAddress,
        ...properties,
      });
    });
  }

  trackFeatureFlagExposure(flagKey: string, value: boolean | string) {
    this.queueOrExecute(() => {
      this.posthog?.capture("$feature_flag_called", {
        $feature_flag: flagKey,
        $feature_flag_response: value,
      });
    });
  }
}

export const analytics = Analytics.getInstance();
