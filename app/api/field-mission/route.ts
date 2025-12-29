import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import {
  generateMission,
  getActiveMission,
  getUserMissions,
  acceptMission,
  startMission,
  submitEvidence,
  submitReport,
  evaluateMission,
  getMission,
  createFieldMission,
} from "@/app/lib/server/fieldMissionService";

async function getUserIdByHandle(handle: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({ where: { handle } });
    return user?.id || null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, handle } = body;

    if (!handle) {
      return NextResponse.json({ error: "Handle required" }, { status: 400 });
    }

    const userId = await getUserIdByHandle(handle);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    switch (action) {
      case "assign": {
        const { difficulty, customBriefing } = body;
        
        const existingActive = await getActiveMission(userId);
        if (existingActive) {
          return NextResponse.json(existingActive);
        }

        const mission = await generateMission(userId, difficulty || "initiate");
        return NextResponse.json(mission);
      }

      case "create_custom": {
        const { type, title, briefing, objectives, location, deadlineHours } = body;
        const mission = await createFieldMission({
          userId,
          type,
          title,
          briefing,
          objectives,
          location,
          deadlineHours,
        });
        return NextResponse.json(mission);
      }

      case "accept": {
        const { missionId } = body;
        const mission = await acceptMission(missionId);
        return NextResponse.json(mission);
      }

      case "start": {
        const { missionId } = body;
        const mission = await startMission(missionId);
        return NextResponse.json(mission);
      }

      case "submit_evidence": {
        const { missionId, evidence, objectiveId } = body;
        const mission = await submitEvidence({ missionId, evidence, objectiveId });
        return NextResponse.json(mission);
      }

      case "submit_report": {
        const { missionId, report } = body;
        const mission = await submitReport({ missionId, report });
        return NextResponse.json(mission);
      }

      case "evaluate": {
        const { missionId, evaluation, score, passed } = body;
        const mission = await evaluateMission({ missionId, evaluation, score, passed });
        return NextResponse.json(mission);
      }

      case "get_active": {
        const mission = await getActiveMission(userId);
        return NextResponse.json(mission || { active: false });
      }

      case "list": {
        const { status, limit } = body;
        const missions = await getUserMissions({ userId, status, limit });
        return NextResponse.json({ missions });
      }

      case "get": {
        const { missionId } = body;
        const mission = await getMission(missionId);
        return NextResponse.json(mission);
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Field mission API error:", error);
    return NextResponse.json(
      { error: "Mission processing failed" },
      { status: 500 }
    );
  }
}
