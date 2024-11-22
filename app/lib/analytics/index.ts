import posthog from "posthog-js";

// Define PostHog type to avoid 'any'
interface PostHogInstance {
  init: (key: string, options: Record<string, any>) => void;
  opt_out_capturing: () => void;
  capture: (event: string, properties?: Record<string, any>) => void;
  identify: (id: string, properties?: Record<string, any>) => void;
}

export class Analytics {
  private static instance: Analytics;
  private posthog: PostHogInstance;

  private constructor() {
    this.posthog = posthog;
    // Initialize PostHog with your project API key
    this.posthog.init("phc_tGyTgnWv01fiiPQ20lcEd6NGCZMuaS71pBxcp1XbZAz", {
      api_host: "https://us.i.posthog.com",
      persistence: "localStorage+cookie",
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      // Disable during development
      loaded: (ph: PostHogInstance) => {
        if (process.env.NODE_ENV === "development") {
          console.log(
            "PostHog initialized in development mode - capturing disabled"
          );
          ph.opt_out_capturing();
        } else {
          console.log("PostHog initialized in production mode");
        }
      },
    });
  }

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  // Track AI interactions
  trackLLMCall(prompt: string, model: string, tokens: number) {
    this.posthog.capture("llm_call", {
      prompt_length: prompt.length,
      model,
      tokens,
      $set: {
        last_llm_interaction: new Date().toISOString(),
      },
    });
  }

  // Track tool usage
  trackToolExecution(toolName: string, parameters: Record<string, any>) {
    this.posthog.capture("tool_execution", {
      tool_name: toolName,
      parameters,
      $set: {
        last_tool_used: toolName,
      },
    });
  }

  // Track game actions
  trackGameAction(action: string, details?: Record<string, any>) {
    this.posthog.capture("game_action", {
      action,
      ...details,
    });
  }

  // Track game saves/loads
  trackGameSave(saveName: string) {
    this.posthog.capture("game_save", {
      save_name: saveName,
      $set: {
        has_saved_game: true,
      },
    });
  }

  trackGameLoad(saveName: string) {
    this.posthog.capture("game_load", {
      save_name: saveName,
    });
  }

  // Identify users when they connect wallet
  identifyUser(walletAddress: string, properties?: Record<string, any>) {
    this.posthog.identify(walletAddress, {
      wallet_address: walletAddress,
      ...properties,
    });
  }

  // Track feature flag usage
  trackFeatureFlagExposure(flagKey: string, value: boolean | string) {
    this.posthog.capture("$feature_flag_called", {
      $feature_flag: flagKey,
      $feature_flag_response: value,
    });
  }
}

export const analytics = Analytics.getInstance();
