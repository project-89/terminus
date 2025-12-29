import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const templates = await prisma.fieldMissionTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ templates });
  } catch (error: any) {
    if (error.code === "P2021") {
      return NextResponse.json({ templates: [], needsMigration: true });
    }
    console.error("Field templates error:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "create": {
        const { type, title, briefing, objectives, difficulty, deadlineHours, location } = body;
        const template = await prisma.fieldMissionTemplate.create({
          data: {
            type,
            title,
            briefing,
            objectives: objectives || [],
            difficulty: difficulty || "initiate",
            deadlineHours: deadlineHours || 72,
            location: location || null,
            active: true,
          },
        });
        return NextResponse.json(template);
      }

      case "update": {
        const { id, ...updates } = body;
        delete updates.action;
        const template = await prisma.fieldMissionTemplate.update({
          where: { id },
          data: updates,
        });
        return NextResponse.json(template);
      }

      case "toggle": {
        const { id } = body;
        const current = await prisma.fieldMissionTemplate.findUnique({ where: { id } });
        if (!current) {
          return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }
        const template = await prisma.fieldMissionTemplate.update({
          where: { id },
          data: { active: !current.active },
        });
        return NextResponse.json(template);
      }

      case "delete": {
        const { id } = body;
        await prisma.fieldMissionTemplate.delete({ where: { id } });
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    if (error.code === "P2021") {
      return NextResponse.json({ error: "Table not found - run migration", needsMigration: true }, { status: 500 });
    }
    console.error("Field templates POST error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
