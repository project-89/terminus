import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { validateAdminAuth } from "@/app/lib/server/adminAuth";
import {
  ensureMissionDefinitionForReference,
  getMissionTemplateById,
  loadMissionTemplates,
} from "@/app/lib/server/missionTemplateService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") !== "false";
    const includeRuns = searchParams.get("includeRuns") === "true";
    const runLimit = Math.max(1, Math.min(50, Number(searchParams.get("runLimit") || "10")));

    const missionsPromise = loadMissionTemplates({
      includeCatalog: true,
      includeDatabase: true,
      includeInactive,
      includeRuns,
      runLimit,
    });

    const [dbMissions, fieldMissionStats] = await Promise.all([
      missionsPromise,
      prisma.fieldMission.groupBy({
        by: ["type", "status"],
        _count: true,
      }),
    ]);

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
      missions: dbMissions,
      fieldMissionStats: fieldStats,
      stats: {
        totalTemplates: dbMissions.length,
        activeTemplates: dbMissions.filter((mission) => mission.active).length,
        catalogTemplates: dbMissions.filter((mission) => mission.source === "catalog").length,
        databaseTemplates: dbMissions.filter((mission) => mission.source !== "catalog").length,
      },
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
        const { title, prompt, type, minEvidence, tags, active } = body;
        const created = await prisma.missionDefinition.create({
          data: {
            title,
            prompt,
            type: type || "decode",
            minEvidence: minEvidence || 1,
            tags: tags || [],
            active: active !== false,
          },
        });
        const mission = await getMissionTemplateById(created.id, {
          includeCatalog: true,
          includeDatabase: true,
          includeRuns: true,
          runLimit: 10,
        });
        return NextResponse.json(mission || created);
      }

      case "update": {
        const { id, definitionId, action: _action, source: _source, stats: _stats, recentRuns: _recentRuns, ...updates } = body;
        const targetId = definitionId || id;
        if (!targetId) {
          return NextResponse.json({ error: "Mission id required" }, { status: 400 });
        }

        if (String(targetId).startsWith("catalog:")) {
          return NextResponse.json(
            { error: "Catalog templates are read-only. Import the template to database first." },
            { status: 400 },
          );
        }

        await prisma.missionDefinition.update({
          where: { id: targetId },
          data: updates,
        });

        const mission = await getMissionTemplateById(targetId, {
          includeCatalog: true,
          includeDatabase: true,
          includeRuns: true,
          runLimit: 10,
        });
        return NextResponse.json(mission);
      }

      case "toggle": {
        const { id, definitionId } = body;
        const targetId = definitionId || id;
        if (!targetId) {
          return NextResponse.json({ error: "Mission id required" }, { status: 400 });
        }

        if (String(targetId).startsWith("catalog:")) {
          return NextResponse.json(
            { error: "Catalog templates are read-only. Import the template to database first." },
            { status: 400 },
          );
        }

        const current = await prisma.missionDefinition.findUnique({ where: { id: targetId } });
        if (!current) {
          return NextResponse.json({ error: "Mission not found" }, { status: 404 });
        }

        await prisma.missionDefinition.update({
          where: { id: targetId },
          data: { active: !current.active },
        });

        const mission = await getMissionTemplateById(targetId, {
          includeCatalog: true,
          includeDatabase: true,
          includeRuns: true,
          runLimit: 10,
        });
        return NextResponse.json(mission);
      }

      case "delete": {
        const { id, definitionId } = body;
        const targetId = definitionId || id;
        if (!targetId) {
          return NextResponse.json({ error: "Mission id required" }, { status: 400 });
        }

        if (String(targetId).startsWith("catalog:")) {
          return NextResponse.json(
            { error: "Catalog templates cannot be deleted." },
            { status: 400 },
          );
        }

        await prisma.missionDefinition.delete({ where: { id: targetId } });
        return NextResponse.json({ success: true });
      }

      case "create_from_catalog": {
        const { catalogId } = body;
        if (!catalogId || typeof catalogId !== "string") {
          return NextResponse.json({ error: "catalogId is required" }, { status: 400 });
        }

        const definitionId = await ensureMissionDefinitionForReference(`catalog:${catalogId}`);
        const mission = await getMissionTemplateById(definitionId, {
          includeCatalog: true,
          includeDatabase: true,
          includeRuns: true,
          runLimit: 10,
        });

        return NextResponse.json({ success: true, mission });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Admin missions POST error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
