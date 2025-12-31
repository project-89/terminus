import prisma from "@/app/lib/prisma";
import { createHash } from "crypto";

export async function recordConversationOutcome(params: {
  sessionId: string;
  userId: string;
  logosMessage: string;
  messageType: string;
  playerLayer: number;
  playerTrust: number;
  turnNumber: number;
}) {
  const contentHash = createHash("md5")
    .update(params.logosMessage.slice(0, 500))
    .digest("hex")
    .slice(0, 16);

  return prisma.conversationOutcome.create({
    data: {
      ...params,
      contentHash,
    },
  });
}

export async function updateOutcomeMetrics(
  outcomeId: string,
  metrics: {
    playerResponded?: boolean;
    responseLength?: number;
    responseTime?: number;
    sentiment?: number;
    engagement?: number;
    ledToTrustGain?: boolean;
    ledToMission?: boolean;
    ledToChurn?: boolean;
  }
) {
  return prisma.conversationOutcome.update({
    where: { id: outcomeId },
    data: metrics,
  });
}

export async function getCollectiveInsights(params?: {
  type?: string;
  category?: string;
  minConfidence?: number;
  limit?: number;
}) {
  return prisma.collectiveInsight.findMany({
    where: {
      active: true,
      ...(params?.type && { type: params.type as any }),
      ...(params?.category && { category: params.category }),
      ...(params?.minConfidence && { confidence: { gte: params.minConfidence } }),
    },
    orderBy: [{ confidence: "desc" }, { sampleSize: "desc" }],
    take: params?.limit ?? 20,
  });
}

export async function recordInsight(params: {
  type: string;
  category: string;
  pattern: string;
  content: any;
  confidence?: number;
}) {
  const existing = await prisma.collectiveInsight.findFirst({
    where: {
      type: params.type as any,
      pattern: params.pattern,
      active: true,
    },
  });

  if (existing) {
    const newSampleSize = existing.sampleSize + 1;
    const newConfidence = Math.min(
      0.95,
      existing.confidence + (1 - existing.confidence) * 0.1
    );

    return prisma.collectiveInsight.update({
      where: { id: existing.id },
      data: {
        sampleSize: newSampleSize,
        confidence: newConfidence,
        content: params.content,
        updatedAt: new Date(),
      },
    });
  }

  return prisma.collectiveInsight.create({
    data: {
      type: params.type as any,
      category: params.category,
      pattern: params.pattern,
      content: params.content,
      confidence: params.confidence ?? 0.3,
      sampleSize: 1,
    },
  });
}

export async function markInsightApplied(insightId: string, success: boolean) {
  const insight = await prisma.collectiveInsight.findUnique({
    where: { id: insightId },
  });

  if (!insight) return;

  const newTimesApplied = insight.timesApplied + 1;
  const currentSuccessRate = insight.successRate ?? 0.5;
  const newSuccessRate =
    (currentSuccessRate * insight.timesApplied + (success ? 1 : 0)) /
    newTimesApplied;

  const newConfidence = success
    ? Math.min(0.95, insight.confidence + 0.02)
    : Math.max(0.1, insight.confidence - 0.05);

  await prisma.collectiveInsight.update({
    where: { id: insightId },
    data: {
      timesApplied: newTimesApplied,
      successRate: newSuccessRate,
      confidence: newConfidence,
      lastApplied: new Date(),
      active: newSuccessRate > 0.2,
    },
  });
}

export async function computeCollectiveStats(period: "daily" | "weekly" | "monthly") {
  const now = new Date();
  const periodStart = new Date();
  
  if (period === "daily") {
    periodStart.setDate(periodStart.getDate() - 1);
  } else if (period === "weekly") {
    periodStart.setDate(periodStart.getDate() - 7);
  } else {
    periodStart.setMonth(periodStart.getMonth() - 1);
  }

  const [
    totalPlayers,
    activePlayers,
    newPlayers,
    sessions,
    messages,
    profiles,
    missionRuns,
    dreams,
    syncs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { gameSessions: { some: { createdAt: { gte: periodStart } } } },
    }),
    prisma.user.count({ where: { createdAt: { gte: periodStart } } }),
    prisma.gameSession.findMany({
      where: { createdAt: { gte: periodStart } },
      include: { _count: { select: { messages: true } } },
    }),
    prisma.message.count({ where: { createdAt: { gte: periodStart } } }),
    prisma.playerProfile.findMany({
      select: { layer: true, trustScore: true },
    }),
    prisma.missionRun.findMany({
      where: { createdAt: { gte: periodStart } },
      select: { status: true, score: true },
    }),
    prisma.dreamEntry.findMany({
      where: { createdAt: { gte: periodStart } },
      select: { symbols: true },
    }),
    prisma.synchronicity.findMany({
      where: { createdAt: { gte: periodStart } },
      select: { pattern: true },
    }),
  ]);

  const layerDistribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalTrust = 0;
  for (const p of profiles) {
    layerDistribution[p.layer] = (layerDistribution[p.layer] || 0) + 1;
    totalTrust += p.trustScore;
  }

  const symbolCounts: Record<string, number> = {};
  for (const d of dreams) {
    for (const s of d.symbols) {
      symbolCounts[s] = (symbolCounts[s] || 0) + 1;
    }
  }
  const topDreamSymbols = Object.entries(symbolCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([symbol, count]) => ({ symbol, count }));

  const patternCounts: Record<string, number> = {};
  for (const s of syncs) {
    patternCounts[s.pattern] = (patternCounts[s.pattern] || 0) + 1;
  }
  const topSyncPatterns = Object.entries(patternCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([pattern, count]) => ({ pattern, count }));

  const completedMissions = missionRuns.filter((m: { status: string; score: number | null }) => m.status === "COMPLETED");
  const missionCompletionRate =
    missionRuns.length > 0 ? completedMissions.length / missionRuns.length : 0;
  const avgMissionScore =
    completedMissions.length > 0
      ? completedMissions.reduce((sum: number, m: { status: string; score: number | null }) => sum + (m.score || 0), 0) /
        completedMissions.length
      : 0;

  const totalSessionMessages = sessions.reduce((sum: number, s: { _count: { messages: number } }) => sum + s._count.messages, 0);
  const avgMessagesPerSession =
    sessions.length > 0 ? totalSessionMessages / sessions.length : 0;

  const previousStats = await prisma.collectiveStats.findFirst({
    where: { period },
    orderBy: { computedAt: "desc" },
  });

  const churned = previousStats
    ? previousStats.activePlayers - activePlayers + newPlayers
    : 0;

  return prisma.collectiveStats.create({
    data: {
      period,
      totalPlayers,
      activePlayers,
      newPlayers,
      churned: Math.max(0, churned),
      layerDistribution,
      avgTrustScore: profiles.length > 0 ? totalTrust / profiles.length : 0,
      avgSessionLength: 15,
      totalSessions: sessions.length,
      totalMessages: messages,
      avgMessagesPerSession,
      topEngagingTopics: [],
      topDreamSymbols,
      topSyncPatterns,
      missionCompletionRate,
      avgMissionScore,
      previousPeriodId: previousStats?.id,
    },
  });
}

export async function analyzeAndLearn() {
  const recentOutcomes = await prisma.conversationOutcome.findMany({
    where: {
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      engagement: { not: null },
    },
    orderBy: { engagement: "desc" },
    take: 100,
  });

  const highEngagement = recentOutcomes.filter((o: { engagement: number | null }) => (o.engagement ?? 0) > 0.7);
  const lowEngagement = recentOutcomes.filter((o: { engagement: number | null }) => (o.engagement ?? 0) < 0.3);

  const typeSuccess: Record<string, { high: number; low: number }> = {};
  for (const o of highEngagement) {
    if (!typeSuccess[o.messageType]) {
      typeSuccess[o.messageType] = { high: 0, low: 0 };
    }
    typeSuccess[o.messageType].high++;
  }
  for (const o of lowEngagement) {
    if (!typeSuccess[o.messageType]) {
      typeSuccess[o.messageType] = { high: 0, low: 0 };
    }
    typeSuccess[o.messageType].low++;
  }

  for (const [type, counts] of Object.entries(typeSuccess)) {
    const total = counts.high + counts.low;
    if (total >= 5) {
      const successRate = counts.high / total;
      
      if (successRate > 0.6) {
        await recordInsight({
          type: "ENGAGEMENT_PATTERN",
          category: "message_type",
          pattern: `${type}_high_engagement`,
          content: {
            messageType: type,
            successRate,
            sampleSize: total,
            recommendation: `Messages of type "${type}" show high engagement`,
          },
          confidence: Math.min(0.9, 0.5 + successRate * 0.4),
        });
      } else if (successRate < 0.3) {
        await recordInsight({
          type: "FAILURE_MODE",
          category: "message_type",
          pattern: `${type}_low_engagement`,
          content: {
            messageType: type,
            successRate,
            sampleSize: total,
            recommendation: `Messages of type "${type}" often fail to engage`,
          },
          confidence: Math.min(0.9, 0.5 + (1 - successRate) * 0.4),
        });
      }
    }
  }

  const layerPatterns: Record<number, number[]> = {};
  for (const o of recentOutcomes) {
    if (!layerPatterns[o.playerLayer]) {
      layerPatterns[o.playerLayer] = [];
    }
    layerPatterns[o.playerLayer].push(o.engagement ?? 0);
  }

  for (const [layer, engagements] of Object.entries(layerPatterns)) {
    if (engagements.length >= 10) {
      const avgEngagement =
        engagements.reduce((a, b) => a + b, 0) / engagements.length;
      
      await recordInsight({
        type: "ENGAGEMENT_PATTERN",
        category: "layer_engagement",
        pattern: `layer_${layer}_baseline`,
        content: {
          layer: parseInt(layer),
          avgEngagement,
          sampleSize: engagements.length,
        },
        confidence: 0.6,
      });
    }
  }

  return { analyzed: recentOutcomes.length };
}

export async function getInsightsForContext(params: {
  playerLayer: number;
  messageType?: string;
}): Promise<string[]> {
  const insights = await prisma.collectiveInsight.findMany({
    where: {
      active: true,
      confidence: { gte: 0.6 },
      OR: [
        { category: "layer_engagement" },
        { category: "message_type" },
        { type: "EFFECTIVE_PROMPT" },
        { type: "TRUST_ACCELERATOR" },
      ],
    },
    orderBy: { confidence: "desc" },
    take: 10,
  });

  return insights.map((i: { pattern: string; content: unknown; confidence: number }) => {
    const content = i.content as any;
    return `[INSIGHT: ${i.pattern}] ${content.recommendation || i.pattern} (confidence: ${(i.confidence * 100).toFixed(0)}%)`;
  });
}

export async function getCollectiveDreamSymbols(limit = 20) {
  const stats = await prisma.collectiveStats.findFirst({
    orderBy: { computedAt: "desc" },
  });

  return (stats?.topDreamSymbols as any[]) || [];
}

export async function getCollectiveSyncPatterns(limit = 20) {
  const stats = await prisma.collectiveStats.findFirst({
    orderBy: { computedAt: "desc" },
  });

  return (stats?.topSyncPatterns as any[]) || [];
}
