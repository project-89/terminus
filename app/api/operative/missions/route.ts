import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTrustState } from "@/app/lib/server/trustService";
import { isMissionVisibleToUser } from "@/app/lib/server/missionVisibility";

export async function POST(req: NextRequest) {
  try {
    const { userId, missionId, action, evidence } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ error: "userId and action required" }, { status: 400 });
    }

    const trustState = await getTrustState(userId);

    // Check if user has dashboard access (layer 5+ OR admin-enabled)
    const profile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: { dashboardEnabled: true },
    });

    const hasAccess = trustState.layer >= 5 || profile?.dashboardEnabled === true;
    if (!hasAccess) {
      return NextResponse.json({ error: "Insufficient clearance" }, { status: 403 });
    }

    if (action === "accept" && missionId) {
      const mission = await prisma.missionDefinition.findUnique({
        where: { id: missionId },
        select: {
          id: true,
          title: true,
          type: true,
          tags: true,
        },
      });

      if (!mission) {
        return NextResponse.json({ error: "Mission not found" }, { status: 404 });
      }
      if (!isMissionVisibleToUser(mission.tags, userId)) {
        return NextResponse.json({ error: "Mission not available for this agent" }, { status: 403 });
      }

      // Use acceptMission which enforces single active mission rule
      const { acceptMission } = await import("@/app/lib/server/missionService");
      try {
        const result = await acceptMission({
          missionId,
          userId,
        });

        return NextResponse.json({
          success: true,
          mission: {
            id: result.id,
            title: result.mission.title,
            type: result.mission.type,
            status: result.status,
            createdAt: new Date().toISOString(),
          },
        });
      } catch (e: any) {
        // Handle "already have active mission" error gracefully
        if (e.message?.includes("active mission")) {
          return NextResponse.json({ error: e.message }, { status: 400 });
        }
        throw e;
      }
    }

    if (action === "submit" && missionId && evidence) {
      const run = await prisma.missionRun.findFirst({
        where: {
          id: missionId,
          userId,
          status: "ACCEPTED",
        },
        include: { mission: true },
      });

      if (!run) {
        return NextResponse.json({ error: "No active mission found" }, { status: 404 });
      }

      // Use the proper missionService for evaluation instead of just marking submitted
      const { submitMissionReport } = await import("@/app/lib/server/missionService");
      const result = await submitMissionReport({
        missionRunId: run.id,
        payload: evidence,
      });

      return NextResponse.json({
        success: true,
        status: result.status,
        score: result.score,
        feedback: result.feedback,
        reward: result.reward,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[OPERATIVE MISSIONS]", error);
    return NextResponse.json({ error: "Failed to process mission" }, { status: 500 });
  }
}
