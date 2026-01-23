import { NextResponse } from "next/server";
import { validateAdminAuth } from "@/app/lib/server/adminAuth";
import {
  addObjective,
  setAgentView,
  assignObjective,
  updateObjectiveStatus,
  evaluateContribution,
  aggregateContributions,
  triggerRevelation,
} from "@/app/lib/server/campaignService";
import prisma from "@/app/lib/prisma";
import { ObjectiveType } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/campaigns/[id]/objectives
 * List all objectives for a campaign (across all phases)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  const { id: campaignId } = await params;
  const { searchParams } = new URL(request.url);
  const phaseId = searchParams.get("phaseId");
  const status = searchParams.get("status");

  try {
    const objectives = await prisma.objective.findMany({
      where: {
        phase: { campaignId },
        ...(phaseId && { phaseId }),
        ...(status && { status }),
      },
      include: {
        phase: {
          select: { id: true, name: true, order: true },
        },
        contributions: {
          include: {
            user: {
              select: { id: true, handle: true, profile: { select: { codename: true } } },
            },
          },
        },
      },
      orderBy: [
        { phase: { order: "asc" } },
        { createdAt: "asc" },
      ],
    });

    return NextResponse.json({ objectives });
  } catch (error: any) {
    console.error("Admin objectives list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch objectives" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/campaigns/[id]/objectives
 * Add a new objective to a phase
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  await params; // Consume params (campaign ID verified via phaseId)

  try {
    const body = await request.json();
    const {
      phaseId,
      title,
      description,
      briefing,
      hiddenContext,
      type,
      targetContributions,
      dependsOn,
      eligibleTags,
      minTrust,
      points,
    } = body;

    if (!phaseId || !title || !description || !briefing) {
      return NextResponse.json(
        { error: "phaseId, title, description, and briefing are required" },
        { status: 400 }
      );
    }

    // Validate type if provided
    const validTypes: ObjectiveType[] = ["INDEPENDENT", "COLLABORATIVE", "COMPETITIVE", "SEQUENTIAL"];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const objective = await addObjective({
      phaseId,
      title,
      description,
      briefing,
      hiddenContext,
      type,
      targetContributions,
      dependsOn,
      eligibleTags,
      minTrust,
      points,
    });

    return NextResponse.json({ success: true, objective });
  } catch (error: any) {
    console.error("Admin objective create error:", error);
    return NextResponse.json(
      { error: "Failed to create objective" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/campaigns/[id]/objectives
 * Update an objective (status, assignments, agent views, evaluate contributions)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  await params; // Consume params

  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "update_status": {
        const { objectiveId, status } = data;
        if (!objectiveId || !status) {
          return NextResponse.json(
            { error: "objectiveId and status are required" },
            { status: 400 }
          );
        }
        const objective = await updateObjectiveStatus(objectiveId, status);
        return NextResponse.json({ success: true, objective });
      }

      case "assign": {
        const { objectiveId, agentIds, customBriefings } = data;
        if (!objectiveId || !agentIds || !Array.isArray(agentIds)) {
          return NextResponse.json(
            { error: "objectiveId and agentIds array are required" },
            { status: 400 }
          );
        }
        const objective = await assignObjective(objectiveId, agentIds, customBriefings);
        return NextResponse.json({ success: true, objective });
      }

      case "set_agent_view": {
        const { objectiveId, agentId, briefing, pieceId, customData } = data;
        if (!objectiveId || !agentId) {
          return NextResponse.json(
            { error: "objectiveId and agentId are required" },
            { status: 400 }
          );
        }
        const objective = await setAgentView({
          objectiveId,
          agentId,
          briefing,
          pieceId,
          customData,
        });
        return NextResponse.json({ success: true, objective });
      }

      case "evaluate_contribution": {
        const { contributionId, status, score, feedback, pieceContext, pointsAwarded } = data;
        if (!contributionId || !status) {
          return NextResponse.json(
            { error: "contributionId and status are required" },
            { status: 400 }
          );
        }
        const contribution = await evaluateContribution({
          contributionId,
          status,
          score,
          feedback,
          pieceContext,
          pointsAwarded,
        });
        return NextResponse.json({ success: true, contribution });
      }

      case "aggregate": {
        const { objectiveId } = data;
        if (!objectiveId) {
          return NextResponse.json(
            { error: "objectiveId is required" },
            { status: 400 }
          );
        }
        const aggregation = await aggregateContributions(objectiveId);
        return NextResponse.json({ success: true, ...aggregation });
      }

      case "trigger_revelation": {
        const { objectiveId } = data;
        if (!objectiveId) {
          return NextResponse.json(
            { error: "objectiveId is required" },
            { status: 400 }
          );
        }
        await triggerRevelation(objectiveId);
        return NextResponse.json({ success: true, message: "Revelation triggered" });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Must be one of: update_status, assign, set_agent_view, evaluate_contribution, aggregate, trigger_revelation" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Admin objective update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update objective" },
      { status: 500 }
    );
  }
}
