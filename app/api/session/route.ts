import { resetSession, getActiveSessionByHandle, getSessionById, closeSession, appendMessage } from "@/app/lib/server/sessionService";
import prisma from "@/app/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const handle = typeof body.handle === "string" ? body.handle.trim() : undefined;
  const userId = typeof body.userId === "string" ? body.userId.trim() : undefined;

  // Three cases:
  // 1. reset === true: Always create new session (closing existing ones)
  // 2. reset === false: Only return existing session, 404 if none
  // 3. reset === undefined: Try existing, create new if none (preserves session continuity)
  const reset = body.reset;

  if (reset === true) {
    const session = await resetSession(handle, userId);
    return new Response(
      JSON.stringify({
        sessionId: session.id,
        userId: session.userId,
        handle: session.handle,
        createdAt: session.createdAt,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // Try to find existing active session
  const session = await getActiveSessionByHandle(handle, userId);

  if (!session) {
    // If reset is explicitly false, return 404
    if (reset === false) {
      return new Response(JSON.stringify({ error: "No active session" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    // If reset is undefined, create a new session
    const newSession = await resetSession(handle, userId);
    return new Response(
      JSON.stringify({
        sessionId: newSession.id,
        userId: newSession.userId,
        handle: newSession.handle,
        createdAt: newSession.createdAt,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      sessionId: session.id,
      userId: session.userId,
      handle: session.handle,
      createdAt: session.createdAt,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) {
    return new Response(JSON.stringify({ error: "sessionId required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const session = await getSessionById(sessionId);
  if (!session) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(
    JSON.stringify({
      sessionId: session.id,
      userId: session.userId,
      handle: session.handle,
      status: session.status,
      summary: session.summary,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : undefined;
  if (!sessionId) {
    return new Response(JSON.stringify({ error: "sessionId required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  await closeSession(sessionId, body.summary);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => ({}));
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : undefined;
  const messages = Array.isArray(body.messages) ? body.messages : [];

  if (!sessionId) {
    return new Response(JSON.stringify({ error: "sessionId required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (messages.length === 0) {
    return new Response(JSON.stringify({ ok: true, synced: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = await getSessionById(sessionId);
  if (!session) {
    return new Response(JSON.stringify({ error: "Session not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const existingCount = await prisma.gameMessage.count({
      where: { gameSessionId: sessionId },
    });

    const newMessages = messages.slice(existingCount);

    if (newMessages.length > 0) {
      await prisma.gameMessage.createMany({
        data: newMessages.map((msg: { role: string; content: string }) => ({
          gameSessionId: sessionId,
          role: msg.role,
          content: msg.content,
        })),
        skipDuplicates: true,
      });

      // Update session's updatedAt for accurate engagement tracking
      await prisma.gameSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
      });
    }

    return new Response(
      JSON.stringify({ ok: true, synced: newMessages.length, total: messages.length }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[session/PUT] Failed to sync messages:", error);
    return new Response(
      JSON.stringify({ error: "Failed to sync messages", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
