import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { validateAdminAuth } from "@/app/lib/server/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    // 1. Fetch Global Stats
    const totalAgents = await prisma.user.count();
    const activeMissions = await prisma.missionRun.count({
      where: { status: "ACCEPTED" },
    });
    const completedMissions = await prisma.missionRun.count({
      where: { status: "COMPLETED" },
    });

    // 1b. Fetch Puzzle Stats from Knowledge Graph
    const puzzleNodes = await prisma.knowledgeNode.findMany({
      where: { type: "PUZZLE" },
      select: { data: true },
    });

    let totalPuzzlesAttempted = 0;
    let totalPuzzlesSolved = 0;
    const puzzleTypeStats: Record<string, { attempted: number; solved: number }> = {};

    for (const node of puzzleNodes) {
      const data = node.data as Record<string, any>;
      if (data.attempts && data.attempts > 0) {
        totalPuzzlesAttempted++;
        const puzzleType = data.puzzleType || "world";
        if (!puzzleTypeStats[puzzleType]) {
          puzzleTypeStats[puzzleType] = { attempted: 0, solved: 0 };
        }
        puzzleTypeStats[puzzleType].attempted++;
        if (data.solved) {
          totalPuzzlesSolved++;
          puzzleTypeStats[puzzleType].solved++;
        }
      }
    }

    // 2. Fetch Recent Agents (Limit 10)
    const agents = await prisma.user.findMany({
      take: 10,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        handle: true,
        createdAt: true,
        role: true,
        profile: {
          select: {
            traits: true,
            skills: true,
          }
        },
        _count: {
          select: { missionRuns: true }
        }
      },
    });

    // 3. Fetch Mission Definitions
    const missions = await prisma.missionDefinition.findMany({
      where: { active: true },
      select: { id: true, title: true, type: true }
    });

    // 4. Fetch Recent Experiments
    const experiments = await prisma.experiment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { handle: true } }
      }
    });

    return NextResponse.json({
      stats: {
        totalAgents,
        activeMissions,
        completedMissions,
        puzzlesAttempted: totalPuzzlesAttempted,
        puzzlesSolved: totalPuzzlesSolved,
        puzzleSuccessRate: totalPuzzlesAttempted > 0
          ? Math.round((totalPuzzlesSolved / totalPuzzlesAttempted) * 100)
          : 0,
      },
      puzzleStats: {
        byType: puzzleTypeStats,
        mostPopular: Object.entries(puzzleTypeStats)
          .sort((a, b) => b[1].attempted - a[1].attempted)[0]?.[0] || null,
        hardestType: Object.entries(puzzleTypeStats)
          .filter(([_, stats]) => stats.attempted >= 3)
          .sort((a, b) => (a[1].solved / a[1].attempted) - (b[1].solved / b[1].attempted))[0]?.[0] || null,
      },
      agents: agents.map((a: any) => ({
        id: a.id,
        handle: a.handle || "Unknown",
        role: a.role,
        lastActive: a.updatedAt || a.createdAt,
        missionsRun: a._count.missionRuns,
        traits: a.profile?.traits || {}
      })),
      missions,
      experiments: experiments.map((e: any) => ({
        id: e.id,
        agent: e.user.handle,
        hypothesis: e.hypothesis,
        status: e.successCriteria ? "Active" : "Logged"
      }))
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
