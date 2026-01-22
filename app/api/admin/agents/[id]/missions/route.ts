import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { validateAdminAuth } from "@/app/lib/server/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const profile = await prisma.playerProfile.findUnique({
      where: { userId: id },
      select: { assignedMissions: true },
    });

    const missionRuns = await prisma.missionRun.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { mission: true },
    });

    return NextResponse.json({
      assignedMissions: profile?.assignedMissions || [],
      missionHistory: missionRuns.map((r: any) => ({
        id: r.id,
        title: r.mission.title,
        type: r.mission.type,
        status: r.status,
        score: r.score,
        createdAt: r.createdAt,
      })),
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
        const { title, briefing, type, priority, deadlineHours, narrativeDelivery } = body;
        
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
        const { templateId } = body;
        
        const template = await prisma.missionDefinition.findUnique({
          where: { id: templateId },
        });
        
        if (!template) {
          return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

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
