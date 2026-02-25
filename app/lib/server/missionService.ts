import { z } from "zod";
import { generateObject } from "ai";
import { getModel } from "@/app/lib/ai/models";
import { rewardService } from "@/app/lib/services/rewardService";
import prisma from "@/app/lib/prisma";
import {
  memoryStore,
  uid,
  touch,
  MemoryMissionDefinition,
  MemoryMissionRun,
  MemoryReward,
} from "./memoryStore";
import { getProfile, ProfileRecord } from "./profileService";
import { getMissionCatalog, MissionCatalogEntry } from "../missions/catalog";
import { updateTrackDifficulty, getPlayerDifficulty, type DifficultyTrack } from "./difficultyService";
import { getTrustState } from "./trustService";
import { recordMissionBayesianOutcome } from "./bayes/orchestrator";

// Shared mission type → difficulty track mapping
const MISSION_TYPE_TO_TRACK: Record<string, DifficultyTrack> = {
  // Logic track
  decode: "logic",
  cipher: "logic",
  puzzle: "logic",
  analysis: "logic",
  // Perception track
  observe: "perception",
  surveillance: "perception",
  pattern: "perception",
  audio: "perception",
  // Creation track
  create: "creation",
  compose: "creation",
  design: "creation",
  memetic: "creation",
  // Field track
  field: "field",
  retrieve: "field",
  deploy: "field",
  social: "field",
  empathy: "field",
};

export type MissionDefinitionRecord = {
  id: string;
  title: string;
  prompt: string;
  type: string;
  minEvidence: number;
  tags: string[];
};

export type MissionRunRecord = {
  id: string;
  mission: MissionDefinitionRecord;
  status: "PENDING" | "ACCEPTED" | "SUBMITTED" | "REVIEWING" | "COMPLETED" | "FAILED";
  score?: number;
  feedback?: string;
};

const ReportEvaluationSchema = z.object({
  score: z.number().min(0).max(1).describe("Evaluation score between 0 and 1. 1 is perfect."),
  feedback: z.string().describe("Brief, in-universe feedback from a handler."),
  rewardAdjustment: z.number().min(0.5).max(2.0).optional().describe("Multiplier for reward based on quality (default 1.0)"),
});

async function mapDefinition(record: any): Promise<MissionDefinitionRecord> {
  if (!record) throw new Error("Mission definition not found");
  return {
    id: record.id,
    title: record.title,
    prompt: record.prompt,
    type: record.type,
    minEvidence: record.minEvidence ?? 1,
    tags: Array.isArray(record.tags) ? record.tags : [],
  };
}

const CATALOG_TAG_PREFIX = "catalog:";

function getCatalogTag(slug: string) {
  return `${CATALOG_TAG_PREFIX}${slug}`;
}

function extractCatalogTag(tags?: string[]): string | undefined {
  if (!Array.isArray(tags)) return undefined;
  const tag = tags.find((t) => t.startsWith(CATALOG_TAG_PREFIX));
  return tag ? tag.slice(CATALOG_TAG_PREFIX.length) : undefined;
}

type PlayerMissionSignal = {
  profile: ProfileRecord;
  trustScore: number;
  weakestTrack?: string;
  completedSlugs: Set<string>;
};

async function resolveMissionRuns(userId: string) {
  try {
    return await prisma.missionRun.findMany({
      where: { userId },
      include: { mission: true },
    });
  } catch {
    return memoryStore.missionRunsByUser.get(userId) || [];
  }
}

async function buildPlayerMissionSignal(userId: string): Promise<PlayerMissionSignal> {
  const profile = await getProfile(userId);
  const runs = await resolveMissionRuns(userId);

  // Use global trust system instead of computing from mission scores
  let trustScore = 0.2; // Default for new agents
  try {
    const trustState = await getTrustState(userId);
    trustScore = trustState.trustScore;
  } catch {
    // Fall back to default if trust system unavailable
  }

  const completedSlugs = new Set<string>();
  for (const run of runs) {
    let tags =
      (run as any)?.mission?.tags ??
      (run as MemoryMissionRun as any)?.tags;
    if (!tags && "missionId" in (run as any)) {
      const memMission = memoryStore.missions.get(
        (run as any).missionId
      );
      tags = memMission?.tags;
    }
    const slug = extractCatalogTag(tags);
    if (slug) completedSlugs.add(slug);
  }

  // Use the auto-updated track difficulty ratings instead of stale profile.skills
  const difficulty = await getPlayerDifficulty(userId);
  const trackEntries: [string, number][] = [
    ["logic", difficulty.logic],
    ["perception", difficulty.perception],
    ["creation", difficulty.creation],
    ["field", difficulty.field],
  ];

  // Find the weakest track (lowest rating = needs more practice)
  const weakestTrack = trackEntries.reduce((lowest, [track, value]) => {
    const lowestValue = trackEntries.find(([t]) => t === lowest)?.[1] ?? 1;
    return value < lowestValue ? track : lowest;
  }, trackEntries[0][0]);

  return { profile, trustScore, weakestTrack, completedSlugs };
}

function scoreMissionEntry(
  entry: MissionCatalogEntry,
  signal: PlayerMissionSignal
): number {
  const { trustScore, profile, weakestTrack } = signal;
  if (typeof entry.minTrust === "number" && trustScore < entry.minTrust) {
    return -Infinity;
  }
  if (typeof entry.maxTrust === "number" && trustScore > entry.maxTrust) {
    return -Infinity;
  }

  const traits = profile?.traits || {};
  if (entry.requiredTraits) {
    for (const [trait, threshold] of Object.entries(entry.requiredTraits)) {
      if (Number(traits[trait] ?? 0) < threshold) {
        return -Infinity;
      }
    }
  }

  let score = entry.priority ?? 0;
  if (entry.preferredTraits) {
    for (const [trait, target] of Object.entries(entry.preferredTraits)) {
      const value = Number(traits[trait] ?? 0);
      score += Math.max(0, value - target / 2);
    }
  }

  if (weakestTrack && entry.track === weakestTrack) {
    score += 1.5;
  }

  // Encourage variety when trust increases
  score += trustScore * 0.5;

  // Tiny noise to break ties
  score += Math.random() * 0.1;

  return score;
}

async function ensureMissionDefinitionFromCatalog(
  entry: MissionCatalogEntry
): Promise<MissionDefinitionRecord> {
  const catalogTag = getCatalogTag(entry.id);
  const tags = Array.from(new Set([catalogTag, ...entry.tags]));
  console.log(`[MissionService] Ensuring definition for ${entry.id} (tag: ${catalogTag})`);

  let definition: any = null;

  // Try Prisma
  try {
    const existing = await prisma.missionDefinition.findFirst({
      where: { tags: { has: catalogTag } },
    });
    if (existing) {
      console.log(`[MissionService] Found in Prisma: ${existing.id}`);
      return mapDefinition(existing);
    }
    
    console.log("[MissionService] Creating in Prisma...");
    definition = await prisma.missionDefinition.create({
      data: {
        title: entry.title,
        prompt: entry.prompt,
        type: entry.type,
        minEvidence: 1,
        tags,
        active: true,
      },
    });
    console.log(`[MissionService] Created in Prisma: ${definition.id}`);
    return mapDefinition(definition);
  } catch (e) {
    console.log(`[MissionService] Prisma error. Using Memory Store.`);
    
    // Memory Store Fallback
    definition = Array.from(memoryStore.missions.values()).find((mission) =>
      mission.tags?.includes(catalogTag)
    );

    if (!definition) {
      console.log("[MissionService] Creating in Memory...");
      const now = new Date();
      definition = {
        id: uid(),
        title: entry.title,
        prompt: entry.prompt,
        type: entry.type,
        minEvidence: 1,
        tags,
        active: true,
        createdAt: now,
        updatedAt: now,
      };
      memoryStore.missions.set(definition.id, definition);
    } else {
      console.log(`[MissionService] Found in Memory: ${definition.id}`);
    }
    
    console.log(`[MissionService] Mapping definition:`, JSON.stringify(definition));
    const result = await mapDefinition(definition);
    console.log(`[MissionService] Mapped result:`, JSON.stringify(result));
    return result;
  }
}

export async function getNextMission(userId: string): Promise<MissionDefinitionRecord | null> {
  console.log(`[MissionService] getNextMission for ${userId}`);
  const signal = await buildPlayerMissionSignal(userId);
  const catalog = getMissionCatalog();
  console.log(`[MissionService] Catalog size: ${catalog.length}. Trust: ${signal.trustScore}`);

  // First, check for admin-created missions that are active and not from catalog
  let adminMissions: MissionDefinitionRecord[] = [];
  try {
    const dbMissions = await prisma.missionDefinition.findMany({
      where: {
        active: true,
        // Exclude catalog missions (they have catalog: tags)
        NOT: {
          tags: {
            hasSome: catalog.map(c => getCatalogTag(c.id)),
          },
        },
      },
    });

    // Check if user has already completed these admin missions
    const completedMissionIds = new Set(
      (await prisma.missionRun.findMany({
        where: { userId, status: "COMPLETED" },
        select: { missionId: true },
      })).map((r: { missionId: string }) => r.missionId)
    );

    const eligibleAdminDefinitions = dbMissions.filter((m: { id: string }) => !completedMissionIds.has(m.id));
    const adminDefinitionById = new Map(eligibleAdminDefinitions.map((m: any) => [m.id, m]));

    adminMissions = await Promise.all(eligibleAdminDefinitions.map((m: any) => mapDefinition(m)));

    console.log(`[MissionService] Admin missions available: ${adminMissions.length}`);

    if (adminMissions.length > 0) {
      const targetEvidence = signal.trustScore >= 0.75 ? 3 : signal.trustScore >= 0.45 ? 2 : 1;
      const scoredAdminMissions = adminMissions
        .map((mission) => {
          const definition = adminDefinitionById.get(mission.id);
          const minEvidence = Math.max(1, mission.minEvidence || 1);
          const evidenceDistance = Math.abs(minEvidence - targetEvidence);
          const lowTrustPenalty = signal.trustScore < 0.35 && minEvidence > 1 ? 2.5 : 0;
          const recencyBonus = definition?.updatedAt
            ? Math.max(0, (definition.updatedAt.getTime() - Date.now() + 30 * 24 * 60 * 60 * 1000) / (30 * 24 * 60 * 60 * 1000))
            : 0;
          const score = 10 - evidenceDistance * 1.5 - lowTrustPenalty + recencyBonus;
          return { mission, score };
        })
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.mission.title.localeCompare(b.mission.title);
        });

      const chosen = scoredAdminMissions[0]?.mission;
      if (chosen) {
        console.log(`[MissionService] Chose admin mission: ${chosen.id}`);
        return chosen;
      }
    }
  } catch (e) {
    console.log(`[MissionService] Could not fetch admin missions: ${e}`);
  }

  // Prioritize admin-created missions if any exist
  if (adminMissions.length > 0) return adminMissions[0];

  // Fall back to catalog-based selection
  const candidates = catalog
    .filter((entry) => {
      if (!entry.repeatable && signal.completedSlugs.has(entry.id)) {
        return false;
      }
      return true;
    })
    .map((entry) => ({
      entry,
      score: scoreMissionEntry(entry, signal),
    }))
    .filter(({ score }) => Number.isFinite(score))
    .sort((a, b) => b.score - a.score);

  console.log(`[MissionService] Catalog candidates: ${candidates.length}`);

  const chosen =
    candidates.length > 0
      ? candidates[0].entry
      : catalog[Math.floor(Math.random() * catalog.length)];

  console.log(`[MissionService] Chosen: ${chosen?.id}`);

  if (!chosen) {
    return null;
  }

  return ensureMissionDefinitionFromCatalog(chosen);
}

export async function acceptMission(params: {
  missionId: string;
  userId: string;
  sessionId?: string;
}): Promise<MissionRunRecord> {
  const { missionId, userId, sessionId } = params;

  // Check for existing active mission - only one active mission allowed at a time
  const existingActive = await getLatestOpenMissionRun(userId);
  if (existingActive) {
    throw new Error(`Already have an active mission: ${existingActive.mission.title}. Complete or abandon it first.`);
  }

  try {
    const run = await prisma.missionRun.create({
      data: {
        missionId,
        userId,
        sessionId,
        status: "ACCEPTED",
      },
      include: { mission: true },
    });
    return {
      id: run.id,
      mission: await mapDefinition(run.mission),
      status: run.status as MissionRunRecord["status"],
    };
  } catch (e) {
    // Check if this is a Prisma connection error vs other error
    const isPrismaError = e && typeof e === 'object' && 'code' in e;
    if (isPrismaError) throw e;

    const mission = memoryStore.missions.get(missionId);
    if (!mission) {
      throw new Error("Mission not found");
    }

    // Check memory store for active missions
    const memRuns = memoryStore.missionRunsByUser.get(userId) || [];
    const activeMemRun = memRuns.find(r => ["ACCEPTED", "SUBMITTED", "REVIEWING"].includes(r.status));
    if (activeMemRun) {
      throw new Error("Already have an active mission. Complete or abandon it first.");
    }

    const now = new Date();
    const run: MemoryMissionRun = {
      id: uid(),
      missionId,
      userId,
      sessionId,
      status: "ACCEPTED",
      createdAt: now,
      updatedAt: now,
    };
    memoryStore.missionRuns.set(run.id, run);
    const list = touch(memoryStore.missionRunsByUser, userId);
    list.push(run);
    return {
      id: run.id,
      mission: await mapDefinition(mission),
      status: run.status,
    };
  }
}

// Minimum score threshold for mission to be considered successful
const MISSION_PASS_THRESHOLD = 0.4;

export async function submitMissionReport(params: {
  missionRunId: string;
  payload: string;
}): Promise<MissionRunRecord & { reward?: { type: string; amount: number } }> {
  const { missionRunId, payload } = params;

  // 1. Fetch Run & Mission
  let run: any;
  try {
    run = await prisma.missionRun.findUnique({
      where: { id: missionRunId },
      include: { mission: true },
    });
  } catch {
    // Fallback to memory store handling handled in catch block below
  }

  if (run) {
    // Enforce minEvidence - check payload length as a proxy
    const minEvidence = run.mission.minEvidence || 1;
    const payloadLength = payload?.trim().length || 0;
    const minCharsPerEvidence = 20; // Keep baseline lenient; higher minEvidence still enforces richer reports.
    if (payloadLength < minEvidence * minCharsPerEvidence) {
      try {
        await recordMissionBayesianOutcome({
          userId: run.userId,
          missionType: run.mission.type || "decode",
          missionRunId,
          status: "ACCEPTED",
          score: Math.max(0, Math.min(1, payloadLength / Math.max(1, minEvidence * minCharsPerEvidence))),
          minEvidence,
          payloadLength,
          createdAt: run.createdAt,
          resolvedAt: new Date(),
        });
      } catch (bayesErr) {
        console.warn("[MissionService] Bayesian ACCEPTED integration failed (non-blocking):", bayesErr);
      }
      return {
        id: run.id,
        mission: await mapDefinition(run.mission),
        status: "ACCEPTED", // Keep in accepted state - not enough evidence
        feedback: `Insufficient evidence. Mission requires at least ${minEvidence} piece(s) of evidence. Provide more detail in your report.`,
      };
    }

    // AI Evaluation
    const model = getModel("content");
    const { object } = await generateObject({
      model,
      schema: ReportEvaluationSchema,
      prompt: `
        Role: Operations Adjudicator for Project 89.
        Task: Evaluate a field report against a mission objective.

        Mission Title: ${run.mission.title}
        Mission Objective: ${run.mission.prompt}
        Mission Type: ${run.mission.type}
        Minimum Evidence Required: ${minEvidence}

        Agent Report: "${payload}"

        Evaluate strictly.
        - If the report is nonsense or completely off-topic, score 0-0.2.
        - If it captures the vibe but lacks concrete evidence, score 0.3-0.5.
        - If it addresses the objective with some evidence, score 0.5-0.7.
        - If it solves the task with clear evidence, score 0.8-1.0.

        Score below ${MISSION_PASS_THRESHOLD} = FAILED mission.

        Provide feedback in the voice of a cryptic handler.
      `,
    });

    const score = object.score;
    const feedback = object.feedback;
    const multiplier = object.rewardAdjustment || 1.0;

    // Determine final status based on score
    const finalStatus = score >= MISSION_PASS_THRESHOLD ? "COMPLETED" : "FAILED";

    // Only grant rewards for successful missions
    const baseReward = 50;
    const rewardAmount = finalStatus === "COMPLETED" ? Math.round(baseReward * score * multiplier) : 0;

    // Update Run
    const updatedRun = await prisma.missionRun.update({
      where: { id: missionRunId },
      data: {
        status: finalStatus,
        score,
        feedback,
        payload,
      },
      include: { mission: true },
    });

    // Grant Reward only for successful missions
    if (rewardAmount > 0) {
      await rewardService.grant(
        updatedRun.userId,
        rewardAmount,
        `Mission: ${updatedRun.mission.title}`,
        missionRunId
      );
    }

    // Update track difficulty based on mission type
    const missionType = updatedRun.mission.type?.toLowerCase() || "decode";
    const track = MISSION_TYPE_TO_TRACK[missionType] || "logic";
    const taskDifficulty = 0.5; // Default mid-range, could be stored on mission
    try {
      await updateTrackDifficulty(updatedRun.userId, track, taskDifficulty, score >= 0.6);
    } catch {}

    try {
      await recordMissionBayesianOutcome({
        userId: updatedRun.userId,
        missionType,
        missionRunId,
        status: finalStatus,
        score,
        minEvidence,
        payloadLength,
        createdAt: run.createdAt,
        resolvedAt: updatedRun.updatedAt || new Date(),
      });
    } catch (bayesErr) {
      console.warn("[MissionService] Bayesian mission integration failed (non-blocking):", bayesErr);
    }

    return {
      id: updatedRun.id,
      mission: await mapDefinition(updatedRun.mission),
      status: finalStatus,
      score,
      feedback,
      reward: rewardAmount > 0 ? { type: "CREDIT", amount: rewardAmount } : undefined,
    };
  }

  // --- Memory Store Fallback (Legacy/Dev) ---
  // Conservative payload-length-based scoring (no random inflation)
  const payloadLen = payload?.length ?? 0;
  const score = payloadLen < 50 ? 0.1 : payloadLen < 100 ? 0.3 : 0.5;
  const finalStatus = score >= MISSION_PASS_THRESHOLD ? "COMPLETED" : "FAILED";
  const rewardAmount = finalStatus === "COMPLETED" ? Math.round(score * 100) / 10 : 0;
  try {
      const run = memoryStore.missionRuns.get(missionRunId);
      if (!run) {
        throw new Error("Mission run not found");
      }
      run.status = finalStatus;
      run.score = score;
      run.feedback = finalStatus === "COMPLETED"
        ? "Mission review complete (fallback mode). The Logos grows with your insight."
        : "Insufficient evidence submitted (fallback mode). Mission failed.";
      run.payload = payload;
      run.updatedAt = new Date();
      memoryStore.missionRuns.set(missionRunId, run);
      const mission = memoryStore.missions.get(run.missionId);

      try {
        const missionType = mission?.type || "decode";
        await recordMissionBayesianOutcome({
          userId: run.userId,
          missionType,
          missionRunId,
          status: finalStatus,
          score,
          payloadLength: payloadLen,
          minEvidence: mission?.minEvidence || 1,
          createdAt: run.createdAt,
          resolvedAt: run.updatedAt,
        });
      } catch (bayesErr) {
        console.warn("[MissionService] Bayesian fallback mission integration failed (non-blocking):", bayesErr);
      }

      const reward: MemoryReward = {
        id: uid(),
        userId: run.userId,
        missionRunId,
        type: "CREDIT",
        amount: rewardAmount,
        createdAt: new Date(),
      };
      memoryStore.rewards.set(reward.id, reward);
      const rewards = touch(memoryStore.rewardsByUser, run.userId);
      rewards.push(reward);
      return {
        id: run.id,
        mission: mission ? await mapDefinition(mission) : await mapDefinition({
          id: run.missionId,
          title: "",
          prompt: "",
          type: "decode",
          minEvidence: 1,
          tags: [],
        }),
        status: run.status,
        score,
        feedback: run.feedback,
        reward: { type: "CREDIT", amount: rewardAmount },
      };
  } catch (e) {
    throw e;
  }
}

export async function getLatestOpenMissionRun(userId: string): Promise<MissionRunRecord | null> {
  try {
    const run = await prisma.missionRun.findFirst({
      where: {
        userId,
        status: { in: ["ACCEPTED", "SUBMITTED", "REVIEWING"] },
      },
      orderBy: { createdAt: "desc" },
      include: { mission: true },
    });
    if (!run) return null;
    return {
      id: run.id,
      mission: await mapDefinition(run.mission),
      status: run.status as MissionRunRecord["status"],
      score: run.score ?? undefined,
      feedback: run.feedback ?? undefined,
    };
  } catch {
    const runs = memoryStore.missionRunsByUser.get(userId) || [];
    const run = [...runs]
      .reverse()
      .find((r) => ["ACCEPTED", "SUBMITTED", "REVIEWING"].includes(r.status));
    if (!run) return null;
    const mission = memoryStore.missions.get(run.missionId);
    const missionRecord = mission
      ? await mapDefinition(mission)
      : ({
          id: run.missionId,
          title: "Unknown Mission",
          prompt: "Report lost mission context.",
          type: "decode",
          minEvidence: 1,
          tags: [],
        } satisfies MissionDefinitionRecord);
    return {
      id: run.id,
      mission: missionRecord,
      status: run.status,
      score: run.score,
      feedback: run.feedback,
    };
  }
}

/**
 * Abandon an active mission. This allows agents to cancel missions they can't complete.
 * Abandoned missions count as failures for difficulty tracking but don't grant rewards.
 */
export async function abandonMission(params: {
  missionRunId: string;
  userId: string;
  reason?: string;
}): Promise<MissionRunRecord> {
  const { missionRunId, userId, reason } = params;

  try {
    const run = await prisma.missionRun.findFirst({
      where: {
        id: missionRunId,
        userId,
        status: { in: ["ACCEPTED", "SUBMITTED", "REVIEWING"] },
      },
      include: { mission: true },
    });

    if (!run) {
      throw new Error("No active mission found to abandon");
    }

    const updatedRun = await prisma.missionRun.update({
      where: { id: missionRunId },
      data: {
        status: "FAILED",
        score: 0,
        feedback: reason || "Mission abandoned by agent.",
      },
      include: { mission: true },
    });

    // Update difficulty track (counts as failure)
    const missionType = updatedRun.mission.type?.toLowerCase() || "decode";
    const track = MISSION_TYPE_TO_TRACK[missionType] || "logic";
    try {
      await updateTrackDifficulty(userId, track, 0.5, false);
    } catch {}

    try {
      await recordMissionBayesianOutcome({
        userId,
        missionType,
        missionRunId,
        status: "FAILED",
        score: 0,
        minEvidence: updatedRun.mission.minEvidence || 1,
        createdAt: run.createdAt,
        resolvedAt: updatedRun.updatedAt || new Date(),
      });
    } catch (bayesErr) {
      console.warn("[MissionService] Bayesian abandon integration failed (non-blocking):", bayesErr);
    }

    return {
      id: updatedRun.id,
      mission: await mapDefinition(updatedRun.mission),
      status: "FAILED",
      score: 0,
      feedback: reason || "Mission abandoned by agent.",
    };
  } catch (e) {
    // Memory store fallback
    const run = memoryStore.missionRuns.get(missionRunId);
    if (!run || run.userId !== userId) {
      throw new Error("No active mission found to abandon");
    }

    run.status = "FAILED";
    run.score = 0;
    run.feedback = reason || "Mission abandoned by agent.";
    run.updatedAt = new Date();
    memoryStore.missionRuns.set(missionRunId, run);

    try {
      const mission = memoryStore.missions.get(run.missionId);
      await recordMissionBayesianOutcome({
        userId,
        missionType: mission?.type || "decode",
        missionRunId,
        status: "FAILED",
        score: 0,
        minEvidence: mission?.minEvidence || 1,
        createdAt: run.createdAt,
        resolvedAt: run.updatedAt,
      });
    } catch (bayesErr) {
      console.warn("[MissionService] Bayesian fallback abandon integration failed (non-blocking):", bayesErr);
    }

    const mission = memoryStore.missions.get(run.missionId);
    return {
      id: run.id,
      mission: mission
        ? await mapDefinition(mission)
        : {
            id: run.missionId,
            title: "Unknown Mission",
            prompt: "",
            type: "decode",
            minEvidence: 1,
            tags: [],
          },
      status: "FAILED",
      score: 0,
      feedback: reason || "Mission abandoned by agent.",
    };
  }
}
