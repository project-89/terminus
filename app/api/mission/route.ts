import { getNextMission, acceptMission } from "@/app/lib/server/missionService";
import { getSessionById, getActiveSessionByHandle } from "@/app/lib/server/sessionService";

async function resolveSessionAndUser(params: {
  sessionId?: string | null;
  handle?: string | null;
  userId?: string | null;
}) {
  // Priority: sessionId > handle > userId
  if (params.sessionId) {
    const session = await getSessionById(params.sessionId);
    if (session) {
      return { sessionId: session.id, userId: session.userId };
    }
  }
  if (params.handle) {
    const session = await getActiveSessionByHandle(params.handle);
    if (session) {
      return { sessionId: session.id, userId: session.userId };
    }
  }
  // Fallback: use userId directly (no session context, but can still fetch missions)
  if (params.userId) {
    return { sessionId: undefined, userId: params.userId };
  }
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const resolved = await resolveSessionAndUser({
    sessionId: searchParams.get("sessionId"),
    handle: searchParams.get("handle"),
    userId: searchParams.get("userId"),
  });
  if (!resolved) {
    return new Response(JSON.stringify({ error: "Unable to resolve session" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const mission = await getNextMission(resolved.userId);
  console.log(`[API] Mission Result:`, mission);
  if (!mission) {
    return new Response(JSON.stringify({ message: "No missions available (Debug)" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ mission }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const resolved = await resolveSessionAndUser({
    sessionId: typeof body.sessionId === "string" ? body.sessionId : undefined,
    handle: typeof body.handle === "string" ? body.handle : undefined,
    userId: typeof body.userId === "string" ? body.userId : undefined,
  });
  if (!resolved) {
    return new Response(JSON.stringify({ error: "Unable to resolve session" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const missionId = typeof body.missionId === "string" ? body.missionId : undefined;
  let targetMissionId = missionId;
  if (!targetMissionId) {
    const mission = await getNextMission(resolved.userId);
    if (!mission) {
      return new Response(JSON.stringify({ error: "No missions available" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    targetMissionId = mission.id;
  }

  const run = await acceptMission({
    missionId: targetMissionId,
    userId: resolved.userId,
    sessionId: resolved.sessionId,
  });
  return new Response(JSON.stringify({ missionRun: run }), {
    headers: { "Content-Type": "application/json" },
  });
}
