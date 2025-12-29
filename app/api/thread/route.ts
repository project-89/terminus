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
    const messages = await prisma.gameMessage.findMany({
      where: { gameSessionId: threadId },
      orderBy: { createdAt: "asc" },
    });
    
    return new Response(JSON.stringify({ 
      thread: {
        id: session.id,
        userId: session.userId,
        kind: "ADVENTURE",
        accessTier: 0,
      },
      messages: messages.map(m => ({
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

  try {
    let user = await prisma.user.findUnique({ where: { handle } });
    if (!user) {
      user = await prisma.user.create({ data: { handle } });
    }
    
    const session = await prisma.gameSession.create({
      data: { 
        userId: user.id, 
        status: "OPEN",
      },
    });
    
    return new Response(JSON.stringify({ threadId: session.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    let user = mem.users.get(handle);
    if (!user) {
      user = { id: uid(), handle };
      mem.users.set(handle, user);
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
    await prisma.gameMessage.createMany({
      data: messages.map((m: any) => ({
        gameSessionId: threadId,
        role: m.role,
        content: m.content,
      })),
    });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
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
