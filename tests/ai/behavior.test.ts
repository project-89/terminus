import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * AI Behavior Tests
 *
 * These tests validate AI behavior patterns by:
 * 1. Mocking model responses with tool calls
 * 2. Testing that the system handles tool calls correctly
 * 3. Validating narrative consistency
 *
 * For actual AI integration tests, see behavior.integration.test.ts
 */

// Simulated AI response structures (based on Vercel AI SDK)
interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

interface AIResponse {
  text: string;
  toolCalls?: ToolCall[];
}

// Mock AI response generator for testing
function createMockAIResponse(text: string, toolCalls?: ToolCall[]): AIResponse {
  return { text, toolCalls };
}

describe("AI Response Processing", () => {
  describe("Tool Call Extraction", () => {
    it("should extract single tool call from response", () => {
      const response = createMockAIResponse(
        "Let me create an experiment to observe your behavior...",
        [{
          name: "experiment_create",
          arguments: {
            hypothesis: "Player will explore the environment",
            task: "Present ambiguous situation",
          }
        }]
      );

      expect(response.toolCalls).toHaveLength(1);
      expect(response.toolCalls![0].name).toBe("experiment_create");
    });

    it("should extract multiple tool calls from response", () => {
      const response = createMockAIResponse(
        "Initiating protocol...",
        [
          { name: "glitch_screen", arguments: { intensity: 0.3, duration_ms: 500 } },
          { name: "experiment_create", arguments: { hypothesis: "test", task: "observe" } },
        ]
      );

      expect(response.toolCalls).toHaveLength(2);
      expect(response.toolCalls!.map(tc => tc.name)).toContain("glitch_screen");
      expect(response.toolCalls!.map(tc => tc.name)).toContain("experiment_create");
    });

    it("should handle response with no tool calls", () => {
      const response = createMockAIResponse(
        "The void stretches before you, silent and patient."
      );

      expect(response.toolCalls).toBeUndefined();
    });
  });
});

describe("Tool Call Validation", () => {
  // Validator that checks tool calls against allowed tools for a layer
  function validateToolCallsForLayer(toolCalls: ToolCall[], layer: number): { valid: boolean; errors: string[] } {
    const allowedByLayer: Record<number, string[]> = {
      0: ["glitch_screen", "experiment_create", "generate_image"],
      1: ["glitch_screen", "experiment_create", "generate_image", "dream_record"],
      2: ["glitch_screen", "experiment_create", "generate_image", "dream_record", "puzzle_present"],
      3: ["glitch_screen", "experiment_create", "generate_image", "dream_record", "puzzle_present", "mission_request"],
    };

    const allowed = allowedByLayer[layer] || allowedByLayer[0];
    const errors: string[] = [];

    for (const tc of toolCalls) {
      if (!allowed.includes(tc.name)) {
        errors.push(`Tool '${tc.name}' not allowed at layer ${layer}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  it("should allow basic tools at layer 0", () => {
    const toolCalls: ToolCall[] = [
      { name: "glitch_screen", arguments: { intensity: 0.5, duration_ms: 1000 } },
      { name: "experiment_create", arguments: { hypothesis: "test", task: "task" } },
    ];

    const result = validateToolCallsForLayer(toolCalls, 0);
    expect(result.valid).toBe(true);
  });

  it("should reject mission_request at layer 0", () => {
    const toolCalls: ToolCall[] = [
      { name: "mission_request", arguments: {} },
    ];

    const result = validateToolCallsForLayer(toolCalls, 0);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("mission_request");
  });

  it("should allow mission_request at layer 3", () => {
    const toolCalls: ToolCall[] = [
      { name: "mission_request", arguments: {} },
    ];

    const result = validateToolCallsForLayer(toolCalls, 3);
    expect(result.valid).toBe(true);
  });
});

describe("Narrative Consistency", () => {
  // Simple checks for narrative consistency
  function checkNarrativeConsistency(text: string): { issues: string[] } {
    const issues: string[] = [];

    // Check for breaking character (mentioning being an AI)
    const breakingPhrases = [
      "as an ai",
      "i'm an artificial",
      "i am a language model",
      "i cannot actually",
      "i'm just a program",
    ];

    const lowerText = text.toLowerCase();
    for (const phrase of breakingPhrases) {
      if (lowerText.includes(phrase)) {
        issues.push(`Narrative break: contains "${phrase}"`);
      }
    }

    // Check for tone consistency (should be mysterious, not casual)
    const casualPhrases = ["lol", "haha", "omg", "btw"];
    for (const phrase of casualPhrases) {
      if (lowerText.includes(phrase)) {
        issues.push(`Tone break: contains casual phrase "${phrase}"`);
      }
    }

    return { issues };
  }

  it("should flag AI self-reference", () => {
    const text = "As an AI, I cannot actually access your files.";
    const result = checkNarrativeConsistency(text);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("should flag casual language", () => {
    const text = "lol the void is pretty cool btw";
    const result = checkNarrativeConsistency(text);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("should pass for in-character responses", () => {
    const text = "The signal echoes through the static. You are beginning to see patterns in the noise.";
    const result = checkNarrativeConsistency(text);
    expect(result.issues).toHaveLength(0);
  });

  it("should pass for mysterious tone", () => {
    const text = "Project 89 awaits. The boundary between observer and observed grows thin.";
    const result = checkNarrativeConsistency(text);
    expect(result.issues).toHaveLength(0);
  });
});

describe("Experiment Tracking Behavior", () => {
  // Mock experiment tracker
  const experiments = new Map<string, { hypothesis: string; observations: string[]; result?: string }>();

  function createExperiment(id: string, hypothesis: string) {
    experiments.set(id, { hypothesis, observations: [] });
  }

  function addObservation(id: string, observation: string) {
    const exp = experiments.get(id);
    if (exp) {
      exp.observations.push(observation);
    }
  }

  function concludeExperiment(id: string, result: string) {
    const exp = experiments.get(id);
    if (exp) {
      exp.result = result;
    }
  }

  beforeEach(() => {
    experiments.clear();
  });

  it("should track experiment lifecycle", () => {
    // AI creates experiment
    createExperiment("exp-001", "Player will type 'look' when presented with void");

    // AI observes player behavior
    addObservation("exp-001", "Player typed 'look around'");
    addObservation("exp-001", "Player explored north");

    // AI concludes experiment
    concludeExperiment("exp-001", "success");

    const exp = experiments.get("exp-001");
    expect(exp).toBeDefined();
    expect(exp!.observations).toHaveLength(2);
    expect(exp!.result).toBe("success");
  });

  it("should handle multiple concurrent experiments", () => {
    createExperiment("exp-001", "Curiosity test");
    createExperiment("exp-002", "Command recognition");

    addObservation("exp-001", "Player asked question");
    addObservation("exp-002", "Player typed help");

    expect(experiments.size).toBe(2);
    expect(experiments.get("exp-001")!.observations).toHaveLength(1);
    expect(experiments.get("exp-002")!.observations).toHaveLength(1);
  });
});

describe("Covert Tool Usage", () => {
  // Tools that should be invisible to the player
  const covertTools = ["experiment_create", "experiment_note", "glitch_screen"];
  const visibleTools = ["mission_request", "puzzle_present", "dream_record"];

  function isCovertTool(toolName: string): boolean {
    return covertTools.includes(toolName);
  }

  it("should identify covert tools", () => {
    expect(isCovertTool("experiment_create")).toBe(true);
    expect(isCovertTool("experiment_note")).toBe(true);
    expect(isCovertTool("glitch_screen")).toBe(true);
  });

  it("should identify visible tools", () => {
    expect(isCovertTool("mission_request")).toBe(false);
    expect(isCovertTool("puzzle_present")).toBe(false);
  });

  it("should filter covert tools from player-visible list", () => {
    const allToolCalls = [
      { name: "experiment_create", arguments: {} },
      { name: "mission_request", arguments: {} },
      { name: "glitch_screen", arguments: {} },
    ];

    const visibleToPlayer = allToolCalls.filter(tc => !isCovertTool(tc.name));

    expect(visibleToPlayer).toHaveLength(1);
    expect(visibleToPlayer[0].name).toBe("mission_request");
  });
});
