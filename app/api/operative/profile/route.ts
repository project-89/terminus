import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTrustState } from "@/app/lib/server/trustService";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        agentId: true,
        handle: true,
        identityLocked: true,
        referralCode: true,
        createdAt: true,
        referrals: {
          select: {
            agentId: true,
            createdAt: true,
            profile: {
              select: {
                layer: true,
                lastActiveAt: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const trustState = await getTrustState(userId);

    if (trustState.layer < 5) {
      return NextResponse.json({ 
        error: "Insufficient clearance", 
        layer: trustState.layer,
        required: 5 
      }, { status: 403 });
    }

    const profile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: {
        lastActiveAt: true,
      },
    });

    const missionRuns = await prisma.missionRun.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        score: true,
        createdAt: true,
        mission: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const activeMissions = missionRuns
      .filter(m => ["ACCEPTED", "SUBMITTED", "REVIEWING"].includes(m.status))
      .map(m => ({
        id: m.id,
        title: m.mission?.title || "Unknown Mission",
        type: m.mission?.type || "unknown",
        status: m.status,
        createdAt: m.createdAt.toISOString(),
      }));

    const completedMissions = missionRuns.filter(m => m.status === "COMPLETED").length;

    const availableMissions = await prisma.missionDefinition.findMany({
      where: {
        active: true,
        NOT: {
          id: {
            in: missionRuns.map(m => m.mission?.id).filter(Boolean) as string[],
          },
        },
      },
      select: {
        id: true,
        title: true,
        type: true,
        prompt: true,
      },
      take: 10,
    });

    const rewards = await prisma.reward.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    const daysActive = user.createdAt 
      ? Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const recruits = user.referrals.map(r => ({
      agentId: r.agentId || "UNKNOWN",
      layer: r.profile?.layer || 0,
      active: r.profile?.lastActiveAt 
        ? (Date.now() - r.profile.lastActiveAt.getTime()) < (7 * 24 * 60 * 60 * 1000)
        : false,
      recruitedAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({
      id: user.id,
      agentId: user.agentId || `AGENT-${user.id.slice(-4).toUpperCase()}`,
      handle: user.handle,
      layer: trustState.layer,
      trustScore: trustState.decayedScore,
      referralCode: user.referralCode,
      identityLocked: user.identityLocked,
      createdAt: user.createdAt.toISOString(),
      stats: {
        totalMissions: missionRuns.length,
        completedMissions,
        recruitsCount: recruits.length,
        totalPoints: rewards._sum?.amount || 0,
        daysActive,
      },
      activeMissions,
      availableMissions: availableMissions.map(m => ({
        id: m.id,
        title: m.title,
        type: m.type,
        difficulty: "standard",
        briefing: m.prompt?.slice(0, 200) || "Classified briefing",
      })),
      recruits,
    });
  } catch (error) {
    console.error("[OPERATIVE PROFILE]", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}
