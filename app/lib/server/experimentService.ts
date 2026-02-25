import prisma from "@/app/lib/prisma";
import { memoryStore, uid } from "./memoryStore";
import { getProfile, upsertProfile } from "./profileService";
import {
  initializeExperimentHypothesis,
  recordExperimentObservation,
  resolveExperimentHypothesis,
} from "./bayes/orchestrator";

export type ExperimentStatus = "ACTIVE" | "RESOLVED_SUCCESS" | "RESOLVED_FAILURE" | "ABANDONED";

export type ExperimentRecord = {
  id: string;
  hypothesis: string;
  task: string;
  success_criteria?: string;
  timeout_s?: number | null;
  title?: string;
  status: ExperimentStatus;
  resolution?: string;
  createdAt: Date;
  updatedAt?: Date;
};

export type ExperimentNoteRecord = {
  id: string; // experiment id
  observation?: string;
  result?: string;
  score?: number;
  createdAt: Date;
};

// Keyword → trait mapping for experiment-to-profile feedback
const HYPOTHESIS_TRAIT_MAP: Record<string, string[]> = {
  curiosity: ["curiosity", "curious", "explore", "discover", "investigate", "wonder"],
  analytical: ["logic", "pattern", "cipher", "puzzle", "decode", "analyze", "deduc"],
  resilience: ["persist", "pressure", "endur", "resist", "challenge", "difficult"],
  creativity: ["creative", "novel", "imagin", "invent", "original", "unorthodox"],
  trust: ["trust", "secret", "confid", "loyal", "betray", "reveal"],
  empathy: ["empathy", "empath", "moral", "ethic", "feel", "compassion"],
};

function inferTraitsFromHypothesis(hypothesis: string): string[] {
  const lower = hypothesis.toLowerCase();
  const matched: string[] = [];
  for (const [trait, keywords] of Object.entries(HYPOTHESIS_TRAIT_MAP)) {
    if (keywords.some(kw => lower.includes(kw))) {
      matched.push(trait);
    }
  }
  return matched;
}

// Fallback in-memory notes when DB is unavailable
const notesByUser: Map<string, Array<{ key: string; value: string; createdAt: Date }>> =
  new Map();

function memPush(userId: string, key: string, value: string) {
  const arr = notesByUser.get(userId) || [];
  arr.push({ key, value, createdAt: new Date() });
  notesByUser.set(userId, arr);
}

// Get the current active experiment for a user (if any)
export async function getActiveExperiment(userId: string): Promise<ExperimentRecord | null> {
  try {
    const anyPrisma = prisma as any;
    if (anyPrisma.experiment?.findFirst) {
      const row = await anyPrisma.experiment.findFirst({
        where: { userId, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      });
      if (!row) return null;
      return {
        id: row.id,
        hypothesis: row.hypothesis,
        task: row.task,
        success_criteria: row.successCriteria || undefined,
        timeout_s: row.timeoutS || undefined,
        title: row.title || undefined,
        status: row.status as ExperimentStatus,
        resolution: row.resolution || undefined,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    }
  } catch (err) {
    console.warn("[ExperimentService] getActiveExperiment failed:", err);
  }
  return null;
}

// Resolve an experiment (mark it as success, failure, or abandoned)
export async function resolveExperiment(params: {
  userId: string;
  experimentId: string;
  status: "RESOLVED_SUCCESS" | "RESOLVED_FAILURE" | "ABANDONED";
  resolution?: string;
  finalScore?: number;
}): Promise<ExperimentRecord | null> {
  try {
    const anyPrisma = prisma as any;
    if (anyPrisma.experiment?.update) {
      const updated = await anyPrisma.experiment.update({
        where: { id: params.experimentId },
        data: {
          status: params.status,
          resolution: params.resolution || null,
        },
      });

      // Also add a final note if there's a resolution or score
      if (params.resolution || params.finalScore !== undefined) {
        await appendExperimentNote({
          userId: params.userId,
          id: params.experimentId,
          observation: params.resolution,
          result: params.status.replace("RESOLVED_", "").toLowerCase(),
          score: params.finalScore,
        });
      }

      console.log(`[ExperimentService] Resolved experiment ${params.experimentId} as ${params.status}`);

      // Post-resolution: update player profile traits based on hypothesis keywords
      try {
        const matchedTraits = inferTraitsFromHypothesis(updated.hypothesis || "");
        if (matchedTraits.length > 0) {
          const isSuccess = params.status === "RESOLVED_SUCCESS";
          const score = params.finalScore ?? (isSuccess ? 0.7 : 0.3);
          const delta = isSuccess ? 0.05 * score : -0.02;
          const profile = await getProfile(params.userId);
          const updatedTraits = { ...profile.traits };
          for (const trait of matchedTraits) {
            const key = `${trait}_score`;
            const current = typeof updatedTraits[key] === "number" ? updatedTraits[key] : 0;
            updatedTraits[key] = Math.max(0, Math.min(1, current + delta));
          }
          await upsertProfile(params.userId, { ...profile, traits: updatedTraits });
          console.log(`[ExperimentService] Updated traits for ${params.userId}: ${matchedTraits.join(", ")} (delta: ${delta})`);
        }
      } catch (traitErr) {
        console.warn("[ExperimentService] Trait update failed (non-blocking):", traitErr);
      }

      // Bayesian hypothesis engine integration
      try {
        const outcome =
          params.status === "RESOLVED_SUCCESS"
            ? "success"
            : params.status === "RESOLVED_FAILURE"
              ? "failure"
              : "abandoned";
        await resolveExperimentHypothesis({
          userId: params.userId,
          experimentId: params.experimentId,
          outcome,
          finalScore: params.finalScore,
          resolution: params.resolution,
          hypothesis: updated.hypothesis,
          task: updated.task,
          title: updated.title || undefined,
          createdAt: updated.createdAt,
          resolvedAt: updated.updatedAt || new Date(),
        });
      } catch (bayesErr) {
        console.warn("[ExperimentService] Bayesian resolve integration failed (non-blocking):", bayesErr);
      }

      return {
        id: updated.id,
        hypothesis: updated.hypothesis,
        task: updated.task,
        success_criteria: updated.successCriteria || undefined,
        timeout_s: updated.timeoutS || undefined,
        title: updated.title || undefined,
        status: updated.status as ExperimentStatus,
        resolution: updated.resolution || undefined,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    }
  } catch (err) {
    console.warn("[ExperimentService] resolveExperiment failed:", err);
  }
  return null;
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
}): Promise<ExperimentRecord | null> {
  // CORE RULE: Only ONE active experiment at a time
  // If there's already an active experiment, return it instead of creating a new one
  const activeExperiment = await getActiveExperiment(params.userId);
  if (activeExperiment) {
    console.log(`[ExperimentService] User ${params.userId} already has active experiment ${activeExperiment.id}, returning it`);
    try {
      await initializeExperimentHypothesis({
        userId: params.userId,
        experimentId: activeExperiment.id,
        hypothesis: activeExperiment.hypothesis,
        task: activeExperiment.task,
        successCriteria: activeExperiment.success_criteria,
        title: activeExperiment.title,
      });
    } catch (bayesErr) {
      console.warn("[ExperimentService] Bayesian init on active experiment failed (non-blocking):", bayesErr);
    }
    return activeExperiment;
  }

  const id = params.expId || `exp-${uid().slice(0, 8)}`;
  const payload: ExperimentRecord = {
    id,
    hypothesis: params.hypothesis,
    task: params.task,
    success_criteria: params.success_criteria,
    timeout_s: params.timeout_s ?? null,
    title: params.title,
    status: "ACTIVE",
    createdAt: new Date(),
  };

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
          status: "ACTIVE",
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

  try {
    await initializeExperimentHypothesis({
      userId: params.userId,
      experimentId: id,
      hypothesis: params.hypothesis,
      task: params.task,
      successCriteria: params.success_criteria,
      title: params.title,
    });
  } catch (bayesErr) {
    console.warn("[ExperimentService] Bayesian create integration failed (non-blocking):", bayesErr);
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

  try {
    await recordExperimentObservation({
      userId: params.userId,
      experimentId: params.id,
      observation: params.observation,
      result: params.result,
      score: params.score,
    });
  } catch (bayesErr) {
    console.warn("[ExperimentService] Bayesian note integration failed (non-blocking):", bayesErr);
  }
  return note;
}

export async function listRecentExperiments(params: {
  userId: string;
  limit?: number;
  statusFilter?: ExperimentStatus[];
}): Promise<ExperimentRecord[]> {
  const limit = params.limit ?? 5;
  try {
    const anyPrisma = prisma as any;
    if (anyPrisma.experiment?.findMany) {
      const whereClause: any = { userId: params.userId };
      if (params.statusFilter && params.statusFilter.length > 0) {
        whereClause.status = { in: params.statusFilter };
      }
      const rows = await anyPrisma.experiment.findMany({
        where: whereClause,
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
        status: (r.status as ExperimentStatus) || "ACTIVE",
        resolution: r.resolution || undefined,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
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
            if (!data.status) data.status = "ACTIVE"; // Default for legacy
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
            if (!data.status) data.status = "ACTIVE"; // Default for legacy
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
    status: ExperimentStatus;
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
          status: e.status,
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
          status: e.status,
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
        status: e.status,
        createdAt: e.createdAt.toISOString(),
      }));
    }
  }
}
