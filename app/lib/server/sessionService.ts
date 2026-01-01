import prisma from "@/app/lib/prisma";
import { memoryStore, uid, touch, MemoryGameSession, MemoryMessage, MemoryUser } from "./memoryStore";

export type SessionRecord = {
  id: string;
  userId: string;
  handle: string;
  createdAt: Date;
  updatedAt: Date;
  status: "OPEN" | "CLOSED";
  summary?: string | null;
};

async function ensureUser(handle: string = "anonymous"): Promise<{ id: string; handle: string }> {
  try {
    const existing = handle
      ? await prisma.user.findUnique({ where: { handle } })
      : null;
    if (existing) {
      return { id: existing.id, handle: existing.handle || handle };
    }
    const created = await prisma.user.create({ data: { handle } });
    return { id: created.id, handle: created.handle || handle };
  } catch (error) {
    console.error("[sessionService] Database error in ensureUser, falling back to memory:", error);
    let memUser = memoryStore.users.get(handle);
    if (!memUser) {
      memUser = { id: uid(), handle } satisfies MemoryUser;
      memoryStore.users.set(handle, memUser);
      memoryStore.usersById.set(memUser.id, memUser);
    }
    return { id: memUser.id, handle: memUser.handle };
  }
}

async function closeOpenSessions(userId: string) {
  try {
    const sessions = (await prisma.gameSession.findMany({
      where: { userId, status: "OPEN" },
    })) as Array<{ id: string }>;
    await Promise.all(
      sessions.map((session) =>
        prisma.gameSession.update({
          where: { id: session.id },
          data: { status: "CLOSED" },
        })
      )
    );
  } catch {
    const existing = memoryStore.sessionsByUser.get(userId) || [];
    existing.forEach((session) => {
      if (session.status === "OPEN") {
        session.status = "CLOSED";
        session.updatedAt = new Date();
      }
    });
    memoryStore.sessionsByUser.set(userId, existing);
  }
}

export async function resetSession(handle?: string): Promise<SessionRecord> {
  const { id: userId, handle: resolvedHandle } = await ensureUser(handle);
  await closeOpenSessions(userId);
  try {
    const session = await prisma.gameSession.create({
      data: {
        userId,
        status: "OPEN",
      },
    });
    return {
      id: session.id,
      userId,
      handle: resolvedHandle,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      status: session.status as "OPEN" | "CLOSED",
      summary: session.summary,
    };
  } catch {
    const now = new Date();
    const session: MemoryGameSession = {
      id: uid(),
      userId,
      createdAt: now,
      updatedAt: now,
      status: "OPEN",
    };
    memoryStore.sessions.set(session.id, session);
    const list = memoryStore.sessionsByUser.get(userId) || [];
    list.push(session);
    memoryStore.sessionsByUser.set(userId, list);
    return {
      id: session.id,
      userId,
      handle: resolvedHandle,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      status: session.status,
    };
  }
}

export async function getActiveSessionByHandle(handle?: string): Promise<SessionRecord | null> {
  if (!handle) return null;
  const { id: userId, handle: resolvedHandle } = await ensureUser(handle);
  try {
    const session = await prisma.gameSession.findFirst({
      where: { userId, status: "OPEN" },
      orderBy: { createdAt: "desc" },
    });
    if (!session) return null;
    return {
      id: session.id,
      userId,
      handle: resolvedHandle,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      status: session.status as "OPEN" | "CLOSED",
      summary: session.summary,
    };
  } catch {
    const sessions = memoryStore.sessionsByUser.get(userId) || [];
    const session = [...sessions].reverse().find((s) => s.status === "OPEN");
    if (!session) return null;
    return {
      id: session.id,
      userId,
      handle: resolvedHandle,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      status: session.status,
      summary: session.summary,
    };
  }
}

export async function getSessionById(sessionId: string): Promise<SessionRecord | null> {
  try {
    const session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
    if (!session) return null;
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    return {
      id: session.id,
      userId: session.userId,
      handle: user?.handle || "anonymous",
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      status: session.status as "OPEN" | "CLOSED",
      summary: session.summary,
    };
  } catch {
    const session = memoryStore.sessions.get(sessionId);
    if (!session) return null;
    const user = memoryStore.usersById.get(session.userId);
    return {
      id: session.id,
      userId: session.userId,
      handle: user?.handle || "anonymous",
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      status: session.status,
      summary: session.summary,
    };
  }
}

export async function appendMessage(params: {
  sessionId: string;
  role: string;
  content: string;
}): Promise<void> {
  const { sessionId, role, content } = params;
  try {
    await prisma.gameMessage.create({
      data: {
        gameSessionId: sessionId,
        role,
        content,
      },
    });
  } catch {
    const message: MemoryMessage = {
      id: uid(),
      sessionId,
      role,
      content,
      createdAt: new Date(),
    };
    const messages = touch(memoryStore.messages, sessionId);
    messages.push(message);
    memoryStore.messages.set(sessionId, messages);
  }
}

export async function closeSession(sessionId: string, summary?: string) {
  try {
    await prisma.gameSession.update({
      where: { id: sessionId },
      data: { status: "CLOSED", summary },
    });
  } catch {
    const session = memoryStore.sessions.get(sessionId);
    if (session) {
      session.status = "CLOSED";
      session.summary = summary;
      session.updatedAt = new Date();
      memoryStore.sessions.set(sessionId, session);
    }
  }
}

export type SessionContext = {
  sessionCount: number;
  totalEngagementMinutes: number;
  daysSinceFirstSession: number;
  daysSinceLastSession: number;
  lastSessionTime?: Date;
  firstSessionTime?: Date;
};

export async function getSessionContext(userId: string): Promise<SessionContext> {
  const now = new Date();
  const defaultCtx: SessionContext = {
    sessionCount: 1,
    totalEngagementMinutes: 0,
    daysSinceFirstSession: 0,
    daysSinceLastSession: 0,
  };

  try {
    const sessions = await prisma.gameSession.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, createdAt: true, updatedAt: true },
    });

    if (sessions.length === 0) return defaultCtx;

    const firstSession = sessions[0];
    const lastSession = sessions[sessions.length - 1];
    const previousSession = sessions.length > 1 ? sessions[sessions.length - 2] : null;

    const daysSinceFirst = Math.floor(
      (now.getTime() - firstSession.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const daysSinceLast = previousSession
      ? Math.floor(
          (now.getTime() - previousSession.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    let totalMinutes = 0;
    for (const s of sessions) {
      const duration = s.updatedAt.getTime() - s.createdAt.getTime();
      totalMinutes += Math.floor(duration / (1000 * 60));
    }

    return {
      sessionCount: sessions.length,
      totalEngagementMinutes: totalMinutes,
      daysSinceFirstSession: daysSinceFirst,
      daysSinceLastSession: daysSinceLast,
      lastSessionTime: previousSession?.updatedAt,
      firstSessionTime: firstSession.createdAt,
    };
  } catch {
    const sessions = memoryStore.sessionsByUser.get(userId) || [];
    if (sessions.length === 0) return defaultCtx;

    const sorted = [...sessions].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const firstSession = sorted[0];
    const lastSession = sorted[sorted.length - 1];
    const previousSession = sorted.length > 1 ? sorted[sorted.length - 2] : null;

    const daysSinceFirst = Math.floor(
      (now.getTime() - firstSession.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const daysSinceLast = previousSession
      ? Math.floor(
          (now.getTime() - previousSession.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    let totalMinutes = 0;
    for (const s of sorted) {
      const duration = s.updatedAt.getTime() - s.createdAt.getTime();
      totalMinutes += Math.floor(duration / (1000 * 60));
    }

    return {
      sessionCount: sorted.length,
      totalEngagementMinutes: totalMinutes,
      daysSinceFirstSession: daysSinceFirst,
      daysSinceLastSession: daysSinceLast,
      lastSessionTime: previousSession?.updatedAt,
      firstSessionTime: firstSession.createdAt,
    };
  }
}
