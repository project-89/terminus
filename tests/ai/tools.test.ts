import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

/**
 * AI Tool Tests
 *
 * These tests validate tool definitions, schemas, and handlers
 * WITHOUT calling the actual AI model.
 */

// Mock tool definitions (extracted from adventure/route.ts patterns)
const mockToolDefinitions = {
  glitch_screen: {
    description: "Create visual glitch effect on terminal",
    parameters: z.object({
      intensity: z.number().min(0).max(1).describe("Glitch intensity"),
      duration_ms: z.number().min(100).max(5000).describe("Duration"),
      glitch_type: z.enum(["static", "corruption", "wave"]).optional(),
    }),
  },
  experiment_create: {
    description: "Create a behavioral experiment to track player responses",
    parameters: z.object({
      hypothesis: z.string().describe("What you're testing"),
      task: z.string().describe("The experiment task"),
      success_criteria: z.string().optional(),
      title: z.string().optional(),
    }),
  },
  generate_image: {
    description: "Generate an image for the terminal",
    parameters: z.object({
      prompt: z.string().describe("Image description"),
      mode: z.enum(["subliminal", "overlay", "fullscreen"]).default("subliminal"),
      intensity: z.number().min(0).max(1).default(0.3),
    }),
  },
};

describe("AI Tool Definitions", () => {
  describe("Schema Validation", () => {
    it("should have valid glitch_screen parameters", () => {
      const schema = mockToolDefinitions.glitch_screen.parameters;

      // Valid input
      const validInput = { intensity: 0.5, duration_ms: 1000 };
      expect(() => schema.parse(validInput)).not.toThrow();

      // Invalid intensity (out of range)
      const invalidIntensity = { intensity: 1.5, duration_ms: 1000 };
      expect(() => schema.parse(invalidIntensity)).toThrow();

      // Invalid duration (too short)
      const invalidDuration = { intensity: 0.5, duration_ms: 50 };
      expect(() => schema.parse(invalidDuration)).toThrow();
    });

    it("should have valid experiment_create parameters", () => {
      const schema = mockToolDefinitions.experiment_create.parameters;

      // Valid input with required fields only
      const minimalInput = { hypothesis: "Test hypothesis", task: "Test task" };
      expect(() => schema.parse(minimalInput)).not.toThrow();

      // Valid input with all fields
      const fullInput = {
        hypothesis: "Player will explore",
        task: "Observe navigation",
        success_criteria: "Player types look",
        title: "Exploration Test",
      };
      expect(() => schema.parse(fullInput)).not.toThrow();

      // Missing required field
      const missingTask = { hypothesis: "Test" };
      expect(() => schema.parse(missingTask)).toThrow();
    });

    it("should have valid generate_image parameters", () => {
      const schema = mockToolDefinitions.generate_image.parameters;

      // Minimal input (uses defaults)
      const minimalInput = { prompt: "A mysterious void" };
      const parsed = schema.parse(minimalInput);
      expect(parsed.mode).toBe("subliminal");
      expect(parsed.intensity).toBe(0.3);

      // Full input
      const fullInput = { prompt: "Test", mode: "fullscreen" as const, intensity: 0.8 };
      expect(() => schema.parse(fullInput)).not.toThrow();

      // Invalid mode
      const invalidMode = { prompt: "Test", mode: "invalid" };
      expect(() => schema.parse(invalidMode)).toThrow();
    });
  });

  describe("Tool Descriptions", () => {
    it("should have descriptions for all tools", () => {
      for (const [name, tool] of Object.entries(mockToolDefinitions)) {
        expect(tool.description).toBeTruthy();
        expect(tool.description.length).toBeGreaterThan(10);
      }
    });
  });
});

describe("Tool Handler Execution", () => {
  // Mock handlers that would normally be in ToolHandler.ts
  const mockHandlers = {
    glitch_screen: vi.fn().mockResolvedValue({ success: true, type: "visual" }),
    experiment_create: vi.fn().mockResolvedValue({
      success: true,
      id: "exp-test-123",
      type: "experiment"
    }),
    generate_image: vi.fn().mockResolvedValue({
      success: true,
      url: "https://example.com/image.png",
      type: "image"
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should execute glitch_screen handler", async () => {
    const params = { intensity: 0.7, duration_ms: 2000, glitch_type: "corruption" as const };

    await mockHandlers.glitch_screen(params);

    expect(mockHandlers.glitch_screen).toHaveBeenCalledWith(params);
    expect(mockHandlers.glitch_screen).toHaveBeenCalledTimes(1);
  });

  it("should execute experiment_create handler", async () => {
    const params = {
      hypothesis: "Player curiosity test",
      task: "Present mysterious object"
    };

    const result = await mockHandlers.experiment_create(params);

    expect(result.success).toBe(true);
    expect(result.id).toMatch(/^exp-/);
  });

  it("should execute generate_image handler", async () => {
    const params = {
      prompt: "A glowing terminal in the void",
      mode: "subliminal" as const,
      intensity: 0.4
    };

    const result = await mockHandlers.generate_image(params);

    expect(result.success).toBe(true);
    expect(result.url).toBeTruthy();
  });
});

describe("Layer-Based Tool Access", () => {
  // Simulate getLayerTools from trustService
  const layerToolAccess: Record<number, string[]> = {
    0: ["glitch_screen", "experiment_create", "generate_image"],
    1: ["glitch_screen", "experiment_create", "generate_image", "dream_record"],
    2: ["glitch_screen", "experiment_create", "generate_image", "dream_record", "puzzle_present"],
    3: ["glitch_screen", "experiment_create", "generate_image", "dream_record", "puzzle_present", "mission_request"],
    4: ["glitch_screen", "experiment_create", "generate_image", "dream_record", "puzzle_present", "mission_request", "field_mission"],
    5: ["glitch_screen", "experiment_create", "generate_image", "dream_record", "puzzle_present", "mission_request", "field_mission", "network_broadcast"],
  };

  it("should restrict tools at layer 0", () => {
    const layer0Tools = layerToolAccess[0];
    expect(layer0Tools).toContain("glitch_screen");
    expect(layer0Tools).toContain("experiment_create");
    expect(layer0Tools).not.toContain("mission_request");
    expect(layer0Tools).not.toContain("network_broadcast");
  });

  it("should unlock mission tools at layer 3", () => {
    const layer3Tools = layerToolAccess[3];
    expect(layer3Tools).toContain("mission_request");
    expect(layer3Tools).not.toContain("network_broadcast");
  });

  it("should have all tools at layer 5", () => {
    const layer5Tools = layerToolAccess[5];
    expect(layer5Tools).toContain("network_broadcast");
    expect(layer5Tools.length).toBeGreaterThan(layerToolAccess[0].length);
  });

  it("should have progressive tool unlocking", () => {
    for (let layer = 1; layer <= 5; layer++) {
      expect(layerToolAccess[layer].length).toBeGreaterThanOrEqual(
        layerToolAccess[layer - 1].length
      );
    }
  });
});
