import { NextResponse } from "next/server";
import {
  getSessionById,
  getActiveSessionByHandle,
} from "@/app/lib/server/sessionService";
import {
  getAvailableObjectivesForAgent,
  submitContribution,
  getAgentBriefing,
} from "@/app/lib/server/campaignService";

export const dynamic = "force-dynamic";

type ResolveParams = {
  sessionId?: string | null;
  handle?: string | null;
  userId?: string | null;
};

async function resolveUser({ sessionId, handle, userId }: ResolveParams) {
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
  if (userId) {
    return { userId, handle: null };
  }
  return null;
}

/**
 * GET /api/campaign
 * Get available campaign objectives for the user
 * Query params: sessionId, handle, or userId
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const handle = searchParams.get("handle");
  const userId = searchParams.get("userId");

  const user = await resolveUser({ sessionId, handle, userId });
  if (!user) {
    return NextResponse.json(
      { error: "Unable to resolve user. Provide sessionId, handle, or userId." },
      { status: 400 }
    );
  }

  try {
    const objectives = await getAvailableObjectivesForAgent(user.userId);

    // Transform objectives with personalized briefings
    const transformed = objectives.map((obj) => {
      const briefing = getAgentBriefing(obj, user.userId);

      return {
        id: obj.id,
        title: obj.title,
        description: obj.description,
        briefing: briefing.briefing,
        type: obj.type,
        status: obj.status,
        points: obj.points,
        pieceId: briefing.pieceId,
        customData: briefing.customData,
        campaign: {
          id: obj.phase.campaign.id,
          name: obj.phase.campaign.name,
          codename: obj.phase.campaign.codename,
        },
        phase: {
          id: obj.phase.id,
          name: obj.phase.name,
        },
      };
    });

    return NextResponse.json({
      objectives: transformed,
      count: transformed.length,
    });
  } catch (error: any) {
    console.error("Campaign available error:", error);
    return NextResponse.json(
      { error: "Failed to fetch available objectives" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/campaign
 * Submit a contribution to a campaign objective
 * Body: { sessionId, handle, userId, objectiveId, content, evidence?, pieceId? }
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const user = await resolveUser({
    sessionId: body.sessionId,
    handle: body.handle,
    userId: body.userId,
  });

  if (!user) {
    return NextResponse.json(
      { error: "Unable to resolve user. Provide sessionId, handle, or userId." },
      { status: 400 }
    );
  }

  const { objectiveId, content, evidence, pieceId } = body;

  if (!objectiveId || !content) {
    return NextResponse.json(
      { error: "objectiveId and content are required" },
      { status: 400 }
    );
  }

  try {
    const contribution = await submitContribution({
      objectiveId,
      userId: user.userId,
      content,
      evidence,
      pieceId,
    });

    return NextResponse.json({
      success: true,
      contribution: {
        id: contribution.id,
        status: contribution.status,
        pieceId: contribution.pieceId,
        createdAt: contribution.createdAt,
      },
      message: "Contribution submitted successfully. It will be reviewed.",
    });
  } catch (error: any) {
    console.error("Campaign contribute error:", error);

    // Check for duplicate contribution error
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "You have already submitted a contribution for this objective" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to submit contribution" },
      { status: 500 }
    );
  }
}
