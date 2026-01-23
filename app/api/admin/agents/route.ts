import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { validateAdminAuth } from "@/app/lib/server/adminAuth";
import { LAYER_THRESHOLDS, LAYER_NAMES, TrustLayer } from "@/app/lib/server/trustService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const search = searchParams.get("search") || "";

  try {
    const where = search
      ? { handle: { contains: search, mode: "insensitive" as const } }
      : {};

    const [agents, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          profile: true,
          sessions: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          gameSessions: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          missionRuns: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          experiments: {
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
              events: {
                orderBy: { createdAt: "desc" },
                take: 5,
              },
            },
          },
          fieldMissions: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          dreamEntries: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          synchronicities: {
            orderBy: { significance: "desc" },
            take: 10,
          },
          knowledgeNodes: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
          _count: {
            select: {
              missionRuns: true,
              gameSessions: true,
              experiments: true,
              fieldMissions: true,
              dreamEntries: true,
              memoryEvents: true,
              knowledgeNodes: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const enrichedAgents = await Promise.all(
      agents.map(async (agent: any) => {
        const gameSessions = agent.gameSessions || [];
        const totalMinutes = gameSessions.reduce((acc: number, s: any) => {
          if (s.createdAt && s.updatedAt) {
            const duration = new Date(s.updatedAt).getTime() - new Date(s.createdAt).getTime();
            return acc + duration / 60000;
          }
          return acc;
        }, 0);

        const firstSession = gameSessions[gameSessions.length - 1];
        const lastSession = gameSessions[0];
        const daysSinceFirst = firstSession
          ? Math.floor((Date.now() - new Date(firstSession.createdAt).getTime()) / 86400000)
          : 0;
        const daysSinceLast = lastSession
          ? Math.floor((Date.now() - new Date(lastSession.createdAt).getTime()) / 86400000)
          : null;

        const completedMissions = agent.missionRuns.filter((m: any) => m.status === "COMPLETED").length;
        const completedFieldMissions = agent.fieldMissions.filter((m: any) => m.status === "COMPLETED").length;
        const avgScore = agent.missionRuns
          .filter((m: any) => typeof m.score === "number")
          .reduce((acc: number, m: any, _: number, arr: any[]) => acc + m.score / arr.length, 0);

        // Use canonical trust data from profile (maintained by trustService)
        // Fall back to computed values if profile doesn't have trust data
        const canonicalTrustScore = agent.profile?.trustScore ?? 0;
        const canonicalLayer = (agent.profile?.layer ?? 0) as TrustLayer;

        return {
          id: agent.id,
          handle: agent.handle || "Unknown",
          email: agent.email,
          role: agent.role,
          createdAt: agent.createdAt,
          consentedAt: agent.consentedAt,

          stats: {
            totalSessions: gameSessions.length,
            totalMinutes: Math.round(totalMinutes),
            daysSinceFirst,
            daysSinceLast,
            returnRate: gameSessions.length > 1 ? gameSessions.length / Math.max(daysSinceFirst, 1) : 0,
          },

          missions: {
            total: agent._count.missionRuns,
            completed: completedMissions,
            avgScore: avgScore || 0,
          },

          fieldMissions: {
            total: agent._count.fieldMissions,
            completed: completedFieldMissions,
            active: agent.fieldMissions.find((m: any) =>
              ["ACCEPTED", "IN_PROGRESS", "EVIDENCE_SUBMITTED"].includes(m.status)
            ),
          },

          experiments: {
            total: agent._count.experiments,
            recent: agent.experiments.slice(0, 5).map((e: any) => ({
              id: e.id,
              hypothesis: e.hypothesis,
              task: e.task,
              latestEvent: e.events[0],
            })),
          },

          dreams: {
            total: agent._count.dreamEntries,
            recent: agent.dreamEntries.slice(0, 3).map((d: any) => ({
              id: d.id,
              symbols: d.symbols,
              emotions: d.emotions,
              lucidity: d.lucidity,
              recurrence: d.recurrence,
              createdAt: d.createdAt,
            })),
          },

          synchronicities: {
            total: agent.synchronicities.length,
            significant: agent.synchronicities.filter((s: any) => s.significance >= 0.7),
          },

          knowledge: {
            totalNodes: agent._count.knowledgeNodes,
            solved: agent.knowledgeNodes.filter((n: any) => n.solved).length,
          },

          profile: agent.profile
            ? {
                traits: agent.profile.traits,
                skills: agent.profile.skills,
                preferences: agent.profile.preferences,
                lastActiveAt: agent.profile.lastActiveAt,
                pendingCeremony: agent.profile.pendingCeremony,
              }
            : null,

          location: agent.profile?.location as { lat: number; lng: number } | null,
          trustScore: canonicalTrustScore,
          layer: canonicalLayer,
          layerName: LAYER_NAMES[canonicalLayer],
          layerThresholds: LAYER_THRESHOLDS,
          
          gameSessions: gameSessions.slice(0, 10).map((s: any) => ({
            id: s.id,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
            status: s.status,
          })),
        };
      })
    );

    return NextResponse.json({
      agents: enrichedAgents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Admin agents error:", error);
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 });
  }
}

// Trust score and layer are now sourced directly from profile (maintained by trustService)
// See: app/lib/server/trustService.ts for LAYER_THRESHOLDS and evolveTrust
