import prisma from "@/app/lib/prisma";

export type DifficultyTrack = "logic" | "perception" | "creation" | "field";

export type PlayerDifficulty = {
  logic: number;
  perception: number;
  creation: number;
  field: number;
  overall: number;
};

export type CooldownState = {
  lastMissionAt: Date | null;
  lastExperimentAt: Date | null;
  lastFailureAt: Date | null;
  consecutiveFailures: number;
  isInCooldown: boolean;
  cooldownReason: string | null;
  cooldownEndsAt: Date | null;
};

export type StuckState = {
  isStuck: boolean;
  stuckReason: string | null;
  recommendedAction: "micro_win" | "easier_track" | "encouragement" | "break" | null;
  sessionsWithoutProgress: number;
  recentSuccessRate: number;
};

const TARGET_SUCCESS_RATE = 0.65;
const K_FACTOR = 32;
const COOLDOWN_AFTER_FAILURE_MINUTES = 30;
const COOLDOWN_AFTER_MULTI_FAILURE_MINUTES = 120;
const STUCK_THRESHOLD_SESSIONS = 3;
const STUCK_SUCCESS_RATE_THRESHOLD = 0.3;

function eloExpected(playerRating: number, taskDifficulty: number): number {
  return 1 / (1 + Math.pow(10, (taskDifficulty - playerRating) / 400));
}

function eloUpdate(currentRating: number, expected: number, actual: number): number {
  return currentRating + K_FACTOR * (actual - expected);
}

export async function getPlayerDifficulty(userId: string): Promise<PlayerDifficulty> {
  try {
    const profile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: {
        trackLogic: true,
        trackPerception: true,
        trackCreation: true,
        trackField: true,
      },
    });

    if (!profile) {
      return { logic: 0.5, perception: 0.5, creation: 0.5, field: 0.5, overall: 0.5 };
    }

    const tracks = {
      logic: profile.trackLogic ?? 0.5,
      perception: profile.trackPerception ?? 0.5,
      creation: profile.trackCreation ?? 0.5,
      field: profile.trackField ?? 0.5,
    };

    const overall = (tracks.logic + tracks.perception + tracks.creation + tracks.field) / 4;

    return { ...tracks, overall };
  } catch {
    return { logic: 0.5, perception: 0.5, creation: 0.5, field: 0.5, overall: 0.5 };
  }
}

export async function updateTrackDifficulty(
  userId: string,
  track: DifficultyTrack,
  taskDifficulty: number,
  succeeded: boolean
): Promise<number> {
  const current = await getPlayerDifficulty(userId);
  const playerRating = current[track] * 1000;
  const taskRating = taskDifficulty * 1000;

  const expected = eloExpected(playerRating, taskRating);
  const actual = succeeded ? 1 : 0;
  const newRating = eloUpdate(playerRating, expected, actual);

  const newDifficulty = Math.max(0, Math.min(1, newRating / 1000));

  const fieldMap: Record<DifficultyTrack, string> = {
    logic: "trackLogic",
    perception: "trackPerception",
    creation: "trackCreation",
    field: "trackField",
  };

  try {
    await prisma.playerProfile.upsert({
      where: { userId },
      update: { [fieldMap[track]]: newDifficulty },
      create: { userId, [fieldMap[track]]: newDifficulty },
    });
  } catch {}

  return newDifficulty;
}

export function selectTaskDifficulty(playerSkill: number): number {
  const targetSuccessProb = TARGET_SUCCESS_RATE;
  const taskDifficulty = playerSkill - (400 * Math.log10(1 / targetSuccessProb - 1)) / 1000;
  const jitter = (Math.random() - 0.5) * 0.1;
  return Math.max(0.1, Math.min(0.9, taskDifficulty + jitter));
}

export function getWeakestTrack(difficulty: PlayerDifficulty): DifficultyTrack {
  const tracks: [DifficultyTrack, number][] = [
    ["logic", difficulty.logic],
    ["perception", difficulty.perception],
    ["creation", difficulty.creation],
    ["field", difficulty.field],
  ];

  tracks.sort((a, b) => a[1] - b[1]);
  return tracks[0][0];
}

export function getStrongestTrack(difficulty: PlayerDifficulty): DifficultyTrack {
  const tracks: [DifficultyTrack, number][] = [
    ["logic", difficulty.logic],
    ["perception", difficulty.perception],
    ["creation", difficulty.creation],
    ["field", difficulty.field],
  ];

  tracks.sort((a, b) => b[1] - a[1]);
  return tracks[0][0];
}

export async function getCooldownState(userId: string): Promise<CooldownState> {
  try {
    const [lastMission, lastExperiment, recentFailures] = await Promise.all([
      prisma.missionRun.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true, status: true },
      }),
      prisma.experiment.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      prisma.missionRun.findMany({
        where: { userId, status: "FAILED" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { createdAt: true },
      }),
    ]);

    const lastFailure = recentFailures[0]?.createdAt || null;
    let consecutiveFailures = 0;

    const allRecent = await prisma.missionRun.findMany({
      where: { userId, status: { in: ["COMPLETED", "FAILED"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { status: true },
    });

    for (const run of allRecent) {
      if (run.status === "FAILED") {
        consecutiveFailures++;
      } else {
        break;
      }
    }

    let isInCooldown = false;
    let cooldownReason: string | null = null;
    let cooldownEndsAt: Date | null = null;

    if (lastFailure) {
      const cooldownMinutes = consecutiveFailures >= 2
        ? COOLDOWN_AFTER_MULTI_FAILURE_MINUTES
        : COOLDOWN_AFTER_FAILURE_MINUTES;

      const cooldownEnd = new Date(lastFailure.getTime() + cooldownMinutes * 60 * 1000);

      if (cooldownEnd > new Date()) {
        isInCooldown = true;
        cooldownEndsAt = cooldownEnd;
        cooldownReason = consecutiveFailures >= 2
          ? "Multiple recent failures - extended recovery period"
          : "Recent failure - brief recovery period";
      }
    }

    return {
      lastMissionAt: lastMission?.createdAt || null,
      lastExperimentAt: lastExperiment?.createdAt || null,
      lastFailureAt: lastFailure,
      consecutiveFailures,
      isInCooldown,
      cooldownReason,
      cooldownEndsAt,
    };
  } catch {
    return {
      lastMissionAt: null,
      lastExperimentAt: null,
      lastFailureAt: null,
      consecutiveFailures: 0,
      isInCooldown: false,
      cooldownReason: null,
      cooldownEndsAt: null,
    };
  }
}

export async function getStuckState(userId: string): Promise<StuckState> {
  try {
    const recentSessions = await prisma.gameSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, createdAt: true },
    });

    const recentMissions = await prisma.missionRun.findMany({
      where: { userId, status: { in: ["COMPLETED", "FAILED"] } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { status: true, score: true, createdAt: true },
    });

    if (recentMissions.length === 0) {
      return {
        isStuck: false,
        stuckReason: null,
        recommendedAction: null,
        sessionsWithoutProgress: 0,
        recentSuccessRate: 0,
      };
    }

    const successCount = recentMissions.filter(
      (m: { status: string; score: number | null }) => m.status === "COMPLETED" && (m.score ?? 0) >= 0.5
    ).length;
    const recentSuccessRate = successCount / recentMissions.length;

    let sessionsWithoutProgress = 0;
    const lastSuccess = recentMissions.find(
      (m: { status: string; score: number | null; createdAt: Date }) => m.status === "COMPLETED" && (m.score ?? 0) >= 0.5
    );

    if (lastSuccess) {
      for (const session of recentSessions) {
        if (session.createdAt > lastSuccess.createdAt) {
          sessionsWithoutProgress++;
        } else {
          break;
        }
      }
    } else {
      sessionsWithoutProgress = recentSessions.length;
    }

    const isStuck =
      recentSuccessRate < STUCK_SUCCESS_RATE_THRESHOLD ||
      sessionsWithoutProgress >= STUCK_THRESHOLD_SESSIONS;

    let recommendedAction: StuckState["recommendedAction"] = null;
    let stuckReason: string | null = null;

    if (isStuck) {
      if (sessionsWithoutProgress >= 5) {
        recommendedAction = "break";
        stuckReason = "Extended period without progress - suggest taking a break";
      } else if (recentSuccessRate < 0.2) {
        recommendedAction = "easier_track";
        stuckReason = "Very low success rate - switch to player's strongest track";
      } else if (sessionsWithoutProgress >= 3) {
        recommendedAction = "micro_win";
        stuckReason = "Multiple sessions without progress - provide easy win";
      } else {
        recommendedAction = "encouragement";
        stuckReason = "Struggling but engaged - provide encouragement";
      }
    }

    return {
      isStuck,
      stuckReason,
      recommendedAction,
      sessionsWithoutProgress,
      recentSuccessRate,
    };
  } catch {
    return {
      isStuck: false,
      stuckReason: null,
      recommendedAction: null,
      sessionsWithoutProgress: 0,
      recentSuccessRate: 0,
    };
  }
}

export type DirectorDifficultyContext = {
  difficulty: PlayerDifficulty;
  cooldown: CooldownState;
  stuck: StuckState;
  recommendedTrack: DifficultyTrack;
  recommendedTaskDifficulty: number;
  shouldOfferMission: boolean;
  shouldOfferExperiment: boolean;
};

export async function getDirectorDifficultyContext(
  userId: string
): Promise<DirectorDifficultyContext> {
  const [difficulty, cooldown, stuck] = await Promise.all([
    getPlayerDifficulty(userId),
    getCooldownState(userId),
    getStuckState(userId),
  ]);

  let recommendedTrack: DifficultyTrack;
  let recommendedTaskDifficulty: number;

  if (stuck.isStuck && stuck.recommendedAction === "easier_track") {
    recommendedTrack = getStrongestTrack(difficulty);
    recommendedTaskDifficulty = Math.max(0.2, difficulty[recommendedTrack] - 0.2);
  } else if (stuck.isStuck && stuck.recommendedAction === "micro_win") {
    recommendedTrack = getStrongestTrack(difficulty);
    recommendedTaskDifficulty = 0.2;
  } else {
    recommendedTrack = getWeakestTrack(difficulty);
    recommendedTaskDifficulty = selectTaskDifficulty(difficulty[recommendedTrack]);
  }

  const shouldOfferMission = !cooldown.isInCooldown && !stuck.isStuck;
  const shouldOfferExperiment = !cooldown.isInCooldown;

  return {
    difficulty,
    cooldown,
    stuck,
    recommendedTrack,
    recommendedTaskDifficulty,
    shouldOfferMission,
    shouldOfferExperiment,
  };
}
