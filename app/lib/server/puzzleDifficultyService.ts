/**
 * Puzzle Difficulty Service
 *
 * Integrates puzzle creation with the player difficulty tracking system.
 * Maps puzzle types to skill tracks and provides adaptive recommendations.
 */

import prisma from "@/app/lib/prisma";
import {
  DifficultyTrack,
  getPlayerDifficulty,
  updateTrackDifficulty,
  selectTaskDifficulty,
  PlayerDifficulty,
} from "./difficultyService";

// Puzzle type to difficulty track mapping
export type PuzzleType = 'world' | 'cipher' | 'stego' | 'audio' | 'coordinates' | 'meta' | 'chain';

const PUZZLE_TYPE_TO_TRACK: Record<PuzzleType, DifficultyTrack> = {
  cipher: 'logic',        // Code-breaking, pattern recognition
  world: 'logic',         // Game state manipulation, cause-effect
  stego: 'perception',    // Hidden details, visual analysis
  audio: 'perception',    // Sound patterns, hidden frequencies
  coordinates: 'field',   // Real-world exploration
  meta: 'creation',       // Self-referential, creative thinking
  chain: 'logic',         // Sequential reasoning
};

// Multimedia component to track mapping (for puzzles with multiple components)
const MULTIMEDIA_TO_TRACK: Record<string, DifficultyTrack> = {
  cipher: 'logic',
  stego: 'perception',
  audio: 'perception',
  image: 'perception',
};

export type PuzzleProfile = {
  // Track-based stats
  trackStats: Record<DifficultyTrack, {
    attempted: number;
    solved: number;
    avgAttempts: number;
    lastAttemptAt: Date | null;
  }>;

  // Type-based stats
  typeStats: Record<PuzzleType, {
    attempted: number;
    solved: number;
  }>;

  // Overall puzzle engagement
  totalAttempted: number;
  totalSolved: number;
  overallSuccessRate: number;

  // Recommendations
  strongestPuzzleType: PuzzleType | null;
  weakestPuzzleType: PuzzleType | null;
  recommendedNextType: PuzzleType;
  recommendedDifficulty: number;

  // Flags
  hasNeverSolvedCipher: boolean;
  hasNeverSolvedStego: boolean;
  hasNeverSolvedAudio: boolean;
  prefersTechPuzzles: boolean;
  prefersExplorationPuzzles: boolean;
};

/**
 * Get the primary difficulty track for a puzzle type
 */
export function getPuzzleTrack(puzzleType: PuzzleType): DifficultyTrack {
  return PUZZLE_TYPE_TO_TRACK[puzzleType];
}

/**
 * Get all relevant tracks for a puzzle (including multimedia components)
 */
export function getAllPuzzleTracks(
  puzzleType: PuzzleType,
  multimedia?: {
    cipher?: any;
    stego?: any;
    audio?: any;
    image?: any;
  }
): DifficultyTrack[] {
  const tracks = new Set<DifficultyTrack>();
  tracks.add(PUZZLE_TYPE_TO_TRACK[puzzleType]);

  if (multimedia) {
    if (multimedia.cipher) tracks.add('logic');
    if (multimedia.stego) tracks.add('perception');
    if (multimedia.audio) tracks.add('perception');
    if (multimedia.image) tracks.add('perception');
  }

  return Array.from(tracks);
}

/**
 * Get a player's puzzle-solving profile
 */
export async function getPlayerPuzzleProfile(userId: string): Promise<PuzzleProfile> {
  // Get player's difficulty ratings
  const difficulty = await getPlayerDifficulty(userId);

  // Get puzzle attempt history from knowledge graph
  const puzzleNodes = await prisma.knowledgeNode.findMany({
    where: {
      userId,
      type: 'PUZZLE',
    },
    select: {
      label: true,
      data: true,
      discoveredAt: true,
    },
  });

  // Initialize stats
  const trackStats: PuzzleProfile['trackStats'] = {
    logic: { attempted: 0, solved: 0, avgAttempts: 0, lastAttemptAt: null },
    perception: { attempted: 0, solved: 0, avgAttempts: 0, lastAttemptAt: null },
    creation: { attempted: 0, solved: 0, avgAttempts: 0, lastAttemptAt: null },
    field: { attempted: 0, solved: 0, avgAttempts: 0, lastAttemptAt: null },
  };

  const typeStats: PuzzleProfile['typeStats'] = {
    world: { attempted: 0, solved: 0 },
    cipher: { attempted: 0, solved: 0 },
    stego: { attempted: 0, solved: 0 },
    audio: { attempted: 0, solved: 0 },
    coordinates: { attempted: 0, solved: 0 },
    meta: { attempted: 0, solved: 0 },
    chain: { attempted: 0, solved: 0 },
  };

  let totalAttempted = 0;
  let totalSolved = 0;
  const trackAttemptCounts: Record<DifficultyTrack, number[]> = {
    logic: [],
    perception: [],
    creation: [],
    field: [],
  };

  // Process puzzle history
  for (const node of puzzleNodes) {
    const data = node.data as Record<string, any>;
    const puzzleType = (data.puzzleType || 'world') as PuzzleType;
    const track = PUZZLE_TYPE_TO_TRACK[puzzleType] || 'logic';
    const attempts = data.attempts || 0;
    const solved = data.solved || false;

    if (attempts > 0) {
      totalAttempted++;
      typeStats[puzzleType].attempted++;
      trackStats[track].attempted++;
      trackAttemptCounts[track].push(attempts);

      if (!trackStats[track].lastAttemptAt || node.discoveredAt > trackStats[track].lastAttemptAt) {
        trackStats[track].lastAttemptAt = node.discoveredAt;
      }

      if (solved) {
        totalSolved++;
        typeStats[puzzleType].solved++;
        trackStats[track].solved++;
      }
    }
  }

  // Calculate average attempts per track
  for (const track of Object.keys(trackAttemptCounts) as DifficultyTrack[]) {
    const counts = trackAttemptCounts[track];
    if (counts.length > 0) {
      trackStats[track].avgAttempts = counts.reduce((a, b) => a + b, 0) / counts.length;
    }
  }

  // Calculate overall success rate
  const overallSuccessRate = totalAttempted > 0 ? totalSolved / totalAttempted : 0;

  // Find strongest and weakest puzzle types (with at least 2 attempts)
  let strongestType: PuzzleType | null = null;
  let weakestType: PuzzleType | null = null;
  let highestRate = 0;
  let lowestRate = 1;

  for (const [type, stats] of Object.entries(typeStats) as [PuzzleType, { attempted: number; solved: number }][]) {
    if (stats.attempted >= 2) {
      const rate = stats.solved / stats.attempted;
      if (rate > highestRate) {
        highestRate = rate;
        strongestType = type;
      }
      if (rate < lowestRate) {
        lowestRate = rate;
        weakestType = type;
      }
    }
  }

  // Determine recommended next type based on player profile
  let recommendedNextType: PuzzleType;
  const hasAnySolved = totalSolved > 0;

  if (!hasAnySolved) {
    // New player: start with simple world puzzle
    recommendedNextType = 'world';
  } else if (strongestType && overallSuccessRate < 0.4) {
    // Struggling: give them something they're good at
    recommendedNextType = strongestType;
  } else if (typeStats.cipher.attempted === 0) {
    // Haven't tried ciphers yet
    recommendedNextType = 'cipher';
  } else if (typeStats.stego.attempted === 0 && difficulty.perception > 0.4) {
    // Haven't tried stego and have decent perception
    recommendedNextType = 'stego';
  } else {
    // Default: work on weakest area if they're doing well overall
    const weakestTrack = getWeakestPuzzleTrack(difficulty);
    recommendedNextType = getRecommendedTypeForTrack(weakestTrack, typeStats);
  }

  // Calculate recommended difficulty
  const recommendedTrack = PUZZLE_TYPE_TO_TRACK[recommendedNextType];
  const recommendedDifficulty = selectTaskDifficulty(difficulty[recommendedTrack]);

  return {
    trackStats,
    typeStats,
    totalAttempted,
    totalSolved,
    overallSuccessRate,
    strongestPuzzleType: strongestType,
    weakestPuzzleType: weakestType,
    recommendedNextType,
    recommendedDifficulty,
    hasNeverSolvedCipher: typeStats.cipher.solved === 0,
    hasNeverSolvedStego: typeStats.stego.solved === 0,
    hasNeverSolvedAudio: typeStats.audio.solved === 0,
    prefersTechPuzzles: (trackStats.logic.solved + trackStats.perception.solved) >
                        (trackStats.creation.solved + trackStats.field.solved),
    prefersExplorationPuzzles: trackStats.field.solved > trackStats.logic.solved,
  };
}

/**
 * Check if a puzzle is appropriate for a player's skill level
 */
export async function checkPuzzleAppropriate(
  userId: string,
  puzzleType: PuzzleType,
  puzzleDifficulty: number,
  multimedia?: { cipher?: any; stego?: any; audio?: any; image?: any }
): Promise<{
  appropriate: boolean;
  warnings: string[];
  suggestions: string[];
}> {
  const profile = await getPlayerPuzzleProfile(userId);
  const difficulty = await getPlayerDifficulty(userId);
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const track = PUZZLE_TYPE_TO_TRACK[puzzleType];
  const playerSkill = difficulty[track];
  const skillGap = puzzleDifficulty - playerSkill;

  // Check if puzzle is too hard
  if (skillGap > 0.3) {
    warnings.push(`Puzzle difficulty (${(puzzleDifficulty * 100).toFixed(0)}%) is significantly above player's ${track} skill (${(playerSkill * 100).toFixed(0)}%)`);
    suggestions.push(`Consider starting with difficulty ${(playerSkill * 100).toFixed(0)}-${((playerSkill + 0.15) * 100).toFixed(0)}%`);
  }

  // Check if player has never solved this type
  const typeStats = profile.typeStats[puzzleType];
  if (typeStats.attempted === 0) {
    warnings.push(`Player has never attempted a ${puzzleType} puzzle before`);
    suggestions.push(`Start with a simple ${puzzleType} puzzle (difficulty 1-2) to introduce the concept`);
  } else if (typeStats.solved === 0 && typeStats.attempted >= 2) {
    warnings.push(`Player has attempted ${typeStats.attempted} ${puzzleType} puzzles but solved none`);
    suggestions.push(`Consider a different puzzle type or provide more hints`);
  }

  // Check multimedia components
  if (multimedia?.stego && profile.hasNeverSolvedStego) {
    warnings.push("Player has never solved a steganography puzzle");
    suggestions.push("Consider including obvious visual clues or explicit hints about examining the image");
  }

  if (multimedia?.cipher && profile.hasNeverSolvedCipher) {
    warnings.push("Player has never solved a cipher puzzle");
    suggestions.push("Use a simple cipher (rot13, caesar with small shift) or provide the cipher type as a hint");
  }

  // Check overall success rate
  if (profile.overallSuccessRate < 0.3 && puzzleDifficulty > 0.4) {
    warnings.push("Player has low overall puzzle success rate");
    suggestions.push("Consider providing an easier win to build confidence");
  }

  const appropriate = warnings.length === 0;

  return { appropriate, warnings, suggestions };
}

/**
 * Record a puzzle attempt and update player's track rating
 */
export async function recordPuzzleAttempt(
  userId: string,
  puzzleId: string,
  puzzleType: PuzzleType,
  puzzleDifficulty: number,
  solved: boolean,
  attemptsUsed: number
): Promise<{
  newRating: number;
  ratingChange: number;
  track: DifficultyTrack;
}> {
  const track = PUZZLE_TYPE_TO_TRACK[puzzleType];
  const oldDifficulty = await getPlayerDifficulty(userId);
  const oldRating = oldDifficulty[track];

  // Update track rating
  const newRating = await updateTrackDifficulty(userId, track, puzzleDifficulty, solved);

  // Record the attempt in puzzle stats
  await prisma.knowledgeNode.updateMany({
    where: {
      userId,
      type: 'PUZZLE',
      data: {
        path: ['id'],
        equals: puzzleId,
      },
    },
    data: {
      data: {
        attempts: attemptsUsed,
        solved,
        solvedAt: solved ? new Date().toISOString() : undefined,
        trackRatingBefore: oldRating,
        trackRatingAfter: newRating,
      },
    },
  });

  console.log(`[PuzzleDifficulty] ${userId} ${solved ? 'solved' : 'failed'} ${puzzleType} puzzle. ${track} rating: ${(oldRating * 100).toFixed(0)}% → ${(newRating * 100).toFixed(0)}%`);

  return {
    newRating,
    ratingChange: newRating - oldRating,
    track,
  };
}

/**
 * Get puzzle recommendations for a player
 */
export async function getPuzzleRecommendations(userId: string): Promise<{
  recommendedType: PuzzleType;
  recommendedDifficulty: number;
  reasoning: string;
  avoidTypes: PuzzleType[];
  playerStrengths: string[];
  playerWeaknesses: string[];
}> {
  const profile = await getPlayerPuzzleProfile(userId);
  const difficulty = await getPlayerDifficulty(userId);

  const playerStrengths: string[] = [];
  const playerWeaknesses: string[] = [];
  const avoidTypes: PuzzleType[] = [];

  // Analyze strengths
  if (difficulty.logic > 0.6) playerStrengths.push("Strong logical reasoning");
  if (difficulty.perception > 0.6) playerStrengths.push("Good at noticing hidden details");
  if (difficulty.creation > 0.6) playerStrengths.push("Creative problem solver");
  if (difficulty.field > 0.6) playerStrengths.push("Enjoys real-world exploration");

  // Analyze weaknesses
  if (difficulty.logic < 0.4) playerWeaknesses.push("Struggles with code/pattern puzzles");
  if (difficulty.perception < 0.4) playerWeaknesses.push("May miss hidden elements");
  if (difficulty.creation < 0.4) playerWeaknesses.push("Prefers concrete over abstract");
  if (difficulty.field < 0.4) playerWeaknesses.push("Less engaged with IRL content");

  // Determine types to avoid
  for (const [type, stats] of Object.entries(profile.typeStats) as [PuzzleType, { attempted: number; solved: number }][]) {
    if (stats.attempted >= 3 && stats.solved === 0) {
      avoidTypes.push(type);
    }
  }

  // Generate reasoning
  let reasoning: string;
  if (profile.totalAttempted === 0) {
    reasoning = "New player - start with a simple world-based puzzle to teach mechanics";
  } else if (profile.overallSuccessRate < 0.3) {
    reasoning = `Player struggling (${(profile.overallSuccessRate * 100).toFixed(0)}% success). Recommend ${profile.strongestPuzzleType || 'world'} puzzle for confidence boost`;
  } else if (profile.strongestPuzzleType && profile.overallSuccessRate > 0.6) {
    reasoning = `Player doing well. Challenge with ${profile.weakestPuzzleType || 'new type'} to develop skills`;
  } else {
    reasoning = `Balanced approach: ${profile.recommendedNextType} at ${(profile.recommendedDifficulty * 100).toFixed(0)}% difficulty`;
  }

  return {
    recommendedType: profile.recommendedNextType,
    recommendedDifficulty: profile.recommendedDifficulty,
    reasoning,
    avoidTypes,
    playerStrengths,
    playerWeaknesses,
  };
}

/**
 * Generate a difficulty context string for the AI
 */
export async function getPuzzleContextForAI(userId: string): Promise<string> {
  const profile = await getPlayerPuzzleProfile(userId);
  const recommendations = await getPuzzleRecommendations(userId);

  let context = `\n=== PLAYER PUZZLE PROFILE ===\n`;

  // Overall stats
  context += `Puzzles attempted: ${profile.totalAttempted}, solved: ${profile.totalSolved} (${(profile.overallSuccessRate * 100).toFixed(0)}% success rate)\n`;

  // Type breakdown
  const typeSummary: string[] = [];
  for (const [type, stats] of Object.entries(profile.typeStats) as [PuzzleType, { attempted: number; solved: number }][]) {
    if (stats.attempted > 0) {
      typeSummary.push(`${type}: ${stats.solved}/${stats.attempted}`);
    }
  }
  if (typeSummary.length > 0) {
    context += `By type: ${typeSummary.join(', ')}\n`;
  }

  // Strengths and weaknesses
  if (recommendations.playerStrengths.length > 0) {
    context += `Strengths: ${recommendations.playerStrengths.join(', ')}\n`;
  }
  if (recommendations.playerWeaknesses.length > 0) {
    context += `Weaknesses: ${recommendations.playerWeaknesses.join(', ')}\n`;
  }

  // Recommendations
  context += `\nRECOMMENDATION: ${recommendations.reasoning}\n`;
  context += `Suggested: ${recommendations.recommendedType} puzzle at difficulty ${(recommendations.recommendedDifficulty * 5).toFixed(0)}/5\n`;

  if (recommendations.avoidTypes.length > 0) {
    context += `AVOID: ${recommendations.avoidTypes.join(', ')} (player has repeatedly failed these)\n`;
  }

  // Warnings for new puzzle types
  if (profile.hasNeverSolvedCipher) {
    context += `NOTE: Player has never solved a cipher - start with obvious hints if using ciphers\n`;
  }
  if (profile.hasNeverSolvedStego) {
    context += `NOTE: Player has never solved steganography - be explicit about examining images\n`;
  }

  return context;
}

// Helper functions
function getWeakestPuzzleTrack(difficulty: PlayerDifficulty): DifficultyTrack {
  const tracks: [DifficultyTrack, number][] = [
    ['logic', difficulty.logic],
    ['perception', difficulty.perception],
    ['creation', difficulty.creation],
    ['field', difficulty.field],
  ];
  tracks.sort((a, b) => a[1] - b[1]);
  return tracks[0][0];
}

function getRecommendedTypeForTrack(
  track: DifficultyTrack,
  typeStats: PuzzleProfile['typeStats']
): PuzzleType {
  const typesByTrack: Record<DifficultyTrack, PuzzleType[]> = {
    logic: ['cipher', 'world', 'chain'],
    perception: ['stego', 'audio'],
    creation: ['meta'],
    field: ['coordinates'],
  };

  const candidates = typesByTrack[track];

  // Prefer types the player hasn't tried yet
  for (const type of candidates) {
    if (typeStats[type].attempted === 0) {
      return type;
    }
  }

  // Otherwise return the one with best success rate
  let bestType = candidates[0];
  let bestRate = 0;

  for (const type of candidates) {
    const stats = typeStats[type];
    if (stats.attempted > 0) {
      const rate = stats.solved / stats.attempted;
      if (rate > bestRate) {
        bestRate = rate;
        bestType = type;
      }
    }
  }

  return bestType;
}
