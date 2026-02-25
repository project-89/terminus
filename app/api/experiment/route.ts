import { NextResponse } from "next/server";
import {
  createExperiment,
  appendExperimentNote,
  resolveExperiment,
} from "@/app/lib/server/experimentService";
import {
  getSessionById,
  getActiveSessionByHandle,
} from "@/app/lib/server/sessionService";
import { computeTrustDelta, evolveTrust } from "@/app/lib/server/trustService";

type ResolveParams = {
  sessionId?: string | null;
  handle?: string | null;
};

async function resolveUserId({ sessionId, handle }: ResolveParams) {
  if (sessionId) {
    const session = await getSessionById(sessionId);
    if (session) {
      return { userId: session.userId, handle: session.handle };
    }
  }
  if (handle) {
    const session = await getActiveSessionByHandle(handle);
    if (session) {
      return { userId: session.userId, handle: session.handle };
    }
  }
  return null;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const action = body?.action === "note" ? "note" : body?.action === "resolve" ? "resolve" : "create";

  const resolution = await resolveUserId({
    sessionId: typeof body.sessionId === "string" ? body.sessionId : undefined,
    handle: typeof body.handle === "string" ? body.handle : undefined,
  });

  if (!resolution) {
    return NextResponse.json(
      { error: "Unable to resolve user" },
      { status: 400 }
    );
  }

  try {
    if (action === "note") {
      if (!body.id) {
        return NextResponse.json(
          { error: "Experiment id required" },
          { status: 400 }
        );
      }
      const note = await appendExperimentNote({
        userId: resolution.userId,
        threadId:
          typeof body.threadId === "string" ? body.threadId : undefined,
        id: body.id,
        observation:
          typeof body.observation === "string" ? body.observation : undefined,
        result: typeof body.result === "string" ? body.result : undefined,
        score:
          typeof body.score === "number" ? Math.max(0, Math.min(1, body.score)) : undefined,
      });
      return NextResponse.json({ note });
    }

    if (action === "resolve") {
      if (!body.id) {
        return NextResponse.json(
          { error: "Experiment id required" },
          { status: 400 }
        );
      }
      const outcome = body.outcome;
      const statusMap: Record<string, "RESOLVED_SUCCESS" | "RESOLVED_FAILURE" | "ABANDONED"> = {
        success: "RESOLVED_SUCCESS",
        failure: "RESOLVED_FAILURE",
        abandoned: "ABANDONED",
      };
      const status = statusMap[outcome] || "ABANDONED";

      // Accept both `score` and `final_score` (tool param name) for compatibility
      const finalScore = typeof body.final_score === "number" ? body.final_score :
                         typeof body.score === "number" ? body.score : undefined;
      const resolved = await resolveExperiment({
        userId: resolution.userId,
        experimentId: body.id,
        status,
        resolution: typeof body.resolution === "string" ? body.resolution : undefined,
        finalScore,
      });

      // Evolve trust based on experiment outcome
      try {
        const event = status === "RESOLVED_SUCCESS" ? "experiment_pass" as const : "experiment_fail" as const;
        const delta = await computeTrustDelta(resolution.userId, event, finalScore);
        await evolveTrust(resolution.userId, delta, `${event}: ${body.id}`);
      } catch (e) {
        console.error("[experiment] Trust evolution failed (non-blocking):", e);
      }

      return NextResponse.json({ experiment: resolved });
    }

    if (!body.hypothesis || !body.task) {
      return NextResponse.json(
        { error: "hypothesis and task are required" },
        { status: 400 }
      );
    }

    const experiment = await createExperiment({
      userId: resolution.userId,
      threadId:
        typeof body.threadId === "string" ? body.threadId : undefined,
      expId: typeof body.id === "string" ? body.id : undefined,
      hypothesis: body.hypothesis,
      task: body.task,
      success_criteria:
        typeof body.success_criteria === "string"
          ? body.success_criteria
          : undefined,
      timeout_s:
        typeof body.timeout_s === "number" ? Math.round(body.timeout_s) : undefined,
      title: typeof body.title === "string" ? body.title : undefined,
    });

    return NextResponse.json({ experiment });
  } catch (error) {
    console.error("Experiment API error:", error);
    return NextResponse.json(
      { error: "Failed to process experiment request" },
      { status: 500 }
    );
  }
}
