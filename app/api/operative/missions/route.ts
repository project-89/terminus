import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTrustState } from "@/app/lib/server/trustService";

export async function POST(req: NextRequest) {
  try {
    const { userId, missionId, action, evidence } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ error: "userId and action required" }, { status: 400 });
    }

    const trustState = await getTrustState(userId);
    if (trustState.layer < 5) {
      return NextResponse.json({ error: "Insufficient clearance" }, { status: 403 });
    }

    if (action === "accept" && missionId) {
      const mission = await prisma.missionDefinition.findUnique({
        where: { id: missionId },
      });

      if (!mission) {
        return NextResponse.json({ error: "Mission not found" }, { status: 404 });
      }

      const existing = await prisma.missionRun.findFirst({
        where: {
          userId,
          missionId,
          status: { in: ["ACCEPTED", "SUBMITTED", "REVIEWING"] },
        },
      });

      if (existing) {
        return NextResponse.json({ error: "Mission already active" }, { status: 400 });
      }

      const run = await prisma.missionRun.create({
        data: {
          userId,
          missionId,
          status: "ACCEPTED",
        },
        include: {
          mission: {
            select: {
              title: true,
              type: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        mission: {
          id: run.id,
          title: run.mission?.title || "Unknown",
          type: run.mission?.type || "unknown",
          status: run.status,
          createdAt: run.createdAt.toISOString(),
        },
      });
    }

    if (action === "submit" && missionId && evidence) {
      const run = await prisma.missionRun.findFirst({
        where: {
          id: missionId,
          userId,
          status: "ACCEPTED",
        },
      });

      if (!run) {
        return NextResponse.json({ error: "No active mission found" }, { status: 404 });
      }

      await prisma.missionRun.update({
        where: { id: run.id },
        data: {
          status: "SUBMITTED",
          report: evidence,
          submittedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, status: "SUBMITTED" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[OPERATIVE MISSIONS]", error);
    return NextResponse.json({ error: "Failed to process mission" }, { status: 500 });
  }
}
