import prisma from "@/app/lib/prisma";
import { createEmptyAgentState, normalizeState } from "./engine";
import type { BayesianAgentState } from "./types";

const STATE_KEY = "bayes:state:v1";
const inMemoryState = new Map<string, BayesianAgentState>();

function cloneState(state: BayesianAgentState): BayesianAgentState {
  return JSON.parse(JSON.stringify(state)) as BayesianAgentState;
}

export async function loadBayesianState(userId: string): Promise<BayesianAgentState> {
  const fallback = inMemoryState.get(userId);

  try {
    const anyPrisma = prisma as any;
    if (!anyPrisma.agentNote?.findFirst) {
      return fallback ? cloneState(fallback) : createEmptyAgentState();
    }

    const row = await anyPrisma.agentNote.findFirst({
      where: {
        userId,
        key: STATE_KEY,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!row?.value) {
      return fallback ? cloneState(fallback) : createEmptyAgentState();
    }

    const parsed = JSON.parse(row.value);
    const normalized = normalizeState(parsed);
    inMemoryState.set(userId, normalized);
    return cloneState(normalized);
  } catch {
    return fallback ? cloneState(fallback) : createEmptyAgentState();
  }
}

export async function saveBayesianState(userId: string, state: BayesianAgentState): Promise<void> {
  const payload = JSON.stringify(state);
  inMemoryState.set(userId, cloneState(state));

  try {
    const anyPrisma = prisma as any;
    if (!anyPrisma.agentNote?.findFirst || !anyPrisma.agentNote?.create) {
      return;
    }

    const existing = await anyPrisma.agentNote.findFirst({
      where: {
        userId,
        key: STATE_KEY,
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing?.id && anyPrisma.agentNote?.update) {
      await anyPrisma.agentNote.update({
        where: { id: existing.id },
        data: { value: payload },
      });
      return;
    }

    await anyPrisma.agentNote.create({
      data: {
        userId,
        key: STATE_KEY,
        value: payload,
      },
    });
  } catch {
    // In-memory fallback already updated.
  }
}

export async function updateBayesianState<T>(params: {
  userId: string;
  mutate: (state: BayesianAgentState) => T | Promise<T>;
}): Promise<{ state: BayesianAgentState; result: T }> {
  const current = await loadBayesianState(params.userId);
  const mutable = cloneState(current);
  const result = await params.mutate(mutable);
  await saveBayesianState(params.userId, mutable);
  return { state: mutable, result };
}

export function clearBayesianStateMemory(userId?: string) {
  if (userId) {
    inMemoryState.delete(userId);
    return;
  }
  inMemoryState.clear();
}

export const BAYES_STATE_KEY = STATE_KEY;
