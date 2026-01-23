import { NextResponse } from "next/server";
import {
  getSessionById,
  getActiveSessionByHandle,
} from "@/app/lib/server/sessionService";
import { getAgentCampaignStatus } from "@/app/lib/server/campaignService";

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
 * GET /api/campaign/[id]
 * Get the user's status in a specific campaign
 * Query params: sessionId, handle, or userId
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params;
  const { searchParams } = new URL(request.url);

  const user = await resolveUser({
    sessionId: searchParams.get("sessionId"),
    handle: searchParams.get("handle"),
    userId: searchParams.get("userId"),
  });

  if (!user) {
    return NextResponse.json(
      { error: "Unable to resolve user. Provide sessionId, handle, or userId." },
      { status: 400 }
    );
  }

  try {
    const status = await getAgentCampaignStatus(campaignId, user.userId);

    // Transform to agent-friendly view (hide internal details)
    return NextResponse.json({
      campaign: {
        id: status.campaign.id,
        name: status.campaign.name,
        codename: status.campaign.codename,
        description: status.campaign.description,
        status: status.campaign.status,
        deadline: status.campaign.deadline,
      },
      participation: status.participation
        ? {
            role: status.participation.role,
            status: status.participation.status,
            joinedAt: status.participation.createdAt,
          }
        : null,
      myContributions: status.myContributions.map((c: any) => ({
        id: c.id,
        objectiveId: c.objectiveId,
        objectiveTitle: c.objective?.title,
        status: c.status,
        score: c.score,
        feedback: c.feedback,
        pointsAwarded: c.pointsAwarded,
        submittedAt: c.createdAt,
      })),
      availableObjectives: status.availableObjectives.map((o: any) => ({
        id: o.id,
        title: o.title,
        type: o.type,
        points: o.points,
      })),
      revelations: status.participation?.knownInfo
        ? (status.participation.knownInfo as any).revelations || []
        : [],
    });
  } catch (error: any) {
    console.error("Campaign status error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch campaign status" },
      { status: 500 }
    );
  }
}
