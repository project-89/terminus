/**
 * Puzzle Chain System
 * 
 * Creates interconnected puzzles where solving one reveals the next.
 * LOGOS can generate these dynamically, adapting to player behavior.
 */

// Database integration will be added when puzzle persistence is needed
// import { prisma } from "@/app/lib/db";
import * as ciphers from "./ciphers";
import * as stego from "./steganography";

export type PuzzleType = 
  | "cipher"           // Text-based cipher
  | "steganography"    // Hidden in image
  | "coordinates"      // Real-world location
  | "audio"            // Hidden in sound
  | "temporal"         // Time-based (appear at specific time)
  | "collaborative"    // Requires multiple players
  | "meta";            // About the puzzle system itself

export type PuzzleStatus = "locked" | "available" | "in_progress" | "solved" | "expired";

export interface PuzzleNode {
  id: string;
  chainId: string;
  order: number;
  type: PuzzleType;
  title?: string;
  
  // The puzzle content
  content: {
    encoded: string;        // What the player sees
    cipher?: string;        // Cipher used (if applicable)
    key?: string;           // Key/password (if applicable)
    mediaUrl?: string;      // Image/audio URL (if applicable)
    coordinates?: { lat: number; lng: number };
  };
  
  // Solution
  solution: string;         // The answer
  solutionHints: string[];  // Progressive hints
  
  // Unlocking
  prerequisites: string[];  // Puzzle IDs that must be solved first
  unlocksNext: string[];    // Puzzle IDs this unlocks
  
  // Metadata
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedTime: number;    // Minutes
  tags: string[];
  
  // State
  status: PuzzleStatus;
  solvedBy?: string[];      // User IDs who solved it
  solvedAt?: Date;
  attempts: number;
}

export interface PuzzleChain {
  id: string;
  title: string;
  description: string;
  
  // Structure
  nodes: PuzzleNode[];
  entryPoint: string;       // First puzzle ID
  finalReward: string;      // What solving the whole chain reveals
  
  // Targeting
  targetUserId?: string;    // Personal chain for specific user
  globalChain: boolean;     // Available to all players
  
  // Evolution
  adaptiveDifficulty: boolean;
  branchingEnabled: boolean;
  
  // State
  createdAt: Date;
  expiresAt?: Date;
  completedBy: string[];
}

/**
 * Create a new puzzle chain
 */
export async function createChain(config: {
  title: string;
  description: string;
  puzzles: Omit<PuzzleNode, "id" | "chainId" | "status" | "attempts">[];
  targetUserId?: string;
  globalChain?: boolean;
  expiresAt?: Date;
  finalReward: string;
}): Promise<PuzzleChain> {
  const chainId = `chain-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  
  const nodes: PuzzleNode[] = config.puzzles.map((puzzle, index) => ({
    ...puzzle,
    id: `puzzle-${chainId}-${index}`,
    chainId,
    status: index === 0 ? "available" : "locked",
    attempts: 0,
  }));
  
  const chain: PuzzleChain = {
    id: chainId,
    title: config.title,
    description: config.description,
    nodes,
    entryPoint: nodes[0].id,
    finalReward: config.finalReward,
    targetUserId: config.targetUserId,
    globalChain: config.globalChain ?? true,
    adaptiveDifficulty: true,
    branchingEnabled: false,
    createdAt: new Date(),
    expiresAt: config.expiresAt,
    completedBy: [],
  };
  
  // Store in database
  await storePuzzleChain(chain);
  
  return chain;
}

/**
 * Attempt to solve a puzzle
 */
export async function attemptSolution(
  puzzleId: string,
  userId: string,
  answer: string
): Promise<{
  correct: boolean;
  message: string;
  unlockedPuzzles?: string[];
  chainCompleted?: boolean;
  reward?: string;
}> {
  const puzzle = await getPuzzle(puzzleId);
  if (!puzzle) {
    return { correct: false, message: "Puzzle not found" };
  }
  
  if (puzzle.status === "locked") {
    return { correct: false, message: "This puzzle is still locked" };
  }
  
  if (puzzle.status === "solved") {
    return { correct: false, message: "Already solved" };
  }
  
  // Increment attempts
  await incrementAttempts(puzzleId);
  
  // Check solution (case-insensitive, trimmed)
  const normalizedAnswer = answer.trim().toLowerCase();
  const normalizedSolution = puzzle.solution.trim().toLowerCase();
  
  if (normalizedAnswer !== normalizedSolution) {
    // Provide hint based on attempt count
    const attempts = puzzle.attempts + 1;
    const hintIndex = Math.min(Math.floor(attempts / 3), puzzle.solutionHints.length - 1);
    const hint = puzzle.solutionHints[hintIndex];
    
    return {
      correct: false,
      message: hint ? `Not quite. Hint: ${hint}` : "Incorrect",
    };
  }
  
  // Correct!
  await markSolved(puzzleId, userId);
  
  // Unlock next puzzles
  const unlockedPuzzles: string[] = [];
  for (const nextId of puzzle.unlocksNext) {
    const unlocked = await tryUnlock(nextId, userId);
    if (unlocked) unlockedPuzzles.push(nextId);
  }
  
  // Check if chain is complete
  const chain = await getChain(puzzle.chainId);
  const allSolved = chain?.nodes.every((n) => n.status === "solved");
  
  if (allSolved && chain) {
    await markChainCompleted(chain.id, userId);
    return {
      correct: true,
      message: "Puzzle solved!",
      unlockedPuzzles,
      chainCompleted: true,
      reward: chain.finalReward,
    };
  }
  
  return {
    correct: true,
    message: "Correct! New paths have opened...",
    unlockedPuzzles,
  };
}

/**
 * Generate a cipher puzzle node
 */
export function createCipherPuzzle(config: {
  message: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  order: number;
  prerequisites?: string[];
  unlocksNext?: string[];
  tags?: string[];
}): Omit<PuzzleNode, "id" | "chainId" | "status" | "attempts"> {
  const difficultyMap: Record<number, "easy" | "medium" | "hard"> = {
    1: "easy",
    2: "easy",
    3: "medium",
    4: "hard",
    5: "hard",
  };
  
  const challenge = ciphers.generateChallenge(
    config.message,
    difficultyMap[config.difficulty]
  );
  
  return {
    order: config.order,
    type: "cipher",
    content: {
      encoded: challenge.encoded,
      cipher: challenge.cipher,
      key: challenge.key,
    },
    solution: config.message,
    solutionHints: [
      challenge.hint,
      `Cipher type: ${challenge.cipher}`,
      `First letter: ${config.message[0]}`,
    ],
    prerequisites: config.prerequisites || [],
    unlocksNext: config.unlocksNext || [],
    difficulty: config.difficulty,
    estimatedTime: config.difficulty * 5,
    tags: config.tags || ["cipher"],
  };
}

/**
 * Generate a steganography puzzle node
 */
export async function createStegoPuzzle(config: {
  imageBuffer: Buffer;
  hiddenMessage: string;
  order: number;
  prerequisites?: string[];
  unlocksNext?: string[];
  visualPattern?: "grid89" | "spiral" | "qr_ghost";
}): Promise<{
  puzzle: Omit<PuzzleNode, "id" | "chainId" | "status" | "attempts">;
  encodedImage: Buffer;
}> {
  let encodedImage = await stego.encodeMessage(config.imageBuffer, {
    type: "message",
    data: { message: config.hiddenMessage },
  });
  
  if (config.visualPattern) {
    encodedImage = await stego.embedVisualPattern(encodedImage, config.visualPattern);
  }
  
  return {
    puzzle: {
      order: config.order,
      type: "steganography",
      content: {
        encoded: "Examine this image carefully. Some secrets hide in plain sight.",
        // mediaUrl will be set when image is uploaded
      },
      solution: config.hiddenMessage,
      solutionHints: [
        "The answer is hidden within the image itself",
        "Try examining the least significant bits",
        "Look for markers: <<P89S>> ... <<P89E>>",
      ],
      prerequisites: config.prerequisites || [],
      unlocksNext: config.unlocksNext || [],
      difficulty: 4,
      estimatedTime: 20,
      tags: ["steganography", "image"],
    },
    encodedImage,
  };
}

/**
 * Generate a coordinates puzzle (IRL component)
 */
export function createCoordinatesPuzzle(config: {
  lat: number;
  lng: number;
  locationHint: string;
  whatToFind: string;
  order: number;
  prerequisites?: string[];
  unlocksNext?: string[];
}): Omit<PuzzleNode, "id" | "chainId" | "status" | "attempts"> {
  // Encode coordinates in various formats as the "encoded" content
  const dms = decimalToDMS(config.lat, config.lng);
  
  return {
    order: config.order,
    type: "coordinates",
    content: {
      encoded: `${dms.lat} ${dms.lng}`,
      coordinates: { lat: config.lat, lng: config.lng },
    },
    solution: config.whatToFind,
    solutionHints: [
      config.locationHint,
      "These are real-world coordinates",
      `Look near ${Math.abs(config.lat).toFixed(0)}° ${config.lat >= 0 ? "N" : "S"}`,
    ],
    prerequisites: config.prerequisites || [],
    unlocksNext: config.unlocksNext || [],
    difficulty: 5,
    estimatedTime: 60, // Requires going somewhere
    tags: ["coordinates", "irl", "exploration"],
  };
}

/**
 * Create a meta-puzzle that references the puzzle system itself
 */
export function createMetaPuzzle(config: {
  question: string;
  answer: string;
  order: number;
  prerequisites?: string[];
  unlocksNext?: string[];
}): Omit<PuzzleNode, "id" | "chainId" | "status" | "attempts"> {
  return {
    order: config.order,
    type: "meta",
    content: {
      encoded: config.question,
    },
    solution: config.answer,
    solutionHints: [
      "Think about what you've learned so far",
      "The answer relates to the game itself",
      "What patterns have you noticed?",
    ],
    prerequisites: config.prerequisites || [],
    unlocksNext: config.unlocksNext || [],
    difficulty: 3,
    estimatedTime: 15,
    tags: ["meta", "self-reference"],
  };
}

// Database helpers (using notes table for now, could be dedicated table)
async function storePuzzleChain(chain: PuzzleChain): Promise<void> {
  // Store as JSON in a dedicated puzzle table or notes
  // For now, log it
  console.log("[PuzzleChain] Stored:", chain.id);
}

async function getPuzzle(puzzleId: string): Promise<PuzzleNode | null> {
  // Retrieve from database
  console.log("[PuzzleChain] Get puzzle:", puzzleId);
  return null;
}

async function getChain(chainId: string): Promise<PuzzleChain | null> {
  console.log("[PuzzleChain] Get chain:", chainId);
  return null;
}

async function incrementAttempts(puzzleId: string): Promise<void> {
  console.log("[PuzzleChain] Increment attempts:", puzzleId);
}

async function markSolved(puzzleId: string, userId: string): Promise<void> {
  console.log("[PuzzleChain] Mark solved:", puzzleId, "by", userId);
}

async function tryUnlock(puzzleId: string, userId: string): Promise<boolean> {
  console.log("[PuzzleChain] Try unlock:", puzzleId);
  return true;
}

async function markChainCompleted(chainId: string, userId: string): Promise<void> {
  console.log("[PuzzleChain] Chain completed:", chainId, "by", userId);
}

// Utility
function decimalToDMS(lat: number, lng: number): { lat: string; lng: string } {
  const toDMS = (decimal: number, isLat: boolean) => {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesDecimal = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = ((minutesDecimal - minutes) * 60).toFixed(2);
    const direction = isLat
      ? decimal >= 0 ? "N" : "S"
      : decimal >= 0 ? "E" : "W";
    return `${degrees}°${minutes}'${seconds}"${direction}`;
  };
  
  return {
    lat: toDMS(lat, true),
    lng: toDMS(lng, false),
  };
}
