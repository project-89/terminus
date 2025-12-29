import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalAgents,
      activeAgents24h,
      activeAgentsWeek,
      totalSessions,
      sessionsToday,
      sessionsWeek,
      totalMissionRuns,
      completedMissions,
      activeMissions,
      totalFieldMissions,
      completedFieldMissions,
      totalExperiments,
      totalDreams,
      totalSynchronicities,
      totalKnowledgeNodes,
      agentsByLayer,
      missionsByType,
      dreamSymbolCounts,
      hourlyActivity,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { gameSessions: { some: { createdAt: { gte: oneDayAgo } } } },
      }),
      prisma.user.count({
        where: { gameSessions: { some: { createdAt: { gte: oneWeekAgo } } } },
      }),
      prisma.gameSession.count(),
      prisma.gameSession.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.gameSession.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.missionRun.count(),
      prisma.missionRun.count({ where: { status: "COMPLETED" } }),
      prisma.missionRun.count({ where: { status: { in: ["ACCEPTED", "SUBMITTED", "REVIEWING"] } } }),
      prisma.fieldMission.count(),
      prisma.fieldMission.count({ where: { status: "COMPLETED" } }),
      prisma.experiment.count(),
      prisma.dreamEntry.count(),
      prisma.synchronicity.count(),
      prisma.knowledgeNode.count(),
      
      prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN COALESCE((profile.traits->>'trustScore')::float, 0) < 0.2 THEN 0
            WHEN COALESCE((profile.traits->>'trustScore')::float, 0) < 0.4 THEN 1
            WHEN COALESCE((profile.traits->>'trustScore')::float, 0) < 0.6 THEN 2
            WHEN COALESCE((profile.traits->>'trustScore')::float, 0) < 0.8 THEN 3
            WHEN COALESCE((profile.traits->>'trustScore')::float, 0) < 0.95 THEN 4
            ELSE 5
          END as layer,
          COUNT(*) as count
        FROM "User" u
        LEFT JOIN "PlayerProfile" profile ON u.id = profile."userId"
        GROUP BY layer
        ORDER BY layer
      `.catch(() => [] as any[]),

      prisma.missionRun.groupBy({
        by: ["status"],
        _count: true,
      }),

      prisma.dreamEntry.findMany({
        select: { symbols: true },
        take: 500,
      }),

      prisma.gameSession.findMany({
        where: { createdAt: { gte: oneWeekAgo } },
        select: { createdAt: true },
      }),
    ]);

    const symbolFrequency: Record<string, number> = {};
    for (const dream of dreamSymbolCounts) {
      for (const sym of dream.symbols) {
        symbolFrequency[sym] = (symbolFrequency[sym] || 0) + 1;
      }
    }
    const topSymbols = Object.entries(symbolFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([symbol, count]) => ({ symbol, count }));

    const activityByHour: Record<number, number> = {};
    for (let i = 0; i < 24; i++) activityByHour[i] = 0;
    for (const session of hourlyActivity) {
      const hour = new Date(session.createdAt).getHours();
      activityByHour[hour]++;
    }

    const layerDistribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (Array.isArray(agentsByLayer)) {
      for (const row of agentsByLayer as any[]) {
        layerDistribution[row.layer] = Number(row.count);
      }
    }

    return NextResponse.json({
      agents: {
        total: totalAgents,
        active24h: activeAgents24h,
        activeWeek: activeAgentsWeek,
        byLayer: layerDistribution,
      },
      sessions: {
        total: totalSessions,
        today: sessionsToday,
        thisWeek: sessionsWeek,
        byHour: activityByHour,
      },
      missions: {
        total: totalMissionRuns,
        completed: completedMissions,
        active: activeMissions,
        byStatus: missionsByType.reduce((acc: Record<string, number>, m: any) => {
          acc[m.status] = m._count;
          return acc;
        }, {}),
      },
      fieldMissions: {
        total: totalFieldMissions,
        completed: completedFieldMissions,
      },
      experiments: {
        total: totalExperiments,
      },
      dreams: {
        total: totalDreams,
        topSymbols,
      },
      synchronicities: {
        total: totalSynchronicities,
      },
      knowledge: {
        totalNodes: totalKnowledgeNodes,
      },
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
