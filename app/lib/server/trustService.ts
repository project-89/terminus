import prisma from "@/app/lib/prisma";

// Layer thresholds - designed for slow, meaningful progression
// Layer 0→1: ~1 hour of engaged play (first session)
// Layer 1→2: ~2-3 hours + activation by another agent
// Layer 2→3: ~1 week of regular engagement + completed puzzles
// Layer 3→4: ~2-3 weeks + successful field missions
// Layer 4→5: ~1-2 months + network contributions
export const LAYER_THRESHOLDS = [0.0, 0.10, 0.25, 0.50, 0.75, 0.92] as const;
export const LAYER_NAMES = [
  "The Mask",      // 0: Pure text adventure - ~1 hour
  "The Bleed",     // 1: Fourth-wall cracks - ~2-3 hours
  "The Crack",     // 2: LOGOS begins revealing - ~1 week
  "The Whisper",   // 3: Open communication, missions - ~2-3 weeks
  "The Call",      // 4: Active recruitment, field ops - ~1-2 months
  "The Reveal",    // 5: Full transparency, operative status - sustained engagement
] as const;

// Minimum time requirements per layer (in days)
// Players can't rush through even with high activity
export const LAYER_TIME_GATES: Record<number, number> = {
  0: 0,      // Immediate
  1: 0,      // Same session possible
  2: 1,      // At least 1 day since starting
  3: 7,     // At least 1 week
  4: 21,    // At least 3 weeks
  5: 60,    // At least 2 months
};

export type TrustLayer = 0 | 1 | 2 | 3 | 4 | 5;

interface TrustHistoryEntry {
  timestamp: string;
  score: number;
  delta: number;
  reason: string;
}

interface TrustUpdateResult {
  previousScore: number;
  newScore: number;
  previousLayer: TrustLayer;
  newLayer: TrustLayer;
  layerChanged: boolean;
  pendingCeremony: TrustLayer | null;
}

function scoreToLayer(score: number, daysSinceStart?: number): TrustLayer {
  for (let i = LAYER_THRESHOLDS.length - 1; i >= 0; i--) {
    if (score >= LAYER_THRESHOLDS[i]) {
      // Check time gate if we have the data
      if (daysSinceStart !== undefined) {
        const requiredDays = LAYER_TIME_GATES[i] ?? 0;
        if (daysSinceStart < requiredDays) {
          // Not enough time has passed - cap at previous layer
          continue;
        }
      }
      return i as TrustLayer;
    }
  }
  return 0;
}

function applyDecay(score: number, lastActiveAt: Date | null): number {
  if (!lastActiveAt) return score;
  const daysSince = (Date.now() - lastActiveAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince < 3) return score; // Grace period of 3 days
  // Slower decay: ~10% per week of inactivity after grace period
  const decayFactor = Math.exp(-(daysSince - 3) * 0.015);
  return score * decayFactor;
}

export async function getTrustState(userId: string): Promise<{
  trustScore: number;
  layer: TrustLayer;
  decayedScore: number;
  pendingCeremony: TrustLayer | null;
  lastActiveAt: Date | null;
}> {
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
    select: {
      trustScore: true,
      layer: true,
      lastActiveAt: true,
      pendingCeremony: true,
      user: { select: { createdAt: true } },
    },
  });

  if (!profile) {
    return {
      trustScore: 0,
      layer: 0,
      decayedScore: 0,
      pendingCeremony: null,
      lastActiveAt: null,
    };
  }

  const decayedScore = applyDecay(profile.trustScore, profile.lastActiveAt);
  
  // Recalculate effective layer based on time gates
  const createdAt = profile.user?.createdAt ?? new Date();
  const daysSinceStart = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const effectiveLayer = scoreToLayer(decayedScore, daysSinceStart);

  return {
    trustScore: profile.trustScore,
    layer: effectiveLayer,
    decayedScore,
    pendingCeremony: profile.pendingCeremony as TrustLayer | null,
    lastActiveAt: profile.lastActiveAt,
  };
}

export async function evolveTrust(
  userId: string,
  delta: number,
  reason: string
): Promise<TrustUpdateResult> {
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
    include: { user: { select: { createdAt: true } } },
  });

  const previousScore = profile?.trustScore ?? 0;
  const previousLayer = (profile?.layer ?? 0) as TrustLayer;
  const existingHistory = (profile?.trustHistory as TrustHistoryEntry[] | null) ?? [];
  const ceremoniesCompleted = profile?.layerCeremoniesCompleted ?? [];

  const decayedScore = applyDecay(previousScore, profile?.lastActiveAt ?? null);
  const rawNewScore = decayedScore + delta;
  const newScore = Math.max(0, Math.min(1, rawNewScore));
  
  // Calculate days since first session for time-gating
  const createdAt = profile?.user?.createdAt ?? new Date();
  const daysSinceStart = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const newLayer = scoreToLayer(newScore, daysSinceStart);

  const layerChanged = newLayer > previousLayer;
  let pendingCeremony: TrustLayer | null = null;

  if (layerChanged && !ceremoniesCompleted.includes(newLayer)) {
    pendingCeremony = newLayer;
  }

  const historyEntry: TrustHistoryEntry = {
    timestamp: new Date().toISOString(),
    score: newScore,
    delta,
    reason,
  };

  const updatedHistory = [...existingHistory.slice(-99), historyEntry];

  await prisma.playerProfile.upsert({
    where: { userId },
    update: {
      trustScore: newScore,
      layer: newLayer,
      lastTrustUpdate: new Date(),
      lastActiveAt: new Date(),
      trustHistory: updatedHistory,
      ...(layerChanged && { layerUnlockedAt: new Date() }),
      ...(pendingCeremony !== null && { pendingCeremony }),
    },
    create: {
      userId,
      trustScore: newScore,
      layer: newLayer,
      lastTrustUpdate: new Date(),
      lastActiveAt: new Date(),
      trustHistory: updatedHistory,
      ...(layerChanged && { layerUnlockedAt: new Date() }),
      ...(pendingCeremony !== null && { pendingCeremony }),
    },
  });

  return {
    previousScore,
    newScore,
    previousLayer,
    newLayer,
    layerChanged,
    pendingCeremony,
  };
}

export async function markCeremonyComplete(userId: string, layer: TrustLayer): Promise<void> {
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
    select: { layerCeremoniesCompleted: true, pendingCeremony: true },
  });

  const completed = profile?.layerCeremoniesCompleted ?? [];
  if (!completed.includes(layer)) {
    completed.push(layer);
  }

  await prisma.playerProfile.update({
    where: { userId },
    data: {
      layerCeremoniesCompleted: completed,
      pendingCeremony: profile?.pendingCeremony === layer ? null : profile?.pendingCeremony,
    },
  });
}

export async function recordActivity(userId: string): Promise<void> {
  await prisma.playerProfile.upsert({
    where: { userId },
    update: { lastActiveAt: new Date() },
    create: { userId, lastActiveAt: new Date() },
  });
}

export async function computeTrustDelta(
  userId: string,
  event: "mission_complete" | "mission_fail" | "experiment_pass" | "experiment_fail" | "session_complete" | "report_submit" | "dream_submit" | "sync_report",
  score?: number
): Promise<number> {
  // Trust deltas calibrated for slow progression:
  // - Layer 0→1 (10%): ~20 turns of engaged exploration
  // - Layer 1→2 (25%): ~3-4 sessions + puzzle completions
  // - Layer 2→3 (50%): ~10-15 sessions + missions
  // - Layer 3→4 (75%): Many successful field missions
  // - Layer 4→5 (92%): Sustained network contribution
  const baseDeltas: Record<string, number> = {
    // Core progression events
    session_complete: 0.008,        // Regular play (~12 sessions for Layer 1)
    puzzle_complete: 0.015,         // Meaningful puzzle solving
    experiment_pass: 0.012,         // LOGOS experiments
    experiment_fail: -0.002,        // Slight penalty for failed experiments
    
    // Mission events (Layer 3+)
    mission_complete: 0.025,        // Significant progression
    mission_fail: -0.005,           // Small penalty
    report_submit: 0.01,            // Engagement reward
    
    // Exploration & engagement
    dream_submit: 0.008,            // Dream work
    sync_report: 0.012,             // Synchronicity awareness
    deep_exploration: 0.005,        // Finding hidden content
    creative_action: 0.003,         // Novel interactions
    
    // Network actions (Layer 4+)
    agent_recruited: 0.02,          // Successfully recruited someone
    network_contribution: 0.015,    // Helping the network
  };

  let delta = baseDeltas[event] ?? 0;

  if (score !== undefined && event.includes("complete")) {
    delta *= (0.5 + score * 0.5);
  }

  return delta;
}

export async function getLayerTools(layer: TrustLayer): Promise<string[]> {
  const toolsByLayer: Record<TrustLayer, string[]> = {
    0: [
      "glitch_screen",
      "generate_sound", 
      "experiment_create",
      "experiment_note",
      "award_points",
    ],
    1: [
      "glitch_screen",
      "matrix_rain",
      "generate_sound",
      "experiment_create",
      "experiment_note",
      "award_points",
      "profile_set",
    ],
    2: [
      "glitch_screen",
      "matrix_rain",
      "generate_sound",
      "generate_image",
      "experiment_create",
      "experiment_note",
      "award_points",
      "profile_set",
      "write_memory",
      "dream_record",
    ],
    3: [
      "glitch_screen",
      "matrix_rain",
      "generate_sound",
      "generate_image",
      "experiment_create",
      "experiment_note",
      "award_points",
      "profile_set",
      "write_memory",
      "dream_record",
      "mission_request",
      "mission_expect_report",
    ],
    4: [
      "glitch_screen",
      "matrix_rain",
      "generate_sound",
      "generate_image",
      "experiment_create",
      "experiment_note",
      "award_points",
      "profile_set",
      "write_memory",
      "dream_record",
      "mission_request",
      "mission_expect_report",
      "field_mission_assign",
      "synchronicity_log",
    ],
    5: [
      "glitch_screen",
      "matrix_rain",
      "generate_sound",
      "generate_image",
      "experiment_create",
      "experiment_note",
      "award_points",
      "profile_set",
      "write_memory",
      "dream_record",
      "mission_request",
      "mission_expect_report",
      "field_mission_assign",
      "synchronicity_log",
      "verify_protocol_89",
      "network_broadcast",
      "agent_coordination",
    ],
  };

  return toolsByLayer[layer];
}

export function getLayerName(layer: TrustLayer): string {
  return LAYER_NAMES[layer];
}

export function getNextLayerThreshold(currentScore: number): number | null {
  const currentLayer = scoreToLayer(currentScore);
  if (currentLayer >= 5) return null;
  return LAYER_THRESHOLDS[currentLayer + 1];
}

export function getProgressToNextLayer(currentScore: number): number {
  const currentLayer = scoreToLayer(currentScore);
  if (currentLayer >= 5) return 1;
  
  const currentThreshold = LAYER_THRESHOLDS[currentLayer];
  const nextThreshold = LAYER_THRESHOLDS[currentLayer + 1];
  const range = nextThreshold - currentThreshold;
  const progress = (currentScore - currentThreshold) / range;
  
  return Math.max(0, Math.min(1, progress));
}
