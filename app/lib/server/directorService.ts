import prisma from "@/app/lib/prisma";
import { memoryStore } from "./memoryStore";
import { getProfile } from "./profileService";
import { getLatestOpenMissionRun } from "./missionService";
import { summarizeExperiments } from "./experimentService";

export type DirectorPhase = "probe" | "train" | "mission" | "report" | "reflection";

export type DirectorContext = {
  player?: {
    handle?: string;
    trustScore?: number; // 0..1 heuristic
    traits?: Record<string, number>;
    preferences?: Record<string, any>;
    consent?: boolean;
    accessTier?: number;
  };
  director?: {
    phase?: DirectorPhase;
    lastAction?: string;
    successRate?: number; // 0..1 over recent missions
    cooldowns?: Record<string, number>;
  };
  mission?: {
    active?: boolean;
    awaitingReport?: boolean;
    brief?: string;
    rubric?: string[];
  };
  puzzle?: {
    id?: string;
    status?: "active" | "solved";
    solution?: string;
    clues?: string;
    context?: string;
  };
  experiments?: Array<{
    id: string;
    hypothesis: string;
    task: string;
    lastScore?: number;
    lastResult?: string;
    createdAt: string;
  }>;
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

function computeTrustScore(profile: any, successRate: number, experimentAvg: number): number {
  // Weighted blend of mission performance and experiment outcomes
  const miss = isFinite(successRate) ? successRate : 0;
  const exp = isFinite(experimentAvg) ? experimentAvg : 0;
  const blended = (miss * 0.6) + (exp * 0.4);
  const curiosity = Number(profile?.traits?.curiosity ?? 0);
  const resilience = Number(profile?.traits?.resilience ?? 0);
  const bonus = (curiosity + resilience) * 0.05; // small trait nudge
  return Math.max(0, Math.min(1, blended + bonus));
}

function decidePhase(params: {
  hasActiveRun: boolean;
  awaitingReport: boolean;
  successRate: number;
  trustScore: number;
  lastAction?: string;
  justReported?: boolean;
}): DirectorPhase {
  if (params.awaitingReport) return "report";
  if (params.justReported) return "reflection";
  if (params.hasActiveRun) return "mission";
  if (params.trustScore >= 0.7 && params.successRate >= 0.6) return "mission";
  if (params.trustScore >= 0.4) return "train";
  return "probe";
}

export async function buildDirectorContext(input: {
  handle?: string;
  sessionId?: string;
  reportJustSubmitted?: boolean;
  clientAccessTier?: number;
}): Promise<DirectorContext> {
  const { handle, reportJustSubmitted } = input || {};
  const userId = (await getUserIdByHandle(handle)) || "";
  let successRate = 0;
  let hasActiveRun = false;
  let awaitingReport = false;
  let missionBrief: string | undefined;
  let experiments: DirectorContext["experiments"] = [];
  let experimentAvg = 0;

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
  }

  const profile = userId ? await getProfile(userId) : undefined;
  const trustScore = computeTrustScore(profile, successRate, experimentAvg);
  const phase = decidePhase({
    hasActiveRun,
    awaitingReport,
    successRate,
    trustScore,
    justReported: !!reportJustSubmitted,
  });

  const clientAccessTier =
    typeof input?.clientAccessTier === "number" ? input.clientAccessTier : 0;

  return {
    player: {
      handle,
      trustScore,
      traits: profile?.traits as any,
      preferences: { verbosity: "rich", ...(profile?.preferences as any) },
      consent: Boolean(profile?.preferences?.consent ?? true),
      accessTier: clientAccessTier,
    },
    director: {
      phase,
      successRate,
      lastAction: reportJustSubmitted ? "report_processed" : undefined,
      cooldowns: {},
    },
    mission: {
      active: hasActiveRun,
      awaitingReport,
      brief: missionBrief,
      rubric: [],
    },
    puzzle,
    experiments,
  };
}
