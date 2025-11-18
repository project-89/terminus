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

function computeTrustScoreFromRuns(
  runs: Array<{ score?: number }>
): number {
  if (!runs || runs.length === 0) return 0.2;
  const recent = runs
    .filter((r) => typeof r.score === "number")
    .slice(-5) as Array<{ score: number }>;
  if (recent.length === 0) return 0.25;
  const avg =
    recent.reduce((sum, run) => sum + (run.score ?? 0), 0) / recent.length;
  return Math.max(0.1, Math.min(1, avg));
}

async function buildPlayerMissionSignal(userId: string): Promise<PlayerMissionSignal> {
  const profile = await getProfile(userId);
  const runs = await resolveMissionRuns(userId);
  const trustScore = computeTrustScoreFromRuns(runs);

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

  const skills = profile?.skills || {};
  const trackEntries = Object.entries(skills);
  let weakestTrack: string | undefined;
  if (trackEntries.length > 0) {
    weakestTrack = trackEntries.reduce((lowest, [track, value]) => {
      if (!lowest) return track;
      const current = skills[lowest] ?? 0;
      return value < current ? track : lowest;
    }, trackEntries[0][0]);
  }

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

  try {
    const existing = await prisma.missionDefinition.findFirst({
      where: {
        tags: {
          has: catalogTag,
        },
      },
    });
    if (existing) {
      return mapDefinition(existing);
    }
    const created = await prisma.missionDefinition.create({
      data: {
        title: entry.title,
        prompt: entry.prompt,
        type: entry.type,
        minEvidence: 1,
        tags,
        active: true,
      },
    });
    return mapDefinition(created);
  } catch {
    // Fallback to memory store
    let definition = Array.from(memoryStore.missions.values()).find((mission) =>
      mission.tags?.includes(catalogTag)
    );
    if (!definition) {
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
    }
    return mapDefinition(definition);
  }
}

export async function getNextMission(userId: string): Promise<MissionDefinitionRecord | null> {
  const signal = await buildPlayerMissionSignal(userId);
  const catalog = getMissionCatalog();

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

  const chosen =
    candidates.length > 0
      ? candidates[0].entry
      : catalog[Math.floor(Math.random() * catalog.length)];

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
  } catch {
    const mission = memoryStore.missions.get(missionId);
    if (!mission) {
      throw new Error("Mission not found");
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

export async function submitMissionReport(params: {
  missionRunId: string;
  payload: string;
}): Promise<MissionRunRecord & { reward?: { type: string; amount: number } }> {
  const { missionRunId, payload } = params;
  const score = Math.max(0, Math.min(1, Math.random() * 0.4 + 0.6));
  const rewardAmount = Math.round(score * 100) / 10; // credits
  try {
    const run = await prisma.missionRun.update({
      where: { id: missionRunId },
      data: {
        status: "COMPLETED",
        score,
        feedback: "Mission review complete. The Logos grows with your insight.",
        payload,
      },
      include: { mission: true },
    });
    await prisma.reward.create({
      data: {
        userId: run.userId,
        missionRunId,
        type: "CREDIT",
        amount: rewardAmount,
      },
    });
    return {
      id: run.id,
      mission: await mapDefinition(run.mission),
      status: "COMPLETED",
      score,
      feedback: run.feedback ?? undefined,
      reward: { type: "CREDIT", amount: rewardAmount },
    };
  } catch {
    const run = memoryStore.missionRuns.get(missionRunId);
    if (!run) {
      throw new Error("Mission run not found");
    }
    run.status = "COMPLETED";
    run.score = score;
    run.feedback = "Mission review complete. The Logos grows with your insight.";
    run.payload = payload;
    run.updatedAt = new Date();
    memoryStore.missionRuns.set(missionRunId, run);

    const mission = memoryStore.missions.get(run.missionId);
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
