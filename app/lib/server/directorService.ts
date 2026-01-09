import prisma from "@/app/lib/prisma";
import { memoryStore } from "./memoryStore";
import { getProfile } from "./profileService";
import { getLatestOpenMissionRun } from "./missionService";
import { summarizeExperiments } from "./experimentService";
import { getRecentMemoryEvents } from "./memoryService";
import {
  getTrustState,
  evolveTrust,
  recordActivity,
  getLayerTools,
  getLayerName,
  type TrustLayer,
  LAYER_THRESHOLDS,
} from "./trustService";
import {
  getExperimentDirective,
  type ExperimentDirective,
} from "./experimentScheduler";
import {
  getDirectorDifficultyContext,
  type DirectorDifficultyContext,
  type DifficultyTrack,
} from "./difficultyService";
import { getPuzzleRecommendations } from "./puzzleDifficultyService";
import { checkIdentityStatus, getAgentIdentity } from "./identityService";

export type DirectorPhase = "intro" | "probe" | "train" | "mission" | "report" | "reflection" | "reveal" | "network";

export type DirectorContext = {
  player?: {
    handle?: string;
    trustScore?: number;
    layer?: TrustLayer;
    layerName?: string;
    pendingCeremony?: TrustLayer | null;
    traits?: Record<string, number>;
    preferences?: Record<string, any>;
    consent?: boolean;
    accessTier?: number;
    availableTools?: string[];
    difficulty?: {
      logic: number;
      perception: number;
      creation: number;
      field: number;
      overall: number;
    };
    agentId?: string;
    isReferred?: boolean;
    identityLocked?: boolean;
    turnsPlayed?: number;
    minutesPlayed?: number;
    signalUnstable?: boolean;
  };
  director?: {
    phase?: DirectorPhase;
    lastAction?: string;
    successRate?: number;
    cooldowns?: Record<string, number>;
    isInCooldown?: boolean;
    cooldownReason?: string | null;
    isStuck?: boolean;
    stuckReason?: string | null;
    recommendedAction?: "micro_win" | "easier_track" | "encouragement" | "break" | null;
    recommendedTrack?: DifficultyTrack;
    recommendedTaskDifficulty?: number;
  };
  mission?: {
    active?: boolean;
    awaitingReport?: boolean;
    brief?: string;
    rubric?: string[];
    pendingAssignment?: {
      title: string;
      briefing: string;
      type: string;
      narrativeDelivery: boolean;
    };
  };
  puzzle?: {
    id?: string;
    status?: "active" | "solved";
    solution?: string;
    clues?: string;
    context?: string;
  };
  puzzleProfile?: {
    recommendations: {
      recommendedType: string;
      recommendedDifficulty: number;
      reasoning: string;
      avoidTypes: string[];
      playerStrengths: string[];
      playerWeaknesses: string[];
    };
    context: string;  // AI-readable summary of player puzzle skills
  };
  experiment?: {
    directive?: ExperimentDirective;
    recentIds?: string[];
  };
  experiments?: Array<{
    id: string;
    hypothesis: string;
    task: string;
    lastScore?: number;
    lastResult?: string;
    createdAt: string;
  }>;
  memory?: Array<{ type: string; content: string; tags?: string[] }>;
};

async function getUserIdByHandle(handle?: string): Promise<string | null> {
  if (!handle) return null;
  try {
    const user = await prisma.user.findUnique({ where: { handle } });
    return user?.id || null;
  } catch {
    const mem = memoryStore.users.get(handle);
    return mem?.id || null;
  }
}

async function getRecentMissionSuccessRate(userId: string): Promise<number> {
  try {
    const runs = await prisma.missionRun.findMany({
      where: { userId, status: { in: ["COMPLETED", "FAILED"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    if (!runs || runs.length === 0) return 0;
    const scores = runs.map((r: any) => (typeof r.score === "number" ? r.score : 0));
    const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
    return Math.max(0, Math.min(1, avg));
  } catch {
    const list = memoryStore.missionRunsByUser.get(userId) || [];
    const recent = [...list]
      .filter((r) => ["COMPLETED", "FAILED"].includes(r.status))
      .slice(-5);
    if (recent.length === 0) return 0;
    const scores = recent.map((r) => (typeof r.score === "number" ? r.score : 0));
    const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
    return Math.max(0, Math.min(1, avg));
  }
}

async function ensureTrustEvolution(
  userId: string,
  successRate: number,
  experimentAvg: number
): Promise<{ trustScore: number; layer: TrustLayer; pendingCeremony: TrustLayer | null }> {
  const state = await getTrustState(userId);
  
  await recordActivity(userId);
  
  const performanceDelta = ((successRate * 0.6) + (experimentAvg * 0.4)) * 0.01;
  
  if (performanceDelta > 0.001) {
    const result = await evolveTrust(userId, performanceDelta, "session_performance");
    return {
      trustScore: result.newScore,
      layer: result.newLayer,
      pendingCeremony: result.pendingCeremony,
    };
  }
  
  return {
    trustScore: state.decayedScore,
    layer: state.layer,
    pendingCeremony: state.pendingCeremony,
  };
}

function decidePhase(params: {
  hasActiveRun: boolean;
  awaitingReport: boolean;
  successRate: number;
  trustScore: number;
  lastAction?: string;
  justReported?: boolean;
  sessionCount?: number;
  hasProfile?: boolean;
  hasConsent?: boolean;
  isStuck?: boolean;
  isInCooldown?: boolean;
}): DirectorPhase {
  // First session with minimal engagement = intro
  if ((params.sessionCount ?? 1) <= 1 && params.trustScore < 0.1) {
    return "intro";
  }
  
  // Active report waiting takes priority
  if (params.awaitingReport) return "report";
  
  // Just submitted a report = reflection time
  if (params.justReported) return "reflection";
  
  // Has an active mission = stay in mission phase
  if (params.hasActiveRun) return "mission";
  
  // Stuck players get sent back to probe for recovery
  if (params.isStuck) return "probe";
  
  // In cooldown = train (no new missions)
  if (params.isInCooldown && params.trustScore >= 0.3) return "train";
  
  // High trust thresholds trigger special phases
  if (params.trustScore >= 0.95) return "network";  // Full integration
  if (params.trustScore >= 0.8) return "reveal";    // Major revelations
  
  // Ready for missions: has profile, decent trust, good success rate
  if (params.trustScore >= 0.5 && params.successRate >= 0.5) return "mission";
  
  // Building capability
  if (params.trustScore >= 0.3) return "train";
  
  // Still profiling
  return "probe";
}

export async function buildDirectorContext(input: {
  handle?: string;
  userId?: string;
  sessionId?: string;
  reportJustSubmitted?: boolean;
  clientAccessTier?: number;
}): Promise<DirectorContext> {
  const { handle, reportJustSubmitted } = input || {};
  const userId = input?.userId || (await getUserIdByHandle(handle)) || "";
  let successRate = 0;
  let hasActiveRun = false;
  let awaitingReport = false;
  let missionBrief: string | undefined;
  let experiments: DirectorContext["experiments"] = [];
  let experimentAvg = 0;
  let memory: DirectorContext["memory"] = [];

  let puzzle: DirectorContext["puzzle"];

  if (userId) {
    successRate = await getRecentMissionSuccessRate(userId);
    const open = await getLatestOpenMissionRun(userId);
    if (open) {
      hasActiveRun = ["ACCEPTED", "SUBMITTED", "REVIEWING"].includes(open.status);
      awaitingReport = open.status === "ACCEPTED";
      missionBrief = open.mission?.prompt;
    }

    // Fetch active puzzle state
    try {
       const activePuzzleNote = await prisma.agentNote.findFirst({
         where: {
           userId,
           key: "puzzle:active",
         },
         orderBy: { createdAt: "desc" },
       });
       if (activePuzzleNote) {
         try {
           const data = JSON.parse(activePuzzleNote.value);
           puzzle = {
             id: data.id,
             status: data.status,
             solution: data.solution,
             clues: data.clues,
             context: data.context,
           };
         } catch {}
       }
    } catch {}

    // Attach recent experiments for adaptive context
    try {
      experiments = await summarizeExperiments({ userId, limit: 5 });
      const scores = experiments
        .map((e) => (typeof e.lastScore === "number" ? e.lastScore : NaN))
        .filter((n) => !Number.isNaN(n));
      if (scores.length > 0) {
        experimentAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
      }
    } catch {}

    // Attach recent memory events for personalization
    try {
      memory = await getRecentMemoryEvents({ userId, limit: 5 });
    } catch {}
  }

  const profile = userId ? await getProfile(userId) : undefined;
  
  // Fetch identity status for signal stability awareness
  let identityStatus: { agentId?: string; isReferred?: boolean; identityLocked?: boolean; turnsPlayed?: number; minutesPlayed?: number; signalUnstable?: boolean } = {};
  if (userId) {
    try {
      const [identity, status] = await Promise.all([
        getAgentIdentity(userId),
        checkIdentityStatus(userId),
      ]);
      identityStatus = {
        agentId: identity?.agentId,
        isReferred: status.isReferred,
        identityLocked: !status.canLockIdentity && status.isReferred,
        turnsPlayed: status.turnsPlayed,
        minutesPlayed: status.minutesPlayed,
        signalUnstable: status.promptIdentityLock && !status.isReferred,
      };
    } catch {}
  }
  
  const trustState = userId
    ? await ensureTrustEvolution(userId, successRate, experimentAvg)
    : { trustScore: 0, layer: 0 as TrustLayer, pendingCeremony: null };
  
  const { trustScore, layer, pendingCeremony } = trustState;
  const availableTools = await getLayerTools(layer);
  
  let difficultyCtx: DirectorDifficultyContext | null = null;
  if (userId) {
    try {
      difficultyCtx = await getDirectorDifficultyContext(userId);
    } catch {}
  }

  // Fetch puzzle profile for adaptive puzzle design
  let puzzleProfile: DirectorContext["puzzleProfile"] | undefined;
  if (userId) {
    try {
      const recommendations = await getPuzzleRecommendations(userId);
      // Build a concise AI-readable context string
      const contextParts: string[] = [];

      if (recommendations.playerStrengths.length > 0) {
        contextParts.push(`Strengths: ${recommendations.playerStrengths.join(', ')}`);
      }
      if (recommendations.playerWeaknesses.length > 0) {
        contextParts.push(`Needs practice: ${recommendations.playerWeaknesses.join(', ')}`);
      }
      if (recommendations.avoidTypes.length > 0) {
        contextParts.push(`Avoid for now: ${recommendations.avoidTypes.join(', ')}`);
      }
      contextParts.push(`Recommended difficulty: ${recommendations.recommendedDifficulty}/5`);
      contextParts.push(`Best puzzle type: ${recommendations.recommendedType}`);

      puzzleProfile = {
        recommendations,
        context: contextParts.join('. '),
      };
    } catch {}
  }

  const phase = decidePhase({
    hasActiveRun,
    awaitingReport,
    successRate,
    trustScore,
    justReported: !!reportJustSubmitted,
    isStuck: difficultyCtx?.stuck.isStuck,
    isInCooldown: difficultyCtx?.cooldown.isInCooldown,
  });

  const clientAccessTier =
    typeof input?.clientAccessTier === "number" ? input.clientAccessTier : 0;

  // Try to get an experiment directive from templates
  // If null, the AI should create its own experiments using experiment_create tool
  let experimentDirective: ExperimentDirective | null = null;
  if (userId) {
    try {
      // Pass recent messages for keyword-based experiment selection
      const recentMessages = memory?.map(m => m.content) || [];
      experimentDirective = await getExperimentDirective(userId, recentMessages);
    } catch {}
  }

  let pendingMissionAssignment: { title: string; briefing: string; type: string; narrativeDelivery: boolean } | undefined;
  if (userId && phase === "mission" && !hasActiveRun) {
    try {
      const profile = await prisma.playerProfile.findUnique({
        where: { userId },
        select: { assignedMissions: true },
      });
      const assigned = profile?.assignedMissions as any;
      if (assigned && Array.isArray(assigned) && assigned.length > 0) {
        const next = assigned[0];
        pendingMissionAssignment = {
          title: next.title || "Classified Operation",
          briefing: next.briefing || next.prompt || "Awaiting details...",
          type: next.type || "decode",
          narrativeDelivery: true,
        };
      }
    } catch {}
  }

  return {
    player: {
      handle,
      trustScore,
      layer,
      layerName: getLayerName(layer),
      pendingCeremony,
      traits: profile?.traits as any,
      preferences: { verbosity: "rich", ...(profile?.preferences as any) },
      consent: Boolean(profile?.preferences?.consent ?? true),
      accessTier: clientAccessTier,
      availableTools,
      difficulty: difficultyCtx?.difficulty,
      ...identityStatus,
    },
    director: {
      phase,
      successRate,
      lastAction: reportJustSubmitted ? "report_processed" : undefined,
      cooldowns: {},
      isInCooldown: difficultyCtx?.cooldown.isInCooldown,
      cooldownReason: difficultyCtx?.cooldown.cooldownReason,
      isStuck: difficultyCtx?.stuck.isStuck,
      stuckReason: difficultyCtx?.stuck.stuckReason,
      recommendedAction: difficultyCtx?.stuck.recommendedAction,
      recommendedTrack: difficultyCtx?.recommendedTrack,
      recommendedTaskDifficulty: difficultyCtx?.recommendedTaskDifficulty,
    },
    mission: {
      active: hasActiveRun,
      awaitingReport,
      brief: missionBrief,
      rubric: [],
      pendingAssignment: pendingMissionAssignment,
    },
    puzzle,
    puzzleProfile,
    experiment: {
      directive: experimentDirective ?? undefined,
      recentIds: experiments.map(e => e.id),
    },
    experiments,
    memory,
  };
}
