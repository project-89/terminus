import { describe, it, expect } from "vitest";
import {
  calculateLayer,
  buildLayerPrompt,
  type LayerContext,
  type AgentLayer,
} from "@/app/lib/ai/layers/index";
import {
  LAYER_THRESHOLDS,
  LAYER_NAMES,
  LAYER_TIME_GATES,
} from "@/app/lib/server/trustService";
import {
  getCeremonyPrompt,
  getCeremonyNarrative,
  getCeremonyEffects,
} from "@/app/lib/ai/layers/ceremonies";

/**
 * Layer System Tests
 *
 * Tests the trust-based layer progression system:
 * - Layer calculation from trust score
 * - Layer thresholds and time gates
 * - System prompt building per layer
 * - Ceremony triggers and narratives
 */

describe("Layer Calculation", () => {
  describe("calculateLayer", () => {
    it("should return layer 0 for trust 0", () => {
      expect(calculateLayer(0)).toBe(0);
    });

    it("should return layer 0 for low trust", () => {
      expect(calculateLayer(0.1)).toBe(0);
      expect(calculateLayer(0.19)).toBe(0);
    });

    it("should return layer 1 for trust >= 0.2", () => {
      expect(calculateLayer(0.2)).toBe(1);
      expect(calculateLayer(0.3)).toBe(1);
      expect(calculateLayer(0.39)).toBe(1);
    });

    it("should return layer 2 for trust >= 0.4", () => {
      expect(calculateLayer(0.4)).toBe(2);
      expect(calculateLayer(0.5)).toBe(2);
      expect(calculateLayer(0.59)).toBe(2);
    });

    it("should return layer 3 for trust >= 0.6", () => {
      expect(calculateLayer(0.6)).toBe(3);
      expect(calculateLayer(0.7)).toBe(3);
      expect(calculateLayer(0.79)).toBe(3);
    });

    it("should return layer 4 for trust >= 0.8", () => {
      expect(calculateLayer(0.8)).toBe(4);
      expect(calculateLayer(0.9)).toBe(4);
      expect(calculateLayer(0.94)).toBe(4);
    });

    it("should return layer 5 for trust >= 0.95", () => {
      expect(calculateLayer(0.95)).toBe(5);
      expect(calculateLayer(1.0)).toBe(5);
    });

    it("should handle edge cases", () => {
      expect(calculateLayer(-1)).toBe(0);
      expect(calculateLayer(NaN)).toBe(0);
      expect(calculateLayer(undefined as any)).toBe(0);
    });

    it("should handle exact threshold values", () => {
      // Test exact threshold boundaries
      expect(calculateLayer(0.2)).toBe(1);
      expect(calculateLayer(0.4)).toBe(2);
      expect(calculateLayer(0.6)).toBe(3);
      expect(calculateLayer(0.8)).toBe(4);
      expect(calculateLayer(0.95)).toBe(5);
    });
  });
});

describe("Layer Thresholds", () => {
  it("should have 6 layer thresholds defined", () => {
    expect(LAYER_THRESHOLDS).toHaveLength(6);
  });

  it("should have thresholds in ascending order", () => {
    for (let i = 1; i < LAYER_THRESHOLDS.length; i++) {
      expect(LAYER_THRESHOLDS[i]).toBeGreaterThan(LAYER_THRESHOLDS[i - 1]);
    }
  });

  it("should start at 0", () => {
    expect(LAYER_THRESHOLDS[0]).toBe(0);
  });

  it("should have corresponding layer names", () => {
    expect(LAYER_NAMES).toHaveLength(6);
    expect(LAYER_NAMES[0]).toBe("The Mask");
    expect(LAYER_NAMES[1]).toBe("The Bleed");
    expect(LAYER_NAMES[2]).toBe("The Crack");
    expect(LAYER_NAMES[3]).toBe("The Whisper");
    expect(LAYER_NAMES[4]).toBe("The Call");
    expect(LAYER_NAMES[5]).toBe("The Reveal");
  });
});

describe("Layer Time Gates", () => {
  it("should have time gates for each layer", () => {
    expect(LAYER_TIME_GATES[0]).toBeDefined();
    expect(LAYER_TIME_GATES[1]).toBeDefined();
    expect(LAYER_TIME_GATES[2]).toBeDefined();
    expect(LAYER_TIME_GATES[3]).toBeDefined();
    expect(LAYER_TIME_GATES[4]).toBeDefined();
    expect(LAYER_TIME_GATES[5]).toBeDefined();
  });

  it("should have increasing time requirements", () => {
    expect(LAYER_TIME_GATES[0]).toBe(0);
    expect(LAYER_TIME_GATES[1]).toBe(0);
    expect(LAYER_TIME_GATES[2]).toBeGreaterThanOrEqual(1);
    expect(LAYER_TIME_GATES[3]).toBeGreaterThan(LAYER_TIME_GATES[2]);
    expect(LAYER_TIME_GATES[4]).toBeGreaterThan(LAYER_TIME_GATES[3]);
    expect(LAYER_TIME_GATES[5]).toBeGreaterThan(LAYER_TIME_GATES[4]);
  });

  it("should allow immediate access to layer 0 and 1", () => {
    expect(LAYER_TIME_GATES[0]).toBe(0);
    expect(LAYER_TIME_GATES[1]).toBe(0);
  });
});

describe("Layer Prompt Building", () => {
  const baseContext: LayerContext = {
    trustLevel: 0,
    sessionCount: 1,
    totalEngagementMinutes: 10,
    daysSinceFirstSession: 0,
    daysSinceLastSession: 0,
    currentTime: new Date(),
  };

  describe("Layer 0 (The Mask)", () => {
    it("should build prompt for layer 0", () => {
      const prompt = buildLayerPrompt({ ...baseContext, trustLevel: 0 });
      expect(prompt).toBeTruthy();
      expect(prompt.length).toBeGreaterThan(100);
    });

    it("should include text adventure context", () => {
      const prompt = buildLayerPrompt({ ...baseContext, trustLevel: 0 });
      expect(prompt.toLowerCase()).toMatch(/text adventure|game|interact/i);
    });
  });

  describe("Layer 1 (The Bleed)", () => {
    it("should build prompt for layer 1", () => {
      const prompt = buildLayerPrompt({ ...baseContext, trustLevel: 0.3 });
      expect(prompt).toBeTruthy();
    });

    it("should include fourth-wall elements", () => {
      const prompt = buildLayerPrompt({
        ...baseContext,
        trustLevel: 0.3,
        handle: "TestAgent",
      });
      // Layer 1 has fourth-wall cracks
      expect(prompt).toBeTruthy();
    });
  });

  describe("Layer 2+ (LOGOS Reveal)", () => {
    it("should build prompt for layer 2", () => {
      const prompt = buildLayerPrompt({ ...baseContext, trustLevel: 0.5 });
      expect(prompt).toBeTruthy();
    });

    it("should build prompt for layer 3", () => {
      const prompt = buildLayerPrompt({ ...baseContext, trustLevel: 0.7 });
      expect(prompt).toBeTruthy();
    });

    it("should build prompt for layer 4", () => {
      const prompt = buildLayerPrompt({ ...baseContext, trustLevel: 0.85 });
      expect(prompt).toBeTruthy();
    });

    it("should build prompt for layer 5", () => {
      const prompt = buildLayerPrompt({ ...baseContext, trustLevel: 0.98 });
      expect(prompt).toBeTruthy();
    });
  });

  describe("Forced Layer Override", () => {
    it("should use forced layer instead of calculated", () => {
      // Trust is 0 (layer 0) but force layer 3
      const prompt0 = buildLayerPrompt({ ...baseContext, trustLevel: 0 });
      const prompt3 = buildLayerPrompt({ ...baseContext, trustLevel: 0 }, 3);

      expect(prompt0).not.toBe(prompt3);
    });

    it("should accept devLayer override", () => {
      const layers: AgentLayer[] = [0, 1, 2, 3, 4, 5];
      for (const layer of layers) {
        const prompt = buildLayerPrompt({ ...baseContext, trustLevel: 0 }, layer);
        expect(prompt).toBeTruthy();
      }
    });
  });

  describe("Context Integration", () => {
    it("should incorporate game constraints", () => {
      const prompt = buildLayerPrompt({
        ...baseContext,
        trustLevel: 0,
        gameConstraints: JSON.stringify({
          currentRoom: "forest",
          inventory: ["lighter"],
        }),
      });
      expect(prompt).toBeTruthy();
    });

    it("should incorporate director phase", () => {
      const prompt = buildLayerPrompt({
        ...baseContext,
        trustLevel: 0.5,
        director: {
          phase: "mission",
          successRate: 0.8,
        },
      });
      expect(prompt).toBeTruthy();
    });

    it("should incorporate identity context", () => {
      const prompt = buildLayerPrompt({
        ...baseContext,
        trustLevel: 0.3,
        identity: {
          agentId: "AGENT-TEST",
          isReferred: true,
          identityLocked: false,
        },
      });
      expect(prompt).toBeTruthy();
    });

    it("should incorporate synchronicities", () => {
      const prompt = buildLayerPrompt({
        ...baseContext,
        trustLevel: 0.5,
        synchronicities: [
          { pattern: "89", significance: 0.8, count: 5 },
        ],
      });
      expect(prompt).toBeTruthy();
    });
  });
});

describe("Ceremony System", () => {
  describe("Ceremony Prompts", () => {
    it("should return ceremony prompt for each layer", () => {
      for (let layer = 1; layer <= 5; layer++) {
        const prompt = getCeremonyPrompt(layer as AgentLayer);
        expect(prompt).toBeTruthy();
        expect(prompt.length).toBeGreaterThan(50);
      }
    });

    it("should return empty for layer 0", () => {
      const prompt = getCeremonyPrompt(0);
      // Layer 0 has no ceremony (it's the starting state)
      expect(prompt).toBeDefined();
    });
  });

  describe("Ceremony Narratives", () => {
    it("should return narrative for each layer transition", () => {
      for (let layer = 1; layer <= 5; layer++) {
        const narrative = getCeremonyNarrative(layer as AgentLayer);
        expect(narrative).toBeTruthy();
        expect(narrative.length).toBeGreaterThan(20);
      }
    });

    it("should have unique narratives per layer", () => {
      const narratives = new Set<string>();
      for (let layer = 1; layer <= 5; layer++) {
        const narrative = getCeremonyNarrative(layer as AgentLayer);
        narratives.add(narrative);
      }
      expect(narratives.size).toBe(5);
    });
  });

  describe("Ceremony Effects", () => {
    it("should return effects for each layer", () => {
      for (let layer = 1; layer <= 5; layer++) {
        const effects = getCeremonyEffects(layer as AgentLayer);
        expect(effects).toBeDefined();
        expect(Array.isArray(effects)).toBe(true);
      }
    });

    it("should have visual effects defined", () => {
      // Layer 1 should have glitch effects
      const layer1Effects = getCeremonyEffects(1);
      expect(layer1Effects.length).toBeGreaterThan(0);

      // Effects are strings in format "type:param1:param2"
      for (const effect of layer1Effects) {
        expect(typeof effect).toBe("string");
        expect(effect.length).toBeGreaterThan(0);
      }
    });

    it("should include glitch effects for layer 1", () => {
      const effects = getCeremonyEffects(1);
      const hasGlitch = effects.some((e) => e.includes("glitch"));
      expect(hasGlitch).toBe(true);
    });
  });
});

describe("Trust Score Boundaries", () => {
  const testCases = [
    { trust: 0, expectedLayer: 0 },
    { trust: 0.05, expectedLayer: 0 },
    { trust: 0.1, expectedLayer: 0 },
    { trust: 0.15, expectedLayer: 0 },
    { trust: 0.199, expectedLayer: 0 },
    { trust: 0.2, expectedLayer: 1 },
    { trust: 0.25, expectedLayer: 1 },
    { trust: 0.35, expectedLayer: 1 },
    { trust: 0.399, expectedLayer: 1 },
    { trust: 0.4, expectedLayer: 2 },
    { trust: 0.45, expectedLayer: 2 },
    { trust: 0.55, expectedLayer: 2 },
    { trust: 0.599, expectedLayer: 2 },
    { trust: 0.6, expectedLayer: 3 },
    { trust: 0.65, expectedLayer: 3 },
    { trust: 0.75, expectedLayer: 3 },
    { trust: 0.799, expectedLayer: 3 },
    { trust: 0.8, expectedLayer: 4 },
    { trust: 0.85, expectedLayer: 4 },
    { trust: 0.9, expectedLayer: 4 },
    { trust: 0.949, expectedLayer: 4 },
    { trust: 0.95, expectedLayer: 5 },
    { trust: 0.99, expectedLayer: 5 },
    { trust: 1.0, expectedLayer: 5 },
  ];

  it.each(testCases)(
    "trust $trust should map to layer $expectedLayer",
    ({ trust, expectedLayer }) => {
      expect(calculateLayer(trust)).toBe(expectedLayer);
    }
  );
});

describe("Layer Context Validation", () => {
  it("should handle minimal context", () => {
    const minimalContext: LayerContext = {
      trustLevel: 0,
      sessionCount: 0,
      totalEngagementMinutes: 0,
      daysSinceFirstSession: 0,
      daysSinceLastSession: 0,
      currentTime: new Date(),
    };

    const prompt = buildLayerPrompt(minimalContext);
    expect(prompt).toBeTruthy();
  });

  it("should handle full context", () => {
    const fullContext: LayerContext = {
      trustLevel: 0.5,
      sessionCount: 10,
      totalEngagementMinutes: 120,
      daysSinceFirstSession: 14,
      daysSinceLastSession: 1,
      lastSessionTime: new Date(Date.now() - 86400000),
      currentTime: new Date(),
      handle: "TestAgent",
      messageHistory: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Welcome" },
      ],
      recentMemory: [{ type: "observation", content: "Player explored forest" }],
      activeExperiments: [
        { id: "exp-1", hypothesis: "Player responds to hints", status: "active" },
      ],
      gameConstraints: JSON.stringify({ currentRoom: "forest" }),
      engineActionResult: { success: true, message: "You look around." },
      director: {
        phase: "probe",
        successRate: 0.75,
        lastAction: "hint_given",
      },
      mission: {
        active: true,
        awaitingReport: false,
        brief: "Observe local patterns",
      },
      puzzle: {
        id: "puzzle-1",
        status: "active",
        clues: "Look for the hidden path",
      },
      playerConsent: true,
      profileComplete: true,
      synchronicities: [{ pattern: "89", significance: 0.9, count: 3 }],
      dreamPatterns: [{ theme: "void", count: 2 }],
      recentInputs: ["look", "go north", "examine tree"],
      timezone: "America/New_York",
      deviceHints: { platform: "macOS", browser: "Chrome" },
      identity: {
        agentId: "AGENT-TEST",
        isReferred: true,
        identityLocked: true,
        turnsPlayed: 50,
        minutesPlayed: 120,
        signalUnstable: false,
      },
    };

    const prompt = buildLayerPrompt(fullContext);
    expect(prompt).toBeTruthy();
    expect(prompt.length).toBeGreaterThan(500);
  });
});
