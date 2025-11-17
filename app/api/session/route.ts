import { resetSession, getActiveSessionByHandle, getSessionById, closeSession } from "@/app/lib/server/sessionService";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const handle = typeof body.handle === "string" ? body.handle.trim() : undefined;
  const reset = body.reset !== false;

  if (reset) {
    const session = await resetSession(handle);
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

  const session = await getActiveSessionByHandle(handle);
  if (!session) {
    return new Response(JSON.stringify({ error: "No active session" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
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
