import prisma from "@/app/lib/prisma";
import { createExperiment, appendExperimentNote, summarizeExperiments } from "@/app/lib/server/experimentService";

async function getUserByHandle(handle: string) {
  try {
    const user = await prisma.user.findUnique({ where: { handle } });
    if (user) return user;
    const created = await prisma.user.create({ data: { handle } });
    return created;
  } catch (e) {
    // If DB is unavailable, return a pseudo user id derived from handle
    return { id: handle, handle } as any;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body?.action as string;
    const handle = body?.userHandle as string;
    if (!action || !handle) {
      return new Response(JSON.stringify({ error: "action and userHandle required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await getUserByHandle(handle);
    const userId = user.id as string;
    const threadId = body?.threadId as string | undefined;

    if (action === "create") {
      const rec = await createExperiment({
        userId,
        threadId: threadId || null,
        expId: body?.id,
        hypothesis: String(body?.hypothesis || ""),
        task: String(body?.task || ""),
        success_criteria: body?.success_criteria,
        timeout_s: body?.timeout_s,
        title: body?.title,
      });
      return new Response(JSON.stringify({ id: rec.id }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "note") {
      if (!body?.id) {
        return new Response(JSON.stringify({ error: "id required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const note = await appendExperimentNote({
        userId,
        threadId: threadId || null,
        id: String(body.id),
        observation: body?.observation,
        result: body?.result,
        score: typeof body?.score === "number" ? body.score : undefined,
      });
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "list") {
      const list = await summarizeExperiments({ userId, limit: Number(body?.limit ?? 5) });
      return new Response(JSON.stringify({ experiments: list }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Bad request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

