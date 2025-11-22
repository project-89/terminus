
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // 1. Fetch Global Stats
    const totalAgents = await prisma.user.count();
    const activeMissions = await prisma.missionRun.count({
      where: { status: "ACCEPTED" },
    });
    const completedMissions = await prisma.missionRun.count({
      where: { status: "COMPLETED" },
    });

    // 2. Fetch Recent Agents (Limit 10)
    const agents = await prisma.user.findMany({
      take: 10,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        handle: true,
        lastSeen: true, // We don't have lastSeen on User, checking schema... we have updatedAt
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
      },
      agents: agents.map((a: any) => ({
        id: a.id,
        handle: a.handle || "Unknown",
        role: a.role,
        lastActive: a.createdAt, // fallback since we don't have explicit lastSeen column on User
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
