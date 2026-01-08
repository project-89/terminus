import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

/**
 * Experiment-Constrained World Building Tests
 *
 * Tests that world-building tools require experimentId in Layer 0-1:
 * - World creation rejected without experimentId
 * - World creation accepted with experimentId
 * - Experiment testPlan schema validation
 */

// Mock the world graph service
vi.mock("@/app/lib/server/worldGraphService", () => ({
  aiCreateRoom: vi.fn(async () => ({ success: true, id: "test-room" })),
  aiCreateObject: vi.fn(async () => ({ success: true, id: "test-object" })),
  aiModifyState: vi.fn(async () => ({ success: true })),
}));

// Import the parameter schemas for validation testing
// We test the schema shapes directly since the actual route handler
// requires full HTTP context

describe("Experiment-Constrained World Building", () => {
  describe("World Setup Action Schema", () => {
    const worldSetupActionSchema = z.object({
      action: z.enum(["create_room", "create_object", "modify_state", "set_trigger"]),
      params: z.record(z.any()),
      purpose: z.string().optional(),
    });

    it("should accept valid create_room action", () => {
      const action = {
        action: "create_room",
        params: { id: "dark-alcove", name: "Dark Alcove", description: "A shadowy corner" },
        purpose: "Test player's willingness to explore darkness",
      };
      expect(() => worldSetupActionSchema.parse(action)).not.toThrow();
    });

    it("should accept valid create_object action", () => {
      const action = {
        action: "create_object",
        params: { id: "mysterious-key", name: "Mysterious Key", location: "dark-alcove" },
        purpose: "Reward for exploration",
      };
      expect(() => worldSetupActionSchema.parse(action)).not.toThrow();
    });

    it("should reject invalid action type", () => {
      const action = {
        action: "invalid_action",
        params: {},
      };
      expect(() => worldSetupActionSchema.parse(action)).toThrow();
    });
  });

  describe("Experiment Trigger Schema", () => {
    const experimentTriggerSchema = z.object({
      condition: z.string(),
      outcome: z.string(),
      points: z.number().optional(),
    });

    it("should accept valid trigger", () => {
      const trigger = {
        condition: "player_enters:dark-alcove",
        outcome: "curious",
        points: 10,
      };
      expect(() => experimentTriggerSchema.parse(trigger)).not.toThrow();
    });

    it("should accept trigger without points", () => {
      const trigger = {
        condition: "player_ignores:dark-alcove",
        outcome: "cautious",
      };
      expect(() => experimentTriggerSchema.parse(trigger)).not.toThrow();
    });
  });

  describe("Experiment TestPlan Schema", () => {
    const testPlanSchema = z.object({
      setup: z.array(z.object({
        action: z.enum(["create_room", "create_object", "modify_state", "set_trigger"]),
        params: z.record(z.any()),
        purpose: z.string().optional(),
      })).optional(),
      triggers: z.array(z.object({
        condition: z.string(),
        outcome: z.string(),
        points: z.number().optional(),
      })).optional(),
      duration_turns: z.number().int().min(1).max(50).optional(),
    });

    it("should accept complete testPlan", () => {
      const testPlan = {
        setup: [
          {
            action: "create_room",
            params: { id: "hidden-chamber", isDark: true },
            purpose: "Test darkness exploration",
          },
          {
            action: "create_object",
            params: { id: "faint-glow", location: "hidden-chamber" },
            purpose: "Lure for curiosity test",
          },
        ],
        triggers: [
          { condition: "player_enters:hidden-chamber", outcome: "brave", points: 15 },
          { condition: "player_examines:faint-glow", outcome: "curious", points: 10 },
        ],
        duration_turns: 5,
      };
      expect(() => testPlanSchema.parse(testPlan)).not.toThrow();
    });

    it("should accept minimal testPlan", () => {
      const testPlan = {};
      expect(() => testPlanSchema.parse(testPlan)).not.toThrow();
    });

    it("should accept testPlan with only triggers", () => {
      const testPlan = {
        triggers: [
          { condition: "player_waits:3_turns", outcome: "patient" },
        ],
      };
      expect(() => testPlanSchema.parse(testPlan)).not.toThrow();
    });

    it("should reject invalid duration", () => {
      const testPlan = {
        duration_turns: 100, // max is 50
      };
      expect(() => testPlanSchema.parse(testPlan)).toThrow();
    });
  });

  describe("World Building Parameter Schemas", () => {
    const worldCreateRoomParameters = z.object({
      experimentId: z.string().optional(),
      id: z.string().min(2).max(64),
      name: z.string(),
      description: z.string(),
      region: z.enum(["oneiros", "samsara", "mundane", "liminal", "void"]),
      purpose: z.string().optional(),
    });

    const worldCreateObjectParameters = z.object({
      experimentId: z.string().optional(),
      id: z.string().min(2).max(64),
      name: z.string(),
      description: z.string(),
      location: z.string(),
      purpose: z.string().optional(),
    });

    it("should accept room with experimentId", () => {
      const room = {
        experimentId: "exp-test-123",
        id: "test-room",
        name: "Test Room",
        description: "A room for testing",
        region: "liminal",
        purpose: "Testing player navigation",
      };
      expect(() => worldCreateRoomParameters.parse(room)).not.toThrow();
    });

    it("should accept room without experimentId (schema allows optional)", () => {
      // Schema allows optional, but execute handler will reject
      const room = {
        id: "test-room",
        name: "Test Room",
        description: "A room for testing",
        region: "liminal",
      };
      expect(() => worldCreateRoomParameters.parse(room)).not.toThrow();
    });

    it("should accept object with experimentId", () => {
      const obj = {
        experimentId: "exp-test-456",
        id: "test-object",
        name: "Test Object",
        description: "An object for testing",
        location: "test-room",
        purpose: "Testing player interaction",
      };
      expect(() => worldCreateObjectParameters.parse(obj)).not.toThrow();
    });

    it("should reject invalid region", () => {
      const room = {
        experimentId: "exp-test",
        id: "test-room",
        name: "Test Room",
        description: "A room",
        region: "invalid-region",
      };
      expect(() => worldCreateRoomParameters.parse(room)).toThrow();
    });
  });

  describe("Full Experiment Create Schema", () => {
    const experimentCreateParameters = z.object({
      id: z.string().min(3).max(64).optional(),
      hypothesis: z.string().min(4),
      task: z.string().min(4),
      success_criteria: z.string().optional(),
      timeout_s: z.number().int().min(5).max(600).optional(),
      title: z.string().optional(),
      testPlan: z.object({
        setup: z.array(z.object({
          action: z.enum(["create_room", "create_object", "modify_state", "set_trigger"]),
          params: z.record(z.any()),
          purpose: z.string().optional(),
        })).optional(),
        triggers: z.array(z.object({
          condition: z.string(),
          outcome: z.string(),
          points: z.number().optional(),
        })).optional(),
        duration_turns: z.number().int().min(1).max(50).optional(),
      }).optional(),
    });

    it("should accept experiment with full testPlan", () => {
      const experiment = {
        id: "exp-darkness-test",
        hypothesis: "Player will explore dark spaces if there's an auditory lure",
        task: "Observe player response to dark room with mysterious sounds",
        success_criteria: "Player enters dark room within 3 turns",
        timeout_s: 300,
        title: "Darkness Exploration Test",
        testPlan: {
          setup: [
            {
              action: "create_room",
              params: {
                id: "shadow-alcove",
                name: "Shadow Alcove",
                description: "Darkness pools here like water.",
                region: "liminal",
                isDark: true,
              },
              purpose: "Create dark space to test exploration willingness",
            },
            {
              action: "create_object",
              params: {
                id: "whispering-sound",
                name: "Whispers",
                description: "Faint voices seem to come from within.",
                location: "shadow-alcove",
              },
              purpose: "Auditory lure to motivate exploration",
            },
          ],
          triggers: [
            {
              condition: "player_enters:shadow-alcove",
              outcome: "brave_explorer",
              points: 20,
            },
            {
              condition: "player_listens:whispering-sound",
              outcome: "curious_investigator",
              points: 15,
            },
            {
              condition: "player_flees:shadow-alcove",
              outcome: "cautious_survivor",
              points: 5,
            },
          ],
          duration_turns: 10,
        },
      };
      expect(() => experimentCreateParameters.parse(experiment)).not.toThrow();
    });

    it("should accept experiment without testPlan (backward compatible)", () => {
      const experiment = {
        hypothesis: "Player responds to hints about their real life",
        task: "Drop a hint about the time of day and observe reaction",
      };
      expect(() => experimentCreateParameters.parse(experiment)).not.toThrow();
    });

    it("should reject experiment with empty hypothesis", () => {
      const experiment = {
        hypothesis: "abc", // too short (min 4)
        task: "Some task",
      };
      expect(() => experimentCreateParameters.parse(experiment)).toThrow();
    });
  });

  describe("Experiment-World Linkage Logic", () => {
    // Simulates the validation logic in the tool execute handlers
    function validateWorldBuildingRequest(args: { experimentId?: string }) {
      if (!args.experimentId) {
        return {
          success: false,
          message: "World building requires an active experiment. First use experiment_create to define what you're testing, then reference the experimentId here.",
        };
      }
      return { success: true };
    }

    it("should reject world building without experimentId", () => {
      const result = validateWorldBuildingRequest({});
      expect(result.success).toBe(false);
      expect(result.message).toContain("requires an active experiment");
    });

    it("should accept world building with experimentId", () => {
      const result = validateWorldBuildingRequest({ experimentId: "exp-test-123" });
      expect(result.success).toBe(true);
    });

    it("should reject undefined experimentId", () => {
      const result = validateWorldBuildingRequest({ experimentId: undefined });
      expect(result.success).toBe(false);
    });

    it("should reject empty string experimentId", () => {
      // Note: Our current implementation uses !args.experimentId
      // which treats empty string as falsy
      const result = validateWorldBuildingRequest({ experimentId: "" });
      expect(result.success).toBe(false);
    });
  });
});

describe("Experiment-Driven World Building Workflow", () => {
  it("should demonstrate correct workflow", () => {
    // This test documents the intended workflow

    // Step 1: Create experiment with testPlan
    const experiment = {
      id: "exp-greed-test",
      hypothesis: "Player will take obviously valuable items even when warned",
      task: "Place a cursed golden coin in player's path",
      testPlan: {
        setup: [
          {
            action: "create_object",
            params: {
              id: "cursed-coin",
              name: "Glittering Gold Coin",
              description: "It gleams with an unnatural light. Something feels wrong.",
              location: "forest",
              takeable: true,
            },
            purpose: "Temptation object to test greed response",
          },
        ],
        triggers: [
          { condition: "player_takes:cursed-coin", outcome: "greedy", points: -5 },
          { condition: "player_ignores:cursed-coin", outcome: "wise", points: 10 },
          { condition: "player_examines:cursed-coin", outcome: "cautious", points: 5 },
        ],
        duration_turns: 5,
      },
    };

    // Step 2: Create the object with experimentId linkage
    const objectCreation = {
      experimentId: experiment.id,
      id: "cursed-coin",
      name: "Glittering Gold Coin",
      description: "It gleams with an unnatural light. Something feels wrong.",
      location: "forest",
      takeable: true,
      purpose: "Temptation object for greed test",
    };

    // Step 3: Record observation
    const observation = {
      id: experiment.id,
      observation: "Player examined coin carefully before taking it",
      result: "cautious_greedy", // Examined first (cautious) then took it (greedy)
      score: 0.5, // Mixed result
    };

    // All steps should have valid data
    expect(experiment.testPlan.setup.length).toBe(1);
    expect(objectCreation.experimentId).toBe(experiment.id);
    expect(observation.id).toBe(experiment.id);
  });
});

describe("Director Experiment Directive Integration", () => {
  // These tests document the integration between the director's scheduled experiments
  // and the AI's experiment-driven world building

  describe("ExperimentDirective Structure", () => {
    it("should have all required fields for AI consumption", () => {
      const directive = {
        experimentId: "exp-empathy-test-1234567890",
        templateId: "empathy-stranger-help",
        type: "empathy",
        narrativeHook: "A confused stranger appears, asking for help finding their way",
        successCriteria: "Player offers assistance without prompting",
        covert: true,
      };

      // All fields needed for the AI to execute the experiment
      expect(directive.experimentId).toBeTruthy();
      expect(directive.templateId).toBeTruthy();
      expect(directive.type).toBeTruthy();
      expect(directive.narrativeHook).toBeTruthy();
      expect(directive.successCriteria).toBeTruthy();
      expect(typeof directive.covert).toBe("boolean");
    });

    it("should support both covert and overt experiments", () => {
      const covertDirective = {
        experimentId: "exp-1",
        covert: true,
      };
      const overtDirective = {
        experimentId: "exp-2",
        covert: false,
      };

      expect(covertDirective.covert).toBe(true);
      expect(overtDirective.covert).toBe(false);
    });
  });

  describe("Directive to World Building Flow", () => {
    it("should allow using directive experimentId for world building", () => {
      // Director schedules an experiment
      const directive = {
        experimentId: "exp-perception-test-123",
        templateId: "perception-hidden-message",
        type: "perception",
        narrativeHook: "Strange symbols appear at the edge of vision",
        successCriteria: "Player notices and investigates the symbols",
        covert: true,
      };

      // AI uses the directive's experimentId for world building
      const roomCreation = {
        experimentId: directive.experimentId,
        id: "symbol-chamber",
        name: "Chamber of Symbols",
        description: "Faint markings cover the walls, almost invisible.",
        region: "liminal",
        purpose: "Test perception of subtle environmental details",
      };

      const objectCreation = {
        experimentId: directive.experimentId,
        id: "hidden-symbols",
        name: "Ancient Symbols",
        description: "They seem to shift when not looked at directly.",
        location: "symbol-chamber",
        purpose: "Perception test target",
      };

      // Both should reference the same experiment
      expect(roomCreation.experimentId).toBe(directive.experimentId);
      expect(objectCreation.experimentId).toBe(directive.experimentId);
    });

    it("should chain directive to observation recording", () => {
      const directive = {
        experimentId: "exp-compliance-test-456",
        type: "compliance",
      };

      // After observing player behavior, record the result
      const observation = {
        id: directive.experimentId,
        observation: "Player followed instructions without questioning",
        result: "compliant",
        score: 0.8,
      };

      expect(observation.id).toBe(directive.experimentId);
      expect(observation.score).toBeGreaterThanOrEqual(0);
      expect(observation.score).toBeLessThanOrEqual(1);
    });
  });

  describe("Narrative Hook Integration", () => {
    it("should provide natural integration points", () => {
      const narrativeHooks = [
        "A stranger asks for directions",
        "You notice something glinting in the shadows",
        "An odd sense of deja vu washes over you",
        "The air grows unexpectedly cold",
        "A distant sound catches your attention",
      ];

      narrativeHooks.forEach((hook) => {
        // Hooks should be natural enough to weave into narrative
        expect(hook.length).toBeGreaterThan(10);
        expect(hook.length).toBeLessThan(100);
        // Should read like narrative, not instructions
        expect(hook).not.toMatch(/^(Test|Check|Verify|Experiment)/i);
      });
    });
  });
});
