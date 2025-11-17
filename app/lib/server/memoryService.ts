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
