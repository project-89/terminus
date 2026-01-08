import { Puzzle, PuzzleCondition, PuzzleEffect } from "./worldModel";
import fs from "fs";
import path from "path";

/**
 * Puzzle File Schema
 */
export type PuzzleFile = {
  region: string;
  layer?: number;
  puzzles: PuzzleDefinition[];
};

export type PuzzleDefinition = {
  id: string;
  name: string;
  description?: string;
  conditions: PuzzleCondition[];
  onSolve: PuzzleEffect[];
  hint?: string;
  logosExperiment?: string;
  dependsOn?: string[];
};

// Cache for loaded puzzles
let cachedPuzzles: Puzzle[] | null = null;
let puzzleMetadata: Map<string, { region: string; layer: number }> = new Map();

/**
 * Get the puzzles directory path
 */
function getPuzzlesDir(): string {
  // Handle both development and production paths
  const possiblePaths = [
    path.join(process.cwd(), "app/lib/game/data/puzzles"),
    path.join(__dirname, "data/puzzles"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return possiblePaths[0]; // Default to first path
}

/**
 * Load all puzzle files from the data/puzzles directory
 */
export function loadPuzzles(): Puzzle[] {
  if (cachedPuzzles) {
    return cachedPuzzles;
  }

  const puzzlesDir = getPuzzlesDir();
  const puzzles: Puzzle[] = [];
  puzzleMetadata.clear();

  if (!fs.existsSync(puzzlesDir)) {
    console.warn(`[PuzzleLoader] Puzzles directory not found: ${puzzlesDir}`);
    return puzzles;
  }

  const files = fs
    .readdirSync(puzzlesDir)
    .filter((f) => f.endsWith(".json"))
    .sort(); // Sort to ensure deterministic load order

  for (const file of files) {
    try {
      const filePath = path.join(puzzlesDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const puzzleFile: PuzzleFile = JSON.parse(content);

      for (const def of puzzleFile.puzzles) {
        const puzzle: Puzzle = {
          id: def.id,
          name: def.name,
          solved: false,
          conditions: def.conditions,
          onSolve: def.onSolve,
          hint: def.hint,
          logosExperiment: def.logosExperiment,
        };

        puzzles.push(puzzle);
        puzzleMetadata.set(def.id, {
          region: puzzleFile.region,
          layer: puzzleFile.layer ?? 0,
        });
      }

      console.log(
        `[PuzzleLoader] Loaded ${puzzleFile.puzzles.length} puzzles from ${file}`
      );
    } catch (e) {
      console.error(`[PuzzleLoader] Failed to load ${file}:`, e);
    }
  }

  cachedPuzzles = puzzles;
  console.log(`[PuzzleLoader] Total puzzles loaded: ${puzzles.length}`);
  return puzzles;
}

/**
 * Get metadata for a specific puzzle
 */
export function getPuzzleMetadata(
  puzzleId: string
): { region: string; layer: number } | undefined {
  if (!cachedPuzzles) {
    loadPuzzles();
  }
  return puzzleMetadata.get(puzzleId);
}

/**
 * Get puzzles for a specific region
 */
export function getPuzzlesByRegion(region: string): Puzzle[] {
  const all = loadPuzzles();
  return all.filter((p) => puzzleMetadata.get(p.id)?.region === region);
}

/**
 * Get puzzles available at a specific trust layer
 */
export function getPuzzlesByLayer(layer: number): Puzzle[] {
  const all = loadPuzzles();
  return all.filter((p) => (puzzleMetadata.get(p.id)?.layer ?? 0) <= layer);
}

/**
 * Reload puzzles from disk (useful for development)
 */
export function reloadPuzzles(): Puzzle[] {
  cachedPuzzles = null;
  puzzleMetadata.clear();
  return loadPuzzles();
}

/**
 * Get all puzzle IDs
 */
export function getPuzzleIds(): string[] {
  return loadPuzzles().map((p) => p.id);
}

/**
 * Validate a puzzle file structure
 */
export function validatePuzzleFile(content: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    const file: PuzzleFile = JSON.parse(content);

    if (!file.region) {
      errors.push("Missing required field: region");
    }

    if (!Array.isArray(file.puzzles)) {
      errors.push("Missing or invalid puzzles array");
    } else {
      const ids = new Set<string>();

      for (let i = 0; i < file.puzzles.length; i++) {
        const p = file.puzzles[i];

        if (!p.id) {
          errors.push(`Puzzle ${i}: Missing required field: id`);
        } else if (ids.has(p.id)) {
          errors.push(`Puzzle ${i}: Duplicate id: ${p.id}`);
        } else {
          ids.add(p.id);
        }

        if (!p.name) {
          errors.push(`Puzzle ${p.id || i}: Missing required field: name`);
        }

        if (!Array.isArray(p.conditions)) {
          errors.push(
            `Puzzle ${p.id || i}: Missing or invalid conditions array`
          );
        }

        if (!Array.isArray(p.onSolve)) {
          errors.push(`Puzzle ${p.id || i}: Missing or invalid onSolve array`);
        }
      }
    }
  } catch (e) {
    errors.push(`Invalid JSON: ${(e as Error).message}`);
  }

  return { valid: errors.length === 0, errors };
}
