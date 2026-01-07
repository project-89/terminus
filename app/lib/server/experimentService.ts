import prisma from "@/app/lib/prisma";
import { memoryStore, uid } from "./memoryStore";

export type ExperimentRecord = {
  id: string;
  hypothesis: string;
  task: string;
  success_criteria?: string;
  timeout_s?: number | null;
  title?: string;
  createdAt: Date;
};

export type ExperimentNoteRecord = {
  id: string; // experiment id
  observation?: string;
  result?: string;
  score?: number;
  createdAt: Date;
};

// Fallback in-memory notes when DB is unavailable
const notesByUser: Map<string, Array<{ key: string; value: string; createdAt: Date }>> =
  new Map();

function memPush(userId: string, key: string, value: string) {
  const arr = notesByUser.get(userId) || [];
  arr.push({ key, value, createdAt: new Date() });
  notesByUser.set(userId, arr);
}

export async function createExperiment(params: {
  userId: string;
  threadId?: string | null;
  expId?: string;
  hypothesis: string;
  task: string;
  success_criteria?: string;
  timeout_s?: number;
  title?: string;
}): Promise<ExperimentRecord> {
  const id = params.expId || `exp-${uid().slice(0, 8)}`;
  const payload = {
    id,
    hypothesis: params.hypothesis,
    task: params.task,
    success_criteria: params.success_criteria,
    timeout_s: params.timeout_s ?? null,
    title: params.title,
    createdAt: new Date(),
  } satisfies ExperimentRecord;

  try {
    // Prefer first-class Experiment if schema is migrated
    const anyPrisma = prisma as any;
    if (anyPrisma.experiment?.create) {
      await anyPrisma.experiment.create({
        data: {
          id,
          userId: params.userId,
          threadId: params.threadId || null,
          hypothesis: params.hypothesis,
          task: params.task,
          successCriteria: params.success_criteria || null,
          timeoutS: params.timeout_s ?? null,
          title: params.title || null,
        },
      });
      console.log(`[ExperimentService] Created experiment ${id} in Experiment table`);
    } else {
      throw new Error("experiment model not available");
    }
  } catch (err: any) {
    console.warn(`[ExperimentService] Experiment.create failed for ${id}, falling back to AgentNote:`, err?.message);
    try {
      await prisma.agentNote.create({
        data: {
          userId: params.userId,
          threadId: params.threadId || null,
          key: `experiment:${id}`,
          value: JSON.stringify(payload),
        },
      });
    } catch {
      memPush(params.userId, `experiment:${id}`, JSON.stringify(payload));
    }
  }

  return payload;
}

export async function appendExperimentNote(params: {
  userId: string;
  threadId?: string | null;
  id: string;
  observation?: string;
  result?: string;
  score?: number;
}): Promise<ExperimentNoteRecord> {
  const note = {
    id: params.id,
    observation: params.observation,
    result: params.result,
    score: params.score,
    createdAt: new Date(),
  } satisfies ExperimentNoteRecord;

  try {
    const anyPrisma = prisma as any;
    if (anyPrisma.experimentEvent?.create) {
      await anyPrisma.experimentEvent.create({
        data: {
          experiment: { connect: { id: params.id } },
          observation: params.observation || null,
          result: params.result || null,
          score: typeof params.score === "number" ? params.score : null,
        },
      });
    } else {
      throw new Error("experimentEvent model not available");
    }
  } catch {
    try {
      await prisma.agentNote.create({
        data: {
          userId: params.userId,
          threadId: params.threadId || null,
          key: `experiment:${params.id}:note`,
          value: JSON.stringify(note),
        },
      });
    } catch {
      memPush(params.userId, `experiment:${params.id}:note`, JSON.stringify(note));
    }
  }
  return note;
}

export async function listRecentExperiments(params: {
  userId: string;
  limit?: number;
}): Promise<ExperimentRecord[]> {
  const limit = params.limit ?? 5;
  try {
    const anyPrisma = prisma as any;
    if (anyPrisma.experiment?.findMany) {
      const rows = await anyPrisma.experiment.findMany({
        where: { userId: params.userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return rows.map((r: any) => ({
        id: r.id,
        hypothesis: r.hypothesis,
        task: r.task,
        success_criteria: r.successCriteria || undefined,
        timeout_s: r.timeoutS || undefined,
        title: r.title || undefined,
        createdAt: r.createdAt,
      }));
    }
    throw new Error("experiment model not available");
  } catch {
    try {
      const notes = await prisma.agentNote.findMany({
        where: { userId: params.userId },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      const experiments: ExperimentRecord[] = [];
      const seen = new Set<string>();
      for (const n of notes) {
        if (!n.key?.startsWith("experiment:")) continue;
        const parts = n.key.split(":");
        if (parts.length === 2) {
          try {
            const data = JSON.parse(n.value) as ExperimentRecord;
            if (!seen.has(data.id)) {
              experiments.push(data);
              seen.add(data.id);
            }
            if (experiments.length >= limit) break;
          } catch {}
        }
      }
      return experiments;
    } catch {
      const arr = notesByUser.get(params.userId) || [];
      const experiments: ExperimentRecord[] = [];
      const seen = new Set<string>();
    for (const n of [...arr].reverse() as Array<{ key: string; value: string }>) {
      if (!n.key.startsWith("experiment:")) continue;
      const parts = n.key.split(":");
      if (parts.length === 2) {
        try {
          const data = JSON.parse(n.value) as ExperimentRecord;
            if (!seen.has(data.id)) {
              experiments.push(data);
              seen.add(data.id);
            }
            if (experiments.length >= limit) break;
          } catch {}
        }
      }
      return experiments;
    }
  }
}

export async function summarizeExperiments(params: {
  userId: string;
  limit?: number;
}): Promise<
  Array<{
    id: string;
    hypothesis: string;
    task: string;
    lastScore?: number;
    lastResult?: string;
    createdAt: string;
  }>
> {
  const exps = await listRecentExperiments({ userId: params.userId, limit: params.limit ?? 5 });
  // Fetch notes and attach last note summary
  try {
    const anyPrisma = prisma as any;
    if (anyPrisma.experimentEvent?.findMany) {
      const rows = await anyPrisma.experimentEvent.findMany({
        where: { experimentId: { in: exps.map((e) => e.id) } },
        orderBy: { createdAt: "desc" },
        take: 200,
      });
      const byExp = new Map<string, any>();
      for (const r of rows) {
        if (!byExp.has(r.experimentId)) byExp.set(r.experimentId, r);
      }
      return exps.map((e) => {
        const ln = byExp.get(e.id);
        return {
          id: e.id,
          hypothesis: e.hypothesis,
          task: e.task,
          lastScore: typeof ln?.score === "number" ? ln.score : undefined,
          lastResult: ln?.result || undefined,
          createdAt: e.createdAt.toISOString(),
        };
      });
    }
    throw new Error("experimentEvent model not available");
  } catch {
    try {
      const notes = await prisma.agentNote.findMany({
        where: { userId: params.userId },
        orderBy: { createdAt: "desc" },
        take: 200,
      });
      const result: any[] = [];
      for (const e of exps) {
        const lastNote = notes.find((n: { key: string; value: string }) => n.key === `experiment:${e.id}:note`);
        let ln: any = undefined;
        try {
          ln = lastNote ? JSON.parse(lastNote.value) : undefined;
        } catch {}
        result.push({
          id: e.id,
          hypothesis: e.hypothesis,
          task: e.task,
          lastScore: typeof ln?.score === "number" ? ln.score : undefined,
          lastResult: ln?.result,
          createdAt: e.createdAt.toISOString(),
        });
      }
      return result;
    } catch {
      return exps.map((e) => ({
        id: e.id,
        hypothesis: e.hypothesis,
        task: e.task,
        createdAt: e.createdAt.toISOString(),
      }));
    }
  }
}
