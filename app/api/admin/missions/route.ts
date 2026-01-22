import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { validateAdminAuth } from "@/app/lib/server/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const [dbMissions, fieldMissionStats] = await Promise.all([
      prisma.missionDefinition.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { missionRuns: true },
          },
          missionRuns: {
            where: { status: "COMPLETED" },
            select: { score: true },
          },
        },
      }),
      prisma.fieldMission.groupBy({
        by: ["type", "status"],
        _count: true,
      }),
    ]);

    const missions = dbMissions.map((m: any) => {
      const completedRuns = m.missionRuns || [];
      const avgScore = completedRuns.length > 0
        ? completedRuns.reduce((acc: number, r: any) => acc + (r.score || 0), 0) / completedRuns.length
        : 0;

      return {
        id: m.id,
        title: m.title,
        prompt: m.prompt,
        type: m.type,
        minEvidence: m.minEvidence,
        tags: m.tags,
        active: m.active,
        createdAt: m.createdAt,
        stats: {
          totalRuns: m._count.missionRuns,
          completedRuns: completedRuns.length,
          avgScore,
        },
      };
    });

    const fieldStats: Record<string, { total: number; completed: number }> = {};
    for (const stat of fieldMissionStats) {
      if (!fieldStats[stat.type]) {
        fieldStats[stat.type] = { total: 0, completed: 0 };
      }
      fieldStats[stat.type].total += stat._count;
      if (stat.status === "COMPLETED") {
        fieldStats[stat.type].completed += stat._count;
      }
    }

    return NextResponse.json({
      missions,
      fieldMissionStats: fieldStats,
    });
  } catch (error: any) {
    console.error("Admin missions error:", error);
    return NextResponse.json({ error: "Failed to fetch missions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "create": {
        const { title, prompt, type, minEvidence, tags } = body;
        const mission = await prisma.missionDefinition.create({
          data: {
            title,
            prompt,
            type: type || "decode",
            minEvidence: minEvidence || 1,
            tags: tags || [],
            active: true,
          },
        });
        return NextResponse.json(mission);
      }

      case "update": {
        const { id, ...updates } = body;
        const mission = await prisma.missionDefinition.update({
          where: { id },
          data: updates,
        });
        return NextResponse.json(mission);
      }

      case "toggle": {
        const { id } = body;
        const current = await prisma.missionDefinition.findUnique({ where: { id } });
        if (!current) {
          return NextResponse.json({ error: "Mission not found" }, { status: 404 });
        }
        const mission = await prisma.missionDefinition.update({
          where: { id },
          data: { active: !current.active },
        });
        return NextResponse.json(mission);
      }

      case "delete": {
        const { id } = body;
        await prisma.missionDefinition.delete({ where: { id } });
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Admin missions POST error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
