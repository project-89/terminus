import prisma from "@/app/lib/prisma";

// In-memory fallback store when Prisma/database is unavailable
type MemUser = { id: string; handle: string };
type MemThread = {
  id: string;
  userId: string;
  kind: string;
  accessTier: number;
};
type MemMessage = {
  threadId: string;
  role: string;
  content: string;
  createdAt: number;
};

const mem = {
  users: new Map<string, MemUser>(), // key: handle
  threads: new Map<string, MemThread>(), // key: id
  messages: new Map<string, MemMessage[]>(), // key: threadId
};

function uid() {
  try {
    // @ts-ignore
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
    const thread = await prisma.thread.findUnique({ where: { id: threadId } });
    if (!thread) {
      throw new Error("not found");
    }
    const messages = await prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" },
    });
    return new Response(JSON.stringify({ thread, messages }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Fallback to memory store
    const thread = mem.threads.get(threadId);
    if (!thread) {
      return new Response(JSON.stringify({ error: "not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const messages = mem.messages.get(threadId) || [];
    return new Response(JSON.stringify({ thread, messages }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const handle = (body?.handle as string) || "anonymous";

  // Ensure a user exists
  try {
    let user = await prisma.user.findUnique({ where: { handle } });
    if (!user) {
      user = await prisma.user.create({ data: { handle } });
    }
    const thread = await prisma.thread.create({
      data: { userId: user.id, kind: "ADVENTURE", accessTier: 0 },
    });
    return new Response(JSON.stringify({ threadId: thread.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    // Fallback to memory store
    let user = mem.users.get(handle);
    if (!user) {
      user = { id: uid(), handle };
      mem.users.set(handle, user);
    }
    const threadId = uid();
    const thread: MemThread = {
      id: threadId,
      userId: user.id,
      kind: "ADVENTURE",
      accessTier: 0,
    };
    mem.threads.set(threadId, thread);
    mem.messages.set(threadId, []);
    return new Response(JSON.stringify({ threadId }), {
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
    await prisma.message.createMany({
      data: messages.map((m: any) => ({
        threadId,
        role: m.role,
        content: m.content,
      })),
    });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Fallback to memory store
    const existing = mem.messages.get(threadId) || [];
    const now = Date.now();
    for (const m of messages) {
      existing.push({
        threadId,
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
