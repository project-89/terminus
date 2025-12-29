import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const since = searchParams.get("since");

  try {
    const sinceDate = since ? new Date(since) : new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      recentMessages,
      recentSessions,
      recentMissions,
      recentFieldMissions,
      recentExperiments,
      recentDreams,
    ] = await Promise.all([
      prisma.gameMessage.findMany({
        where: { createdAt: { gte: sinceDate } },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          gameSession: {
            include: {
              user: {
                select: { id: true, handle: true, profile: { select: { codename: true } } },
              },
            },
          },
        },
      }),
      prisma.gameSession.findMany({
        where: { createdAt: { gte: sinceDate } },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          user: {
            select: { id: true, handle: true, profile: { select: { codename: true } } },
          },
        },
      }),
      prisma.missionRun.findMany({
        where: { updatedAt: { gte: sinceDate } },
        orderBy: { updatedAt: "desc" },
        take: limit,
        include: {
          user: {
            select: { id: true, handle: true, profile: { select: { codename: true } } },
          },
          mission: { select: { title: true } },
        },
      }),
      prisma.fieldMission.findMany({
        where: { updatedAt: { gte: sinceDate } },
        orderBy: { updatedAt: "desc" },
        take: limit,
        include: {
          user: {
            select: { id: true, handle: true, profile: { select: { codename: true } } },
          },
        },
      }),
      prisma.experiment.findMany({
        where: { createdAt: { gte: sinceDate } },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          user: {
            select: { id: true, handle: true, profile: { select: { codename: true } } },
          },
        },
      }),
      prisma.dreamEntry.findMany({
        where: { createdAt: { gte: sinceDate } },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          user: {
            select: { id: true, handle: true, profile: { select: { codename: true } } },
          },
        },
      }),
    ]);

    const events: Array<{
      id: string;
      type: string;
      timestamp: Date;
      agent: { id: string; handle: string | null; codename: string | null };
      data: any;
    }> = [];

    for (const session of recentSessions) {
      events.push({
        id: `session-${session.id}`,
        type: "SESSION_START",
        timestamp: session.createdAt,
        agent: {
          id: session.user.id,
          handle: session.user.handle,
          codename: session.user.profile?.codename || null,
        },
        data: { sessionId: session.id },
      });
    }

    for (const msg of recentMessages) {
      if (msg.role === "user") {
        events.push({
          id: `msg-${msg.id}`,
          type: "MESSAGE",
          timestamp: msg.createdAt,
          agent: {
            id: msg.gameSession.user.id,
            handle: msg.gameSession.user.handle,
            codename: msg.gameSession.user.profile?.codename || null,
          },
          data: { content: msg.content.slice(0, 100), sessionId: msg.gameSessionId },
        });
      }
    }

    for (const run of recentMissions) {
      events.push({
        id: `mission-${run.id}`,
        type: run.status === "COMPLETED" ? "MISSION_COMPLETE" : run.status === "FAILED" ? "MISSION_FAILED" : "MISSION_UPDATE",
        timestamp: run.updatedAt,
        agent: {
          id: run.user.id,
          handle: run.user.handle,
          codename: run.user.profile?.codename || null,
        },
        data: { missionId: run.id, title: run.mission.title, status: run.status, score: run.score },
      });
    }

    for (const fm of recentFieldMissions) {
      events.push({
        id: `fieldmission-${fm.id}`,
        type: fm.status === "PENDING_REVIEW" ? "FIELD_MISSION_SUBMITTED" : fm.status === "COMPLETED" ? "FIELD_MISSION_COMPLETE" : "FIELD_MISSION_UPDATE",
        timestamp: fm.updatedAt,
        agent: {
          id: fm.user.id,
          handle: fm.user.handle,
          codename: fm.user.profile?.codename || null,
        },
        data: { missionId: fm.id, title: fm.title, status: fm.status, type: fm.type },
      });
    }

    for (const exp of recentExperiments) {
      events.push({
        id: `exp-${exp.id}`,
        type: "EXPERIMENT_CREATED",
        timestamp: exp.createdAt,
        agent: {
          id: exp.user.id,
          handle: exp.user.handle,
          codename: exp.user.profile?.codename || null,
        },
        data: { experimentId: exp.id, hypothesis: exp.hypothesis.slice(0, 80), title: exp.title },
      });
    }

    for (const dream of recentDreams) {
      events.push({
        id: `dream-${dream.id}`,
        type: "DREAM_RECORDED",
        timestamp: dream.createdAt,
        agent: {
          id: dream.user.id,
          handle: dream.user.handle,
          codename: dream.user.profile?.codename || null,
        },
        data: { dreamId: dream.id, symbols: dream.symbols.slice(0, 5), emotions: dream.emotions.slice(0, 3) },
      });
    }

    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      events: events.slice(0, limit),
      lastUpdate: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Admin activity error:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
