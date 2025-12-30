import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import type { RewardTaskType } from "@prisma/client";

export const dynamic = "force-dynamic";

const DEFAULT_REWARDS: Array<{
  taskType: RewardTaskType;
  name: string;
  description: string;
  pointsAwarded: number;
  firstTimeBonus: number;
}> = [
  { taskType: "DIRECT_REFERRAL", name: "Direct Referral", description: "Someone signs up with your referral code", pointsAwarded: 100, firstTimeBonus: 50 },
  { taskType: "ARTIFACT_SCAN", name: "Artifact Scan", description: "Someone scans your deployed artifact", pointsAwarded: 5, firstTimeBonus: 0 },
  { taskType: "ARTIFACT_RECRUIT", name: "Artifact Recruit", description: "Someone signs up after scanning your artifact", pointsAwarded: 150, firstTimeBonus: 50 },
  { taskType: "ARTIFACT_DEPLOY", name: "Artifact Deploy", description: "Deploy an artifact in the real world", pointsAwarded: 25, firstTimeBonus: 100 },
  { taskType: "ARTIFACT_VERIFY", name: "Artifact Verified", description: "Your artifact gets verified by admin", pointsAwarded: 50, firstTimeBonus: 0 },
  { taskType: "SESSION_COMPLETE", name: "Session Complete", description: "Complete a game session", pointsAwarded: 10, firstTimeBonus: 25 },
  { taskType: "MISSION_COMPLETE", name: "Mission Complete", description: "Complete a terminal mission", pointsAwarded: 50, firstTimeBonus: 100 },
  { taskType: "FIELD_MISSION_COMPLETE", name: "Field Mission", description: "Complete a real-world field mission", pointsAwarded: 200, firstTimeBonus: 100 },
  { taskType: "PUZZLE_SOLVE", name: "Puzzle Solved", description: "Solve an in-game puzzle", pointsAwarded: 25, firstTimeBonus: 50 },
  { taskType: "SECRET_DISCOVER", name: "Secret Discovery", description: "Discover a hidden secret", pointsAwarded: 75, firstTimeBonus: 50 },
  { taskType: "DREAM_SUBMIT", name: "Dream Report", description: "Submit a dream report", pointsAwarded: 15, firstTimeBonus: 25 },
  { taskType: "SYNC_REPORT", name: "Synchronicity Report", description: "Report a synchronicity", pointsAwarded: 20, firstTimeBonus: 25 },
  { taskType: "KNOWLEDGE_NODE", name: "Knowledge Discovery", description: "Add to the knowledge graph", pointsAwarded: 10, firstTimeBonus: 0 },
  { taskType: "LAYER_ADVANCE", name: "Layer Advancement", description: "Advance to a new trust layer", pointsAwarded: 500, firstTimeBonus: 0 },
  { taskType: "DAILY_LOGIN", name: "Daily Login", description: "Daily login bonus", pointsAwarded: 5, firstTimeBonus: 0 },
  { taskType: "STREAK_7_DAY", name: "7-Day Streak", description: "7 consecutive days of activity", pointsAwarded: 100, firstTimeBonus: 0 },
  { taskType: "STREAK_30_DAY", name: "30-Day Streak", description: "30 consecutive days of activity", pointsAwarded: 500, firstTimeBonus: 0 },
];

export async function GET() {
  try {
    let configs = await prisma.rewardConfig.findMany({
      orderBy: { taskType: "asc" },
    });

    if (configs.length === 0) {
      configs = await prisma.$transaction(
        DEFAULT_REWARDS.map((r) =>
          prisma.rewardConfig.create({ data: r })
        )
      );
    }

    const stats = await prisma.user.aggregate({
      _sum: { referralPoints: true },
      _count: { id: true },
    });

    const topEarners = await prisma.user.findMany({
      where: { referralPoints: { gt: 0 } },
      select: {
        id: true,
        handle: true,
        referralPoints: true,
        profile: { select: { codename: true } },
      },
      orderBy: { referralPoints: "desc" },
      take: 10,
    });

    return NextResponse.json({
      configs,
      stats: {
        totalPointsAwarded: stats._sum.referralPoints || 0,
        usersWithPoints: topEarners.length,
      },
      topEarners: topEarners.map((u: any) => ({
        id: u.id,
        handle: u.handle,
        codename: u.profile?.codename,
        points: u.referralPoints,
      })),
    });
  } catch (error: any) {
    console.error("Admin rewards GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, taskType, updates } = body;

    if (action === "update" && taskType && updates) {
      const config = await prisma.rewardConfig.update({
        where: { taskType },
        data: {
          pointsAwarded: updates.pointsAwarded,
          enabled: updates.enabled,
          firstTimeBonus: updates.firstTimeBonus,
          streakMultiplier: updates.streakMultiplier,
          dailyLimit: updates.dailyLimit,
          weeklyLimit: updates.weeklyLimit,
          minTrustLevel: updates.minTrustLevel,
          minLayer: updates.minLayer,
          name: updates.name,
          description: updates.description,
        },
      });
      return NextResponse.json({ success: true, config });
    }

    if (action === "reset") {
      await prisma.rewardConfig.deleteMany({});
      const configs = await prisma.$transaction(
        DEFAULT_REWARDS.map((r) =>
          prisma.rewardConfig.create({ data: r })
        )
      );
      return NextResponse.json({ success: true, configs });
    }

    if (action === "toggle" && taskType) {
      const current = await prisma.rewardConfig.findUnique({
        where: { taskType },
      });
      const config = await prisma.rewardConfig.update({
        where: { taskType },
        data: { enabled: !current?.enabled },
      });
      return NextResponse.json({ success: true, config });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin rewards POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
