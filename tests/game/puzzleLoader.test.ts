import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  loadPuzzles,
  reloadPuzzles,
  getPuzzlesByRegion,
  getPuzzlesByLayer,
  getPuzzleMetadata,
  getPuzzleIds,
  validatePuzzleFile,
} from "@/app/lib/game/puzzleLoader";

/**
 * Puzzle Loader Tests
 *
 * Tests the JSON puzzle file loading system:
 * - Loading puzzles from files
 * - Region/layer filtering
 * - Validation
 * - Caching
 */

describe("Puzzle Loader", () => {
  beforeEach(() => {
    // Clear cache before each test
    reloadPuzzles();
  });

  describe("Loading Puzzles", () => {
    it("should load puzzles from JSON files", () => {
      const puzzles = loadPuzzles();
      expect(puzzles.length).toBeGreaterThan(0);
    });

    it("should load all expected puzzles", () => {
      const puzzles = loadPuzzles();
      const ids = puzzles.map((p) => p.id);

      expect(ids).toContain("become-void");
      expect(ids).toContain("find-lighter");
      expect(ids).toContain("burn-vines");
      expect(ids).toContain("unlock-turnstile");
      expect(ids).toContain("platform-shift");
      expect(ids).toContain("focus-dream-desk");
    });

    it("should have valid puzzle structure", () => {
      const puzzles = loadPuzzles();

      for (const puzzle of puzzles) {
        expect(puzzle.id).toBeTruthy();
        expect(puzzle.name).toBeTruthy();
        expect(Array.isArray(puzzle.conditions)).toBe(true);
        expect(Array.isArray(puzzle.onSolve)).toBe(true);
        expect(puzzle.solved).toBe(false);
      }
    });

    it("should cache loaded puzzles", () => {
      const first = loadPuzzles();
      const second = loadPuzzles();

      // Should return same array reference (cached)
      expect(first).toBe(second);
    });

    it("should reload puzzles on demand", () => {
      const first = loadPuzzles();
      const second = reloadPuzzles();

      // Should return different array (reloaded)
      expect(first).not.toBe(second);
      // But same content
      expect(first.length).toBe(second.length);
    });
  });

  describe("Puzzle Metadata", () => {
    it("should track puzzle regions", () => {
      loadPuzzles();

      const voidMeta = getPuzzleMetadata("become-void");
      expect(voidMeta?.region).toBe("OneirOS");

      const dreamMeta = getPuzzleMetadata("find-lighter");
      expect(dreamMeta?.region).toBe("Dream Realm");

      const subwayMeta = getPuzzleMetadata("platform-shift");
      expect(subwayMeta?.region).toBe("Subway System");
    });

    it("should track puzzle layers", () => {
      loadPuzzles();

      const meta = getPuzzleMetadata("become-void");
      expect(meta?.layer).toBeDefined();
      expect(meta?.layer).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Filtering", () => {
    it("should filter puzzles by region", () => {
      const dreamPuzzles = getPuzzlesByRegion("Dream Realm");

      expect(dreamPuzzles.length).toBeGreaterThan(0);
      for (const p of dreamPuzzles) {
        const meta = getPuzzleMetadata(p.id);
        expect(meta?.region).toBe("Dream Realm");
      }
    });

    it("should filter puzzles by layer", () => {
      const layer0Puzzles = getPuzzlesByLayer(0);

      expect(layer0Puzzles.length).toBeGreaterThan(0);
      for (const p of layer0Puzzles) {
        const meta = getPuzzleMetadata(p.id);
        expect(meta?.layer).toBeLessThanOrEqual(0);
      }
    });

    it("should include lower layer puzzles at higher layers", () => {
      const layer0Puzzles = getPuzzlesByLayer(0);
      const layer5Puzzles = getPuzzlesByLayer(5);

      // Higher layer should include all lower layer puzzles
      expect(layer5Puzzles.length).toBeGreaterThanOrEqual(layer0Puzzles.length);
    });
  });

  describe("Puzzle IDs", () => {
    it("should return all puzzle IDs", () => {
      const ids = getPuzzleIds();

      expect(ids.length).toBeGreaterThan(0);
      expect(ids).toContain("become-void");
      expect(ids).toContain("burn-vines");
    });

    it("should have unique IDs", () => {
      const ids = getPuzzleIds();
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("Validation", () => {
    it("should validate correct puzzle file", () => {
      const validFile = JSON.stringify({
        region: "Test Region",
        layer: 0,
        puzzles: [
          {
            id: "test-puzzle",
            name: "Test Puzzle",
            conditions: [{ type: "flag", target: "test", value: true }],
            onSolve: [{ type: "set_flag", target: "solved", value: true }],
          },
        ],
      });

      const result = validatePuzzleFile(validFile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject file missing region", () => {
      const invalidFile = JSON.stringify({
        puzzles: [],
      });

      const result = validatePuzzleFile(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing required field: region");
    });

    it("should reject puzzle missing id", () => {
      const invalidFile = JSON.stringify({
        region: "Test",
        puzzles: [
          {
            name: "No ID Puzzle",
            conditions: [],
            onSolve: [],
          },
        ],
      });

      const result = validatePuzzleFile(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Missing required field: id"))).toBe(true);
    });

    it("should reject duplicate puzzle IDs", () => {
      const invalidFile = JSON.stringify({
        region: "Test",
        puzzles: [
          { id: "dupe", name: "First", conditions: [], onSolve: [] },
          { id: "dupe", name: "Second", conditions: [], onSolve: [] },
        ],
      });

      const result = validatePuzzleFile(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Duplicate id"))).toBe(true);
    });

    it("should reject invalid JSON", () => {
      const result = validatePuzzleFile("not json");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Invalid JSON"))).toBe(true);
    });
  });
});

describe("Puzzle File Content", () => {
  describe("00-void.json", () => {
    it("should contain become-void puzzle", () => {
      const puzzles = getPuzzlesByRegion("OneirOS");
      const becomeVoid = puzzles.find((p) => p.id === "become-void");

      expect(becomeVoid).toBeDefined();
      expect(becomeVoid?.logosExperiment).toContain("metaphysical");
    });
  });

  describe("01-dream.json", () => {
    it("should contain dream sequence puzzles", () => {
      const puzzles = getPuzzlesByRegion("Dream Realm");
      const ids = puzzles.map((p) => p.id);

      expect(ids).toContain("focus-dream-desk");
      expect(ids).toContain("find-lighter");
      expect(ids).toContain("burn-vines");
    });

    it("should have burn-vines with LOGOS experiment", () => {
      const puzzles = getPuzzlesByRegion("Dream Realm");
      const burnVines = puzzles.find((p) => p.id === "burn-vines");

      expect(burnVines?.logosExperiment).toBeTruthy();
    });
  });

  describe("02-subway.json", () => {
    it("should contain subway puzzles", () => {
      const puzzles = getPuzzlesByRegion("Subway System");
      const ids = puzzles.map((p) => p.id);

      expect(ids).toContain("unlock-turnstile");
      expect(ids).toContain("platform-shift");
    });

    it("should have platform-shift with reality perception experiment", () => {
      const puzzles = getPuzzlesByRegion("Subway System");
      const platformShift = puzzles.find((p) => p.id === "platform-shift");

      expect(platformShift?.logosExperiment).toContain("light");
    });
  });
});
