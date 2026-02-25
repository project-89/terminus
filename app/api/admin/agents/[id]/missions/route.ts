import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { validateAdminAuth } from "@/app/lib/server/adminAuth";
import { ensureMissionDefinitionForReference, loadMissionTemplates } from "@/app/lib/server/missionTemplateService";
import { acceptMission, getLatestOpenMissionRun } from "@/app/lib/server/missionService";
import { isMissionVisibleToUser, withAgentTargetTags } from "@/app/lib/server/missionVisibility";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const [profile, missionRuns, availableTemplates] = await Promise.all([
      prisma.playerProfile.findUnique({
        where: { userId: id },
        select: { assignedMissions: true },
      }),
      prisma.missionRun.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { mission: true },
      }),
      loadMissionTemplates({
        includeCatalog: true,
        includeDatabase: true,
        includeInactive: false,
        includeRuns: false,
      }),
    ]);

    const templatesForAgent = availableTemplates.filter((template: any) =>
      isMissionVisibleToUser(template.tags, id),
    );

    return NextResponse.json({
      assignedMissions: profile?.assignedMissions || [],
      missionHistory: missionRuns.map((r: any) => ({
        id: r.id,
        missionId: r.mission.id,
        title: r.mission.title,
        type: r.mission.type,
        prompt: r.mission.prompt,
        minEvidence: r.mission.minEvidence,
        tags: r.mission.tags,
        status: r.status,
        score: r.score,
        feedback: r.feedback,
        payload: r.payload,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      availableTemplates: templatesForAgent,
    });
  } catch (error: any) {
    console.error("Admin agent missions error:", error);
    return NextResponse.json({ error: "Failed to fetch missions" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "assign": {
        const { title, briefing, type, priority, deadlineHours, narrativeDelivery, createMissionRun } = body;

        // If createMissionRun is true, create a real MissionDefinition and MissionRun
        if (createMissionRun) {
          // Create or find mission definition
          const scopedTags = withAgentTargetTags(
            ["admin-assigned", `priority:${priority || 5}`],
            id,
          );
          const missionDef = await prisma.missionDefinition.create({
            data: {
              title,
              prompt: briefing,
              type: type || "decode",
              minEvidence: 1,
              tags: scopedTags,
              active: true,
            },
          });

          let missionRun;
          try {
            // Enforce single-active-mission invariant through missionService
            missionRun = await acceptMission({
              missionId: missionDef.id,
              userId: id,
            });
          } catch (e: any) {
            if (typeof e?.message === "string" && e.message.includes("active mission")) {
              const existing = await getLatestOpenMissionRun(id);
              return NextResponse.json(
                {
                  error: e.message,
                  activeMission: existing
                    ? {
                        id: existing.id,
                        title: existing.mission.title,
                        status: existing.status,
                      }
                    : null,
                },
                { status: 409 },
              );
            }
            throw e;
          }

          return NextResponse.json({
            success: true,
            mission: {
              id: missionRun.id,
              definitionId: missionDef.id,
              title,
              briefing,
              type: type || "decode",
              status: missionRun.status,
              createdAt: new Date().toISOString(),
            },
            missionRun: {
              id: missionRun.id,
              status: missionRun.status,
            },
          });
        }

        // Otherwise, use narrative-only assignment (for AI delivery)
        const profile = await prisma.playerProfile.findUnique({
          where: { userId: id },
          select: { assignedMissions: true },
        });

        const currentMissions = (profile?.assignedMissions as any[]) || [];

        const newMission = {
          id: `custom-${Date.now()}`,
          title,
          briefing,
          type: type || "decode",
          priority: priority || 5,
          deadlineHours: deadlineHours || 72,
          narrativeDelivery: narrativeDelivery !== false,
          assignedAt: new Date().toISOString(),
        };

        const updatedMissions = [...currentMissions, newMission];

        await prisma.playerProfile.upsert({
          where: { userId: id },
          update: { assignedMissions: updatedMissions },
          create: { userId: id, assignedMissions: updatedMissions },
        });

        return NextResponse.json({ success: true, mission: newMission });
      }

      case "remove": {
        const { missionId } = body;
        
        const profile = await prisma.playerProfile.findUnique({
          where: { userId: id },
          select: { assignedMissions: true },
        });

        const currentMissions = (profile?.assignedMissions as any[]) || [];
        const updatedMissions = currentMissions.filter((m: any) => m.id !== missionId);

        await prisma.playerProfile.update({
          where: { userId: id },
          data: { assignedMissions: updatedMissions },
        });

        return NextResponse.json({ success: true });
      }

      case "reorder": {
        const { missionIds } = body;
        
        const profile = await prisma.playerProfile.findUnique({
          where: { userId: id },
          select: { assignedMissions: true },
        });

        const currentMissions = (profile?.assignedMissions as any[]) || [];
        const missionMap = new Map(currentMissions.map((m: any) => [m.id, m]));
        const reorderedMissions = missionIds
          .map((id: string) => missionMap.get(id))
          .filter(Boolean);

        await prisma.playerProfile.update({
          where: { userId: id },
          data: { assignedMissions: reorderedMissions },
        });

        return NextResponse.json({ success: true });
      }

      case "assign_template": {
        const { templateId, createMissionRun } = body;

        const definitionId = await ensureMissionDefinitionForReference(templateId);
        const template = await prisma.missionDefinition.findUnique({
          where: { id: definitionId },
        });

        if (!template) {
          return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        // If createMissionRun is true, create a real MissionRun
        if (createMissionRun) {
          let missionRun;
          try {
            missionRun = await acceptMission({
              missionId: definitionId,
              userId: id,
            });
          } catch (e: any) {
            if (typeof e?.message === "string" && e.message.includes("active mission")) {
              const existing = await getLatestOpenMissionRun(id);
              return NextResponse.json(
                {
                  error: e.message,
                  activeMission: existing
                    ? {
                        id: existing.id,
                        title: existing.mission.title,
                        status: existing.status,
                      }
                    : null,
                },
                { status: 409 },
              );
            }
            throw e;
          }

          return NextResponse.json({
            success: true,
            mission: {
              id: missionRun.id,
              definitionId: template.id,
              title: template.title,
              briefing: template.prompt,
              type: template.type,
              status: missionRun.status,
              createdAt: new Date().toISOString(),
            },
            missionRun: {
              id: missionRun.id,
              status: missionRun.status,
            },
          });
        }

        // Otherwise, use narrative-only assignment (for AI delivery)
        const profile = await prisma.playerProfile.findUnique({
          where: { userId: id },
          select: { assignedMissions: true },
        });

        const currentMissions = (profile?.assignedMissions as any[]) || [];

        const newMission = {
          id: `template-${template.id}-${Date.now()}`,
          templateId: template.id,
          title: template.title,
          briefing: template.prompt,
          type: template.type,
          priority: 5,
          narrativeDelivery: true,
          assignedAt: new Date().toISOString(),
        };

        const updatedMissions = [...currentMissions, newMission];

        await prisma.playerProfile.upsert({
          where: { userId: id },
          update: { assignedMissions: updatedMissions },
          create: { userId: id, assignedMissions: updatedMissions },
        });

        return NextResponse.json({ success: true, mission: newMission });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Admin agent missions POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
