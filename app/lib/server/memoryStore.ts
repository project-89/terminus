export type MemoryUser = {
  id: string;
  handle: string;
  consentedAt?: Date | null;
};

export type MemoryGameSession = {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  status: "OPEN" | "CLOSED";
  summary?: string | null;
};

export type MemoryMessage = {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  createdAt: Date;
};

export type MemoryProfile = {
  traits?: Record<string, any>;
  skills?: Record<string, any>;
  preferences?: Record<string, any>;
};

export type MemoryMissionDefinition = {
  id: string;
  title: string;
  prompt: string;
  type: string;
  minEvidence: number;
  tags: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MemoryMissionRun = {
  id: string;
  missionId: string;
  userId: string;
  sessionId?: string;
  status: "PENDING" | "ACCEPTED" | "SUBMITTED" | "REVIEWING" | "COMPLETED" | "FAILED";
  score?: number;
  feedback?: string;
  payload?: any;
  createdAt: Date;
  updatedAt: Date;
};

export type MemoryReward = {
  id: string;
  userId: string;
  missionRunId?: string;
  type: "CREDIT" | "TOKEN" | "BADGE";
  amount: number;
  metadata?: any;
  createdAt: Date;
};

const initialStore = {
  users: new Map<string, MemoryUser>(), // key: handle
  usersById: new Map<string, MemoryUser>(),
  sessions: new Map<string, MemoryGameSession>(),
  sessionsByUser: new Map<string, MemoryGameSession[]>(),
  messages: new Map<string, MemoryMessage[]>(),
  memoryEvents: new Map<string, any>(),
  profiles: new Map<string, MemoryProfile>(),
  missions: new Map<string, MemoryMissionDefinition>(),
  missionRuns: new Map<string, MemoryMissionRun>(),
  missionRunsByUser: new Map<string, MemoryMissionRun[]>(),
  rewards: new Map<string, MemoryReward>(),
  rewardsByUser: new Map<string, MemoryReward[]>(),
};

// Global singleton pattern for development (preserves memory across hot reloads)
const globalForMemory = globalThis as unknown as {
  project89MemoryStore: typeof initialStore | undefined;
};

if (!globalForMemory.project89MemoryStore) {
  globalForMemory.project89MemoryStore = initialStore;
}

export const memoryStore = globalForMemory.project89MemoryStore!;

export function uid(): string {
  try {
    const cryptoObj = globalThis.crypto as Crypto | undefined;
    if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
      return cryptoObj.randomUUID();
    }
  } catch {}
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function touch<T>(map: Map<string, T[]>, key: string): T[] {
  if (!map.has(key)) {
    map.set(key, []);
  }
  return map.get(key)!;
}