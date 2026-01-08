/**
 * Tests for Experiment-Driven Tool System
 *
 * Validates that experiments control which tools are available to the AI,
 * ensuring the AI always runs within an experiment context.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  EXPERIMENT_TEMPLATES,
  DEFAULT_EXPERIMENT,
  TOOL_CATEGORIES,
  getTemplateById,
  getTemplatesForLayer,
  expandToolCategories,
  type ExperimentTemplate,
} from "@/app/lib/server/experimentTemplates";

describe("Experiment-Driven Tool System", () => {
  describe("TOOL_CATEGORIES", () => {
    it("should define all expected tool categories", () => {
      expect(TOOL_CATEGORIES).toHaveProperty("core");
      expect(TOOL_CATEGORIES).toHaveProperty("experiment");
      expect(TOOL_CATEGORIES).toHaveProperty("visual");
      expect(TOOL_CATEGORIES).toHaveProperty("puzzle");
      expect(TOOL_CATEGORIES).toHaveProperty("world");
      expect(TOOL_CATEGORIES).toHaveProperty("mission");
      expect(TOOL_CATEGORIES).toHaveProperty("memory");
      expect(TOOL_CATEGORIES).toHaveProperty("profile");
      expect(TOOL_CATEGORIES).toHaveProperty("network");
    });

    it("should have core tools always available", () => {
      expect(TOOL_CATEGORIES.core).toContain("glitch_screen");
      expect(TOOL_CATEGORIES.core).toContain("generate_sound");
      expect(TOOL_CATEGORIES.core).toContain("award_points");
    });

    it("should have experiment tools for tracking", () => {
      expect(TOOL_CATEGORIES.experiment).toContain("experiment_create");
      expect(TOOL_CATEGORIES.experiment).toContain("experiment_note");
    });

    it("should have visual tools for imagery", () => {
      expect(TOOL_CATEGORIES.visual).toContain("generate_image");
      expect(TOOL_CATEGORIES.visual).toContain("generate_shader");
      expect(TOOL_CATEGORIES.visual).toContain("matrix_rain");
      expect(TOOL_CATEGORIES.visual).toContain("stego_image");
    });
  });

  describe("expandToolCategories", () => {
    it("should expand single category", () => {
      const tools = expandToolCategories(["core"]);
      expect(tools).toEqual(TOOL_CATEGORIES.core);
    });

    it("should expand multiple categories", () => {
      const tools = expandToolCategories(["core", "experiment"]);
      expect(tools).toEqual([...TOOL_CATEGORIES.core, ...TOOL_CATEGORIES.experiment]);
    });

    it("should handle empty array", () => {
      const tools = expandToolCategories([]);
      expect(tools).toEqual([]);
    });
  });

  describe("DEFAULT_EXPERIMENT", () => {
    it("should exist as baseline narrative experiment", () => {
      expect(DEFAULT_EXPERIMENT).toBeDefined();
      expect(DEFAULT_EXPERIMENT.id).toBe("baseline_narrative");
      expect(DEFAULT_EXPERIMENT.type).toBe("perception");
    });

    it("should be available at layer 0", () => {
      expect(DEFAULT_EXPERIMENT.minLayer).toBe(0);
    });

    it("should have no cooldown", () => {
      expect(DEFAULT_EXPERIMENT.cooldownHours).toBe(0);
    });

    it("should have lowest priority", () => {
      expect(DEFAULT_EXPERIMENT.priority).toBe(0);
    });

    it("should have requiredTools defined", () => {
      expect(DEFAULT_EXPERIMENT.requiredTools).toBeDefined();
      expect(Array.isArray(DEFAULT_EXPERIMENT.requiredTools)).toBe(true);
      expect(DEFAULT_EXPERIMENT.requiredTools!.length).toBeGreaterThan(0);
    });

    it("should include core and experiment tools", () => {
      const tools = DEFAULT_EXPERIMENT.requiredTools!;
      expect(tools).toContain("glitch_screen");
      expect(tools).toContain("generate_sound");
      expect(tools).toContain("award_points");
      expect(tools).toContain("experiment_create");
      expect(tools).toContain("experiment_note");
    });

    it("should have empty forbiddenTools", () => {
      expect(DEFAULT_EXPERIMENT.forbiddenTools).toBeDefined();
      expect(DEFAULT_EXPERIMENT.forbiddenTools).toEqual([]);
    });

    it("should be covert", () => {
      expect(DEFAULT_EXPERIMENT.covert).toBe(true);
    });
  });

  describe("EXPERIMENT_TEMPLATES", () => {
    it("should have all templates with requiredTools", () => {
      for (const template of EXPERIMENT_TEMPLATES) {
        expect(template.requiredTools).toBeDefined();
        expect(Array.isArray(template.requiredTools)).toBe(true);
        expect(template.requiredTools!.length).toBeGreaterThan(0);
      }
    });

    it("should have all templates include core tools", () => {
      for (const template of EXPERIMENT_TEMPLATES) {
        const tools = template.requiredTools!;
        // All experiments should have at least glitch_screen (from core)
        expect(tools).toContain("glitch_screen");
      }
    });

    it("should have all templates include experiment tools", () => {
      for (const template of EXPERIMENT_TEMPLATES) {
        const tools = template.requiredTools!;
        // All experiments should have experiment tracking tools
        expect(tools).toContain("experiment_create");
        expect(tools).toContain("experiment_note");
      }
    });

    describe("compliance experiments", () => {
      it("compliance_return_time should have core and experiment tools", () => {
        const template = getTemplateById("compliance_return_time");
        expect(template).toBeDefined();
        expect(template!.requiredTools).toContain("glitch_screen");
        expect(template!.requiredTools).toContain("experiment_create");
      });

      it("compliance_instruction_follow should have puzzle tools", () => {
        const template = getTemplateById("compliance_instruction_follow");
        expect(template).toBeDefined();
        expect(template!.requiredTools).toContain("puzzle_create");
        expect(template!.requiredTools).toContain("puzzle_solve");
      });
    });

    describe("creativity experiments", () => {
      it("creativity_dream_recall should have memory tools", () => {
        const template = getTemplateById("creativity_dream_recall");
        expect(template).toBeDefined();
        expect(template!.requiredTools).toContain("write_memory");
        expect(template!.requiredTools).toContain("dream_record");
      });

      it("creativity_symbol_meaning should have visual tools", () => {
        const template = getTemplateById("creativity_symbol_meaning");
        expect(template).toBeDefined();
        expect(template!.requiredTools).toContain("generate_image");
        expect(template!.requiredTools).toContain("generate_shader");
      });

      it("creativity_reality_glitch should have visual tools", () => {
        const template = getTemplateById("creativity_reality_glitch");
        expect(template).toBeDefined();
        expect(template!.requiredTools).toContain("generate_image");
      });
    });

    describe("empathy experiments", () => {
      it("empathy_npc_distress should have world tools", () => {
        const template = getTemplateById("empathy_npc_distress");
        expect(template).toBeDefined();
        expect(template!.requiredTools).toContain("world_create_npc");
        expect(template!.requiredTools).toContain("world_create_room");
      });

      it("empathy_kindness_opportunity should have world tools", () => {
        const template = getTemplateById("empathy_kindness_opportunity");
        expect(template).toBeDefined();
        expect(template!.requiredTools).toContain("world_create_npc");
      });
    });

    describe("perception experiments", () => {
      it("perception_cross_session should have memory tools", () => {
        const template = getTemplateById("perception_cross_session");
        expect(template).toBeDefined();
        expect(template!.requiredTools).toContain("write_memory");
      });

      it("perception_synchronicity_seed should have memory tools", () => {
        const template = getTemplateById("perception_synchronicity_seed");
        expect(template).toBeDefined();
        expect(template!.requiredTools).toContain("synchronicity_log");
      });
    });
  });

  describe("getTemplatesForLayer", () => {
    it("should return templates available at layer 0", () => {
      const templates = getTemplatesForLayer(0);
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach((t) => {
        expect(t.minLayer).toBeLessThanOrEqual(0);
      });
    });

    it("should return more templates at higher layers", () => {
      const layer0 = getTemplatesForLayer(0);
      const layer1 = getTemplatesForLayer(1);
      const layer2 = getTemplatesForLayer(2);

      // Higher layers should have at least as many templates
      expect(layer1.length).toBeGreaterThanOrEqual(layer0.length);
      expect(layer2.length).toBeGreaterThanOrEqual(layer1.length);
    });

    it("should respect maxLayer if defined", () => {
      const templates = getTemplatesForLayer(5);
      templates.forEach((t) => {
        if (t.maxLayer !== undefined) {
          expect(t.maxLayer).toBeGreaterThanOrEqual(5);
        }
      });
    });
  });

  describe("Tool filtering logic", () => {
    // Helper to simulate tool filtering
    function filterToolsByExperiment(
      allTools: string[],
      requiredTools: string[],
      forbiddenTools: string[]
    ): string[] {
      return requiredTools.filter(
        (t) => allTools.includes(t) && !forbiddenTools.includes(t)
      );
    }

    it("should include only required tools", () => {
      const allTools = ["a", "b", "c", "d", "e"];
      const required = ["a", "c", "e"];
      const forbidden: string[] = [];

      const result = filterToolsByExperiment(allTools, required, forbidden);
      expect(result).toEqual(["a", "c", "e"]);
    });

    it("should exclude forbidden tools", () => {
      const allTools = ["a", "b", "c", "d", "e"];
      const required = ["a", "b", "c"];
      const forbidden = ["b"];

      const result = filterToolsByExperiment(allTools, required, forbidden);
      expect(result).toEqual(["a", "c"]);
    });

    it("should not include tools that don't exist", () => {
      const allTools = ["a", "b"];
      const required = ["a", "c", "d"]; // c and d don't exist
      const forbidden: string[] = [];

      const result = filterToolsByExperiment(allTools, required, forbidden);
      expect(result).toEqual(["a"]);
    });

    it("should work with DEFAULT_EXPERIMENT tools", () => {
      const mockAllTools = [
        "glitch_screen",
        "generate_sound",
        "award_points",
        "experiment_create",
        "experiment_note",
        "generate_image",
        "world_create_room",
      ];

      const result = filterToolsByExperiment(
        mockAllTools,
        DEFAULT_EXPERIMENT.requiredTools!,
        DEFAULT_EXPERIMENT.forbiddenTools!
      );

      // Should include core and experiment tools that exist in allTools
      expect(result).toContain("glitch_screen");
      expect(result).toContain("experiment_create");
      expect(result).toContain("experiment_note");
      // Should NOT include generate_image (not in DEFAULT_EXPERIMENT.requiredTools)
      expect(result).not.toContain("generate_image");
    });
  });

  describe("Experiment types coverage", () => {
    it("should have templates for all experiment types", () => {
      const types = new Set(EXPERIMENT_TEMPLATES.map((t) => t.type));
      expect(types.has("compliance")).toBe(true);
      expect(types.has("creativity")).toBe(true);
      expect(types.has("empathy")).toBe(true);
      expect(types.has("perception")).toBe(true);
    });

    it("should have multiple templates per type", () => {
      const typeCounts: Record<string, number> = {};
      for (const template of EXPERIMENT_TEMPLATES) {
        typeCounts[template.type] = (typeCounts[template.type] || 0) + 1;
      }

      expect(typeCounts["compliance"]).toBeGreaterThanOrEqual(2);
      expect(typeCounts["creativity"]).toBeGreaterThanOrEqual(2);
      expect(typeCounts["empathy"]).toBeGreaterThanOrEqual(2);
      expect(typeCounts["perception"]).toBeGreaterThanOrEqual(2);
    });
  });
});
