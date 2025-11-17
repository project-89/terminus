import { submitMissionReport, getLatestOpenMissionRun } from "@/app/lib/server/missionService";
import { getSessionById, getActiveSessionByHandle } from "@/app/lib/server/sessionService";
import { recordMemoryEvent } from "@/app/lib/server/memoryService";

async function resolveSession(params: { sessionId?: string | null; handle?: string | null }) {
  if (params.sessionId) {
    const session = await getSessionById(params.sessionId);
    if (session) return session;
  }
  if (params.handle) {
    const session = await getActiveSessionByHandle(params.handle);
    if (session) return session;
  }
  return null;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const session = await resolveSession({
    sessionId: typeof body.sessionId === "string" ? body.sessionId : undefined,
    handle: typeof body.handle === "string" ? body.handle : undefined,
  });
  if (!session) {
    return new Response(JSON.stringify({ error: "Unable to resolve session" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const payload = typeof body.content === "string" && body.content.trim().length
    ? body.content.trim()
    : undefined;
  if (!payload) {
    return new Response(JSON.stringify({ error: "content required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let missionRunId = typeof body.missionRunId === "string" ? body.missionRunId : undefined;
  if (!missionRunId) {
    const latest = await getLatestOpenMissionRun(session.userId);
    if (!latest) {
      return new Response(JSON.stringify({ error: "No active mission" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    missionRunId = latest.id;
  }

  const result = await submitMissionReport({ missionRunId, payload });
  await recordMemoryEvent({
    userId: session.userId,
    sessionId: session.id,
    type: "REPORT",
    content: payload,
    tags: result.mission.tags,
  });
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
}
