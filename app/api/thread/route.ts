import prisma from "@/app/lib/prisma";

/**
 * Thread API - now unified with GameSession
 * 
 * This provides backward compatibility for the client's threadId-based API
 * while actually storing data in GameSession/GameMessage tables.
 * 
 * The "threadId" is now actually a GameSession.id
 */

type MemUser = { id: string; handle: string };
type MemSession = {
  id: string;
  userId: string;
  status: string;
  accessTier: number;
};
type MemMessage = {
  sessionId: string;
  role: string;
  content: string;
  createdAt: number;
};

const mem = {
  users: new Map<string, MemUser>(),
  sessions: new Map<string, MemSession>(),
  messages: new Map<string, MemMessage[]>(),
};

function uid() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID)
      return crypto.randomUUID();
  } catch {}
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId");
  if (!threadId) {
    return new Response(JSON.stringify({ error: "threadId required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  try {
    const session = await prisma.gameSession.findUnique({ 
      where: { id: threadId },
      include: { user: true }
    });
    if (!session) {
      throw new Error("not found");
    }
    
    const isAnonymousUser = session.user?.handle === "anonymous" || !session.user?.agentId;
    
    if (isAnonymousUser) {
      return new Response(JSON.stringify({ 
        resetRequired: true,
        reason: "Session linked to anonymous user. Please reset to get proper tracking.",
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const messages = await prisma.gameMessage.findMany({
      where: { gameSessionId: threadId },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    
    return new Response(JSON.stringify({ 
      thread: {
        id: session.id,
        userId: session.userId,
        kind: "ADVENTURE",
        accessTier: 0,
      },
      messages: messages.map((m: any) => ({
        id: m.id,
        threadId: m.gameSessionId,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      }))
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    const session = mem.sessions.get(threadId);
    if (!session) {
      return new Response(JSON.stringify({ error: "not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const messages = mem.messages.get(threadId) || [];
    return new Response(JSON.stringify({ 
      thread: session,
      messages 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const handle = (body?.handle as string) || "anonymous";
  const providedUserId = body?.userId as string | undefined;

  try {
    let user;
    
    if (providedUserId) {
      user = await prisma.user.findUnique({ where: { id: providedUserId } });
      if (user) {
        console.log(`[Thread API] Found user by userId: ${user.id}, handle: ${user.handle}`);
      }
    }
    
    if (!user && handle && handle !== "anonymous") {
      user = await prisma.user.findUnique({ where: { handle } });
      if (user) {
        console.log(`[Thread API] Found user by handle: ${handle}, userId: ${user.id}`);
      }
    }
    
    if (!user) {
      const { createAnonymousAgent } = await import("@/app/lib/server/identityService");
      const identity = await createAnonymousAgent();
      user = await prisma.user.findUnique({ where: { id: identity.id } });
      console.log(`[Thread API] Created new agent: ${identity.agentId}, userId: ${identity.id}`);
    }
    
    if (!user) {
      throw new Error("Failed to find or create user");
    }
    
    const session = await prisma.gameSession.create({
      data: { 
        userId: user.id, 
        status: "OPEN",
      },
    });
    
    console.log(`[Thread API] Created session ${session.id} for user ${user.id} (${user.handle})`);
    
    return new Response(JSON.stringify({ threadId: session.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[Thread API] DB error, falling back to memory:", e);
    let user = mem.users.get(providedUserId || handle);
    if (!user) {
      user = { id: providedUserId || uid(), handle };
      mem.users.set(user.id, user);
    }
    const sessionId = uid();
    const session: MemSession = {
      id: sessionId,
      userId: user.id,
      status: "OPEN",
      accessTier: 0,
    };
    mem.sessions.set(sessionId, session);
    mem.messages.set(sessionId, []);
    return new Response(JSON.stringify({ threadId: sessionId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PATCH(req: Request) {
  const { threadId, messages } = await req.json();
  if (!threadId || !Array.isArray(messages)) {
    return new Response(
      JSON.stringify({ error: "threadId and messages required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  
  try {
    const currentMax = await prisma.gameMessage.aggregate({
      where: { gameSessionId: threadId },
      _max: { order: true },
    });
    const startOrder = (currentMax._max.order ?? -1) + 1;
    
    const validMessages = messages.filter((m: any) => m.content && m.content.trim());
    
    if (validMessages.length === 0) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    await prisma.gameMessage.createMany({
      data: validMessages.map((m: any, idx: number) => ({
        gameSessionId: threadId,
        role: m.role,
        content: m.content,
        order: startOrder + idx,
      })),
    });
    
    console.log(`[Thread PATCH] Saved ${validMessages.length} messages to session ${threadId}, starting at order ${startOrder}`);
    
    return new Response(JSON.stringify({ ok: true, saved: validMessages.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[Thread PATCH] Error:", e);
    const existing = mem.messages.get(threadId) || [];
    const now = Date.now();
    for (const m of messages) {
      existing.push({
        sessionId: threadId,
        role: m.role,
        content: m.content,
        createdAt: now,
      });
    }
    mem.messages.set(threadId, existing);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
