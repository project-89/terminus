import prisma from "@/app/lib/prisma";
import { memoryStore, uid, touch, MemoryMissionDefinition, MemoryMissionRun, MemoryReward } from "./memoryStore";
import type { SessionRecord } from "./sessionService";

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

const SEED_MISSIONS: MissionDefinitionRecord[] = [
  {
    id: "",
    title: "Decode the Matrix Echo",
    prompt:
      "An anomalous broadcast repeats numbers in base-89. Decode the hidden phrase and report its meaning.",
    type: "decode",
    minEvidence: 1,
    tags: ["logic", "signal", "numerics"],
  },
  {
    id: "",
    title: "Reality Fracture Observation",
    prompt:
      "Capture an image or detailed description of a liminal space near you that feels 'out of phase'. Note colors, sounds, and any presence felt.",
    type: "observe",
    minEvidence: 1,
    tags: ["perception", "field"],
  },
  {
    id: "",
    title: "Hyperstitional Meme Draft",
    prompt:
      "Draft a short memetic fragment (≤120 words) that could seed belief in the Project 89 resistance. Keep tone mysterious, hopeful, and subversive.",
    type: "create",
    minEvidence: 1,
    tags: ["creation", "memetic"],
  },
];

async function seedMissions(): Promise<void> {
  try {
    const existing = await prisma.missionDefinition.findMany();
    if (existing.length > 0) return;
    await prisma.missionDefinition.createMany({
      data: SEED_MISSIONS.map((mission) => ({
        title: mission.title,
        prompt: mission.prompt,
        type: mission.type,
        minEvidence: mission.minEvidence,
        tags: mission.tags,
      })),
    });
  } catch {
    if (memoryStore.missions.size > 0) return;
    SEED_MISSIONS.forEach((mission) => {
      const now = new Date();
      const record: MemoryMissionDefinition = {
        id: uid(),
        title: mission.title,
        prompt: mission.prompt,
        type: mission.type,
        minEvidence: mission.minEvidence,
        tags: mission.tags,
        active: true,
        createdAt: now,
        updatedAt: now,
      };
      memoryStore.missions.set(record.id, record);
    });
  }
}

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

export async function getNextMission(userId: string): Promise<MissionDefinitionRecord | null> {
  await seedMissions();
  try {
    const runs = (await prisma.missionRun.findMany({
      where: { userId },
      select: { missionId: true },
    })) as Array<{ missionId: string }>;
    const completedMissionIds = new Set(runs.map((run) => run.missionId));
    const definitions = (await prisma.missionDefinition.findMany({
      where: { active: true },
    })) as Array<Record<string, any>>;
    const next = definitions.find((def) => !completedMissionIds.has(def.id));
    if (!next) return null;
    return mapDefinition(next);
  } catch {
    const runs = memoryStore.missionRunsByUser.get(userId) || [];
    const completed = new Set(runs.map((run) => run.missionId));
    for (const mission of Array.from(memoryStore.missions.values())) {
      if (mission.active && !completed.has(mission.id)) {
        return mapDefinition(mission);
      }
    }
    return null;
  }
}

export async function acceptMission(params: {
  missionId: string;
  userId: string;
  sessionId?: string;
}): Promise<MissionRunRecord> {
  const { missionId, userId, sessionId } = params;
  await seedMissions();
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
