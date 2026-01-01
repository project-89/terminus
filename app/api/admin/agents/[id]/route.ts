import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const agent = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        sessions: {
          orderBy: { createdAt: "desc" },
        },
        gameSessions: {
          orderBy: { createdAt: "desc" },
          include: {
            messages: {
              orderBy: { createdAt: "asc" },
            },
            missionRuns: true,
          },
        },
        threads: {
          orderBy: { createdAt: "desc" },
          include: {
            messages: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
        missionRuns: {
          orderBy: { createdAt: "desc" },
          include: {
            mission: true,
          },
        },
        experiments: {
          orderBy: { createdAt: "desc" },
          include: {
            events: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
        fieldMissions: {
          orderBy: { createdAt: "desc" },
        },
        dreamEntries: {
          orderBy: { createdAt: "desc" },
        },
        synchronicities: {
          orderBy: { significance: "desc" },
        },
        knowledgeNodes: {
          orderBy: { createdAt: "desc" },
          include: {
            outEdges: {
              include: {
                toNode: {
                  select: { id: true, label: true, type: true },
                },
              },
            },
            inEdges: {
              include: {
                fromNode: {
                  select: { id: true, label: true, type: true },
                },
              },
            },
          },
        },
        memoryEvents: {
          orderBy: { createdAt: "desc" },
          take: 100,
        },
        rewards: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const gameSessions = agent.gameSessions || [];
    const totalMinutes = gameSessions.reduce((acc: number, s: any) => {
      if (s.createdAt && s.updatedAt) {
        const duration = new Date(s.updatedAt).getTime() - new Date(s.createdAt).getTime();
        return acc + duration / 60000;
      }
      return acc;
    }, 0);

    const sessionsByDay: Record<string, number> = {};
    const sessionsByHour: Record<number, number> = {};
    
    for (const session of gameSessions) {
      const date = new Date(session.createdAt).toISOString().split("T")[0];
      const hour = new Date(session.createdAt).getHours();
      sessionsByDay[date] = (sessionsByDay[date] || 0) + 1;
      sessionsByHour[hour] = (sessionsByHour[hour] || 0) + 1;
    }

    const dreamSymbols: Record<string, number> = {};
    const dreamEmotions: Record<string, number> = {};
    
    for (const dream of agent.dreamEntries) {
      for (const sym of dream.symbols) {
        dreamSymbols[sym] = (dreamSymbols[sym] || 0) + 1;
      }
      for (const emo of dream.emotions) {
        dreamEmotions[emo] = (dreamEmotions[emo] || 0) + 1;
      }
    }

    const completedMissions = agent.missionRuns.filter((m: any) => m.status === "COMPLETED").length;
    const avgScore = agent.missionRuns
      .filter((m: any) => typeof m.score === "number")
      .reduce((acc: number, m: any, _: number, arr: any[]) => acc + (m.score || 0) / arr.length, 0);

    const trustScore = computeTrustScore(agent, avgScore);

    const totalMessages = gameSessions.reduce((acc: number, s: any) => acc + s.messages.length, 0);
    const totalRewards = agent.rewards.reduce((acc: number, r: any) => acc + r.amount, 0);

    return NextResponse.json({
      id: agent.id,
      handle: agent.handle,
      email: agent.email,
      role: agent.role,
      createdAt: agent.createdAt,
      consentedAt: agent.consentedAt,

      trustScore,
      layer: calculateLayer(trustScore),

      profile: agent.profile,

      stats: {
        totalSessions: gameSessions.length,
        totalMessages,
        totalMissions: agent.missionRuns.length,
        completedMissions,
        totalRewards,
        dreamEntries: agent.dreamEntries.length,
        synchronicities: agent.synchronicities.length,
        knowledgeNodes: agent.knowledgeNodes.length,
        fieldMissions: agent.fieldMissions.length,
      },

      recentSessions: gameSessions.slice(0, 10).map((s: any) => ({
        id: s.id,
        createdAt: s.createdAt,
        status: s.status,
        messageCount: s.messages.length,
      })),

      missionHistory: agent.missionRuns.map((m: any) => ({
        id: m.id,
        title: m.mission.title,
        status: m.status,
        score: m.score,
        createdAt: m.createdAt,
      })),

      behavior: {
        totalSessions: gameSessions.length,
        totalMinutes: Math.round(totalMinutes),
        avgSessionLength: gameSessions.length > 0 ? Math.round(totalMinutes / gameSessions.length) : 0,
        sessionsByDay,
        sessionsByHour,
        firstSession: gameSessions[gameSessions.length - 1]?.createdAt,
        lastSession: gameSessions[0]?.createdAt,
        peakHour: Object.entries(sessionsByHour).sort((a, b) => b[1] - a[1])[0]?.[0],
      },

      missions: {
        total: agent.missionRuns.length,
        completed: completedMissions,
        avgScore,
        history: agent.missionRuns.map((m: any) => ({
          id: m.id,
          title: m.mission.title,
          type: m.mission.type,
          status: m.status,
          score: m.score,
          createdAt: m.createdAt,
        })),
      },

      fieldMissions: {
        total: agent.fieldMissions.length,
        completed: agent.fieldMissions.filter((m: any) => m.status === "COMPLETED").length,
        history: agent.fieldMissions.map((m: any) => ({
          id: m.id,
          title: m.title,
          type: m.type,
          status: m.status,
          score: m.score,
          objectives: m.objectives,
          evidence: m.evidence,
          createdAt: m.createdAt,
        })),
      },

      experiments: agent.experiments.map((e: any) => ({
        id: e.id,
        hypothesis: e.hypothesis,
        task: e.task,
        successCriteria: e.successCriteria,
        title: e.title,
        createdAt: e.createdAt,
        events: e.events.map((ev: any) => ({
          observation: ev.observation,
          result: ev.result,
          score: ev.score,
          createdAt: ev.createdAt,
        })),
      })),

      dreams: {
        total: agent.dreamEntries.length,
        avgLucidity: agent.dreamEntries.length > 0
          ? agent.dreamEntries.reduce((acc: number, d: any) => acc + (d.lucidity || 0), 0) / agent.dreamEntries.length
          : 0,
        symbolFrequency: dreamSymbols,
        emotionFrequency: dreamEmotions,
        entries: agent.dreamEntries.map((d: any) => ({
          id: d.id,
          content: d.content,
          symbols: d.symbols,
          emotions: d.emotions,
          lucidity: d.lucidity,
          recurrence: d.recurrence,
          analysis: d.analysis,
          createdAt: d.createdAt,
        })),
      },

      synchronicities: agent.synchronicities.map((s: any) => ({
        id: s.id,
        pattern: s.pattern,
        occurrences: s.occurrences,
        significance: s.significance,
        acknowledged: s.acknowledged,
        note: s.note,
        createdAt: s.createdAt,
      })),

      knowledge: {
        totalNodes: agent.knowledgeNodes.length,
        solved: agent.knowledgeNodes.filter((n: any) => n.solved).length,
        nodes: agent.knowledgeNodes.map((n: any) => ({
          id: n.id,
          type: n.type,
          label: n.label,
          solved: n.solved,
          discoveredAt: n.discoveredAt,
          connections: [
            ...n.outEdges.map((e: any) => ({ to: e.toNode, relation: e.relation })),
            ...n.inEdges.map((e: any) => ({ from: e.fromNode, relation: e.relation })),
          ],
        })),
      },

      memory: agent.memoryEvents.map((m: any) => ({
        id: m.id,
        type: m.type,
        content: m.content,
        tags: m.tags,
        createdAt: m.createdAt,
      })),

      gameSessions: gameSessions.map((s: any) => ({
        id: s.id,
        status: s.status,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        messageCount: s.messages.length,
        messages: s.messages.map((m: any) => ({
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
        })),
      })),

      rewards: agent.rewards.map((r: any) => ({
        id: r.id,
        type: r.type,
        amount: r.amount,
        metadata: r.metadata,
        createdAt: r.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Admin agent detail error:", error);
    return NextResponse.json({ error: "Failed to fetch agent" }, { status: 500 });
  }
}

function computeTrustScore(agent: any, avgMissionScore: number): number {
  const sessionCount = agent.gameSessions?.length || 0;
  const experimentCount = agent.experiments?.length || 0;
  const fieldMissionCompleted = agent.fieldMissions?.filter((m: any) => m.status === "COMPLETED").length || 0;

  const sessionFactor = Math.min(sessionCount / 10, 1) * 0.2;
  const missionFactor = avgMissionScore * 0.3;
  const experimentFactor = Math.min(experimentCount / 5, 1) * 0.2;
  const fieldFactor = Math.min(fieldMissionCompleted / 3, 1) * 0.3;

  return Math.min(1, sessionFactor + missionFactor + experimentFactor + fieldFactor);
}

function calculateLayer(trust: number): number {
  if (trust < 0.2) return 0;
  if (trust < 0.4) return 1;
  if (trust < 0.6) return 2;
  if (trust < 0.8) return 3;
  if (trust < 0.95) return 4;
  return 5;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminSecret = request.headers.get("x-admin-secret");
  if (process.env.ADMIN_SECRET && adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { adminNotes, adminDirectives, watchlist, flagged, flagReason, assignedMissions, tags, trustScore, layer, dashboardEnabled } = body;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (adminDirectives !== undefined) updateData.adminDirectives = adminDirectives;
    if (watchlist !== undefined) updateData.watchlist = watchlist;
    if (flagged !== undefined) updateData.flagged = flagged;
    if (flagReason !== undefined) updateData.flagReason = flagReason;
    if (assignedMissions !== undefined) updateData.assignedMissions = assignedMissions;
    if (tags !== undefined) updateData.tags = tags;
    if (trustScore !== undefined) updateData.trustScore = Math.max(0, Math.min(1, trustScore));
    if (layer !== undefined) updateData.layer = Math.max(0, Math.min(5, layer));
    if (dashboardEnabled !== undefined) updateData.dashboardEnabled = dashboardEnabled;

    const profile = await prisma.playerProfile.upsert({
      where: { userId: id },
      update: updateData,
      create: {
        userId: id,
        ...updateData,
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error("Admin agent update error:", error);
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 });
  }
}
