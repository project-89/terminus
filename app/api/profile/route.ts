import { getProfile, upsertProfile } from "@/app/lib/server/profileService";
import { getSessionById, getActiveSessionByHandle } from "@/app/lib/server/sessionService";

async function resolveUserId(params: { sessionId?: string | null; handle?: string | null }) {
  const { sessionId, handle } = params;
  if (sessionId) {
    const session = await getSessionById(sessionId);
    if (session) return session.userId;
  }
  if (handle) {
    const session = await getActiveSessionByHandle(handle);
    if (session) return session.userId;
  }
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = await resolveUserId({
    sessionId: searchParams.get("sessionId"),
    handle: searchParams.get("handle"),
  });
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unable to resolve user" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const profile = await getProfile(userId);
  return new Response(JSON.stringify(profile), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const userId = await resolveUserId({
    sessionId: typeof body.sessionId === "string" ? body.sessionId : undefined,
    handle: typeof body.handle === "string" ? body.handle : undefined,
  });
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unable to resolve user" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const profile = await upsertProfile(userId, {
    traits: body.traits,
    skills: body.skills,
    preferences: body.preferences,
  });
  return new Response(JSON.stringify(profile), {
    headers: { "Content-Type": "application/json" },
  });
}
