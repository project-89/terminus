import prisma from "@/app/lib/prisma";
import { memoryStore, uid, touch, MemoryMessage } from "./memoryStore";
import { appendMessage } from "./sessionService";

export async function recordMemoryEvent(params: {
  userId: string;
  sessionId?: string;
  type: "OBSERVATION" | "REFLECTION" | "MISSION" | "REPORT" | "SYSTEM" | "TOOL";
  content: string;
  tags?: string[];
  asMessage?: { role: string };
}) {
  const { userId, sessionId, type, content, tags = [], asMessage } = params;
  try {
    await prisma.memoryEvent.create({
      data: {
        userId,
        sessionId,
        type,
        content,
        tags,
      },
    });
  } catch {
    const eventId = uid();
    memoryStore.memoryEvents.set(eventId, {
      id: eventId,
      userId,
      sessionId,
      type,
      content,
      tags,
      createdAt: new Date(),
    });
  }

  if (sessionId && asMessage) {
    await appendMessage({ sessionId, role: asMessage.role, content });
  }
}

export async function getRecentMemoryEvents(params: {
  userId: string;
  limit?: number;
}): Promise<Array<{ type: string; content: string; tags?: string[] }>> {
  const limit = params.limit ?? 5;
  try {
    const rows = await prisma.memoryEvent.findMany({
      where: { userId: params.userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map((r: any) => ({
      type: r.type,
      content: r.content,
      tags: Array.isArray(r.tags) ? r.tags : [],
    }));
  } catch {
    const events = Array.from(memoryStore.memoryEvents.values()).filter(
      (e: any) => e.userId === params.userId
    );
    return events
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )
      .slice(0, limit)
      .map((e: any) => ({
        type: e.type,
        content: e.content,
        tags: Array.isArray(e.tags) ? e.tags : [],
      }));
  }
}

export async function recordSystemMessage(sessionId: string, content: string) {
  try {
    await appendMessage({ sessionId, role: "system", content });
  } catch {
    const message: MemoryMessage = {
      id: uid(),
      sessionId,
      role: "system",
      content,
      createdAt: new Date(),
    };
    const messages = touch(memoryStore.messages, sessionId);
    messages.push(message);
  }
}
