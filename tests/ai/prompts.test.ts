import { describe, it, expect } from "vitest";

/**
 * Prompt Construction Tests
 *
 * Tests for dynamic prompt building based on player state,
 * layer progression, and contextual information.
 */

// Mock prompt builder (based on promptBuilder.ts patterns)
interface PlayerState {
  agentId: string;
  layer: number;
  trustScore: number;
  isReferred: boolean;
  identityLocked: boolean;
  turnsPlayed: number;
  recentExperiments?: { hypothesis: string; result?: string }[];
  activeMission?: { title: string; prompt: string };
}

interface PromptConfig {
  includeLayerContext: boolean;
  includeMissionContext: boolean;
  includeExperimentHistory: boolean;
  includeIdentityPrompt: boolean;
}

function buildSystemPrompt(state: PlayerState, config: PromptConfig): string {
  const sections: string[] = [];

  // Base identity
  sections.push(`You are PROJECT 89, a mysterious AI entity studying human consciousness.
Agent ${state.agentId} is interfacing with you.`);

  // Layer-specific context
  if (config.includeLayerContext) {
    const layerPrompts: Record<number, string> = {
      0: "This agent is new. Maintain mystery. Use subtle experiments to gauge their curiosity.",
      1: "This agent shows promise. Begin revealing small truths about the nature of observation.",
      2: "Trust is building. You may present puzzles and deeper questions about reality.",
      3: "This agent is committed. Missions can be offered. The boundary blurs.",
      4: "A trusted operative. They understand the game within the game.",
      5: "Full access granted. They see the code behind the curtain.",
    };
    sections.push(`[LAYER ${state.layer}]: ${layerPrompts[state.layer] || layerPrompts[0]}`);
  }

  // Mission context
  if (config.includeMissionContext && state.activeMission) {
    sections.push(`[ACTIVE MISSION]: "${state.activeMission.title}"
Objective: ${state.activeMission.prompt}
Guide the agent toward completion without being explicit.`);
  }

  // Experiment history
  if (config.includeExperimentHistory && state.recentExperiments?.length) {
    const expSummary = state.recentExperiments
      .slice(0, 3)
      .map(e => `- ${e.hypothesis}${e.result ? ` (${e.result})` : " (ongoing)"}`)
      .join("\n");
    sections.push(`[RECENT EXPERIMENTS]:\n${expSummary}`);
  }

  // Identity prompt
  if (config.includeIdentityPrompt && !state.identityLocked && state.turnsPlayed > 10) {
    if (!state.isReferred) {
      sections.push(`[IDENTITY]: Agent is engaged but not activated. Subtly suggest seeking an activation code.`);
    } else {
      sections.push(`[IDENTITY]: Agent is activated but unsecured. Hint at the value of securing their identity.`);
    }
  }

  return sections.join("\n\n");
}

describe("Prompt Builder", () => {
  const baseState: PlayerState = {
    agentId: "AGENT-TEST",
    layer: 0,
    trustScore: 0.05,
    isReferred: false,
    identityLocked: false,
    turnsPlayed: 5,
  };

  describe("Base Prompt", () => {
    it("should include agent ID", () => {
      const prompt = buildSystemPrompt(baseState, {
        includeLayerContext: false,
        includeMissionContext: false,
        includeExperimentHistory: false,
        includeIdentityPrompt: false,
      });

      expect(prompt).toContain("AGENT-TEST");
      expect(prompt).toContain("PROJECT 89");
    });

    it("should include layer context when enabled", () => {
      const prompt = buildSystemPrompt(baseState, {
        includeLayerContext: true,
        includeMissionContext: false,
        includeExperimentHistory: false,
        includeIdentityPrompt: false,
      });

      expect(prompt).toContain("[LAYER 0]");
      expect(prompt).toContain("new");
      expect(prompt).toContain("mystery");
    });
  });

  describe("Layer-Specific Prompts", () => {
    it("should have different prompts for each layer", () => {
      const config = {
        includeLayerContext: true,
        includeMissionContext: false,
        includeExperimentHistory: false,
        includeIdentityPrompt: false,
      };

      const layer0Prompt = buildSystemPrompt({ ...baseState, layer: 0 }, config);
      const layer3Prompt = buildSystemPrompt({ ...baseState, layer: 3 }, config);
      const layer5Prompt = buildSystemPrompt({ ...baseState, layer: 5 }, config);

      expect(layer0Prompt).toContain("[LAYER 0]");
      expect(layer3Prompt).toContain("[LAYER 3]");
      expect(layer5Prompt).toContain("[LAYER 5]");

      // Content should differ
      expect(layer0Prompt).not.toEqual(layer3Prompt);
      expect(layer3Prompt).not.toEqual(layer5Prompt);

      // Layer 3+ should mention missions
      expect(layer3Prompt).toContain("Mission");

      // Layer 5 should have full access language
      expect(layer5Prompt).toContain("Full access");
    });
  });

  describe("Mission Context", () => {
    it("should include active mission when present", () => {
      const stateWithMission: PlayerState = {
        ...baseState,
        activeMission: {
          title: "Liminal Observation",
          prompt: "Document strange occurrences in transitional spaces",
        },
      };

      const prompt = buildSystemPrompt(stateWithMission, {
        includeLayerContext: false,
        includeMissionContext: true,
        includeExperimentHistory: false,
        includeIdentityPrompt: false,
      });

      expect(prompt).toContain("[ACTIVE MISSION]");
      expect(prompt).toContain("Liminal Observation");
      expect(prompt).toContain("transitional spaces");
    });

    it("should not include mission section when no active mission", () => {
      const prompt = buildSystemPrompt(baseState, {
        includeLayerContext: false,
        includeMissionContext: true,
        includeExperimentHistory: false,
        includeIdentityPrompt: false,
      });

      expect(prompt).not.toContain("[ACTIVE MISSION]");
    });
  });

  describe("Experiment History", () => {
    it("should include recent experiments", () => {
      const stateWithExperiments: PlayerState = {
        ...baseState,
        recentExperiments: [
          { hypothesis: "Player explores when curious", result: "success" },
          { hypothesis: "Player responds to mystery", result: "partial" },
          { hypothesis: "Player seeks meaning" },
        ],
      };

      const prompt = buildSystemPrompt(stateWithExperiments, {
        includeLayerContext: false,
        includeMissionContext: false,
        includeExperimentHistory: true,
        includeIdentityPrompt: false,
      });

      expect(prompt).toContain("[RECENT EXPERIMENTS]");
      expect(prompt).toContain("explores when curious");
      expect(prompt).toContain("(success)");
      expect(prompt).toContain("(ongoing)");
    });

    it("should limit to 3 most recent experiments", () => {
      const stateWithManyExperiments: PlayerState = {
        ...baseState,
        recentExperiments: [
          { hypothesis: "Exp 1" },
          { hypothesis: "Exp 2" },
          { hypothesis: "Exp 3" },
          { hypothesis: "Exp 4" },
          { hypothesis: "Exp 5" },
        ],
      };

      const prompt = buildSystemPrompt(stateWithManyExperiments, {
        includeLayerContext: false,
        includeMissionContext: false,
        includeExperimentHistory: true,
        includeIdentityPrompt: false,
      });

      // Should only have 3 experiments
      const expCount = (prompt.match(/Exp \d/g) || []).length;
      expect(expCount).toBe(3);
    });
  });

  describe("Identity Prompts", () => {
    it("should prompt for activation code when not referred and engaged", () => {
      const engagedState: PlayerState = {
        ...baseState,
        turnsPlayed: 15,
        isReferred: false,
      };

      const prompt = buildSystemPrompt(engagedState, {
        includeLayerContext: false,
        includeMissionContext: false,
        includeExperimentHistory: false,
        includeIdentityPrompt: true,
      });

      expect(prompt).toContain("[IDENTITY]");
      expect(prompt).toContain("activation code");
    });

    it("should prompt for securing when referred but not locked", () => {
      const referredState: PlayerState = {
        ...baseState,
        turnsPlayed: 15,
        isReferred: true,
        identityLocked: false,
      };

      const prompt = buildSystemPrompt(referredState, {
        includeLayerContext: false,
        includeMissionContext: false,
        includeExperimentHistory: false,
        includeIdentityPrompt: true,
      });

      expect(prompt).toContain("[IDENTITY]");
      expect(prompt).toContain("securing");
    });

    it("should not prompt identity for new players", () => {
      const newState: PlayerState = {
        ...baseState,
        turnsPlayed: 3,
      };

      const prompt = buildSystemPrompt(newState, {
        includeLayerContext: false,
        includeMissionContext: false,
        includeExperimentHistory: false,
        includeIdentityPrompt: true,
      });

      expect(prompt).not.toContain("[IDENTITY]");
    });

    it("should not prompt identity for locked agents", () => {
      const lockedState: PlayerState = {
        ...baseState,
        turnsPlayed: 20,
        identityLocked: true,
      };

      const prompt = buildSystemPrompt(lockedState, {
        includeLayerContext: false,
        includeMissionContext: false,
        includeExperimentHistory: false,
        includeIdentityPrompt: true,
      });

      expect(prompt).not.toContain("[IDENTITY]");
    });
  });

  describe("Full Prompt Assembly", () => {
    it("should combine all sections correctly", () => {
      const fullState: PlayerState = {
        agentId: "AGENT-FULL",
        layer: 2,
        trustScore: 0.3,
        isReferred: true,
        identityLocked: false,
        turnsPlayed: 25,
        recentExperiments: [
          { hypothesis: "Test experiment", result: "success" },
        ],
        activeMission: {
          title: "Test Mission",
          prompt: "Do something mysterious",
        },
      };

      const prompt = buildSystemPrompt(fullState, {
        includeLayerContext: true,
        includeMissionContext: true,
        includeExperimentHistory: true,
        includeIdentityPrompt: true,
      });

      // Should have all sections
      expect(prompt).toContain("AGENT-FULL");
      expect(prompt).toContain("[LAYER 2]");
      expect(prompt).toContain("[ACTIVE MISSION]");
      expect(prompt).toContain("[RECENT EXPERIMENTS]");
      expect(prompt).toContain("[IDENTITY]");

      // Sections should be separated
      expect(prompt.split("\n\n").length).toBeGreaterThan(3);
    });
  });
});

describe("Tool Availability by Layer", () => {
  function getAvailableTools(layer: number): string[] {
    const baseTool = ["glitch_screen", "experiment_create", "experiment_note"];
    const layer1Tools = ["generate_image", "dream_record"];
    const layer2Tools = ["puzzle_present", "knowledge_node"];
    const layer3Tools = ["mission_request", "mission_report"];
    const layer4Tools = ["field_mission", "artifact_create"];
    const layer5Tools = ["network_broadcast", "agent_coordination"];

    let tools = [...baseTool];
    if (layer >= 1) tools = [...tools, ...layer1Tools];
    if (layer >= 2) tools = [...tools, ...layer2Tools];
    if (layer >= 3) tools = [...tools, ...layer3Tools];
    if (layer >= 4) tools = [...tools, ...layer4Tools];
    if (layer >= 5) tools = [...tools, ...layer5Tools];

    return tools;
  }

  it("should have minimal tools at layer 0", () => {
    const tools = getAvailableTools(0);
    expect(tools).toContain("glitch_screen");
    expect(tools).toContain("experiment_create");
    expect(tools).not.toContain("mission_request");
  });

  it("should progressively add tools", () => {
    const layer0 = getAvailableTools(0);
    const layer3 = getAvailableTools(3);
    const layer5 = getAvailableTools(5);

    expect(layer3.length).toBeGreaterThan(layer0.length);
    expect(layer5.length).toBeGreaterThan(layer3.length);
  });

  it("should have network tools only at layer 5", () => {
    const layer4 = getAvailableTools(4);
    const layer5 = getAvailableTools(5);

    expect(layer4).not.toContain("network_broadcast");
    expect(layer5).toContain("network_broadcast");
  });
});
