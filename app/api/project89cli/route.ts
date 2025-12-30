import { NextRequest, NextResponse } from "next/server";
import { getSessionById, getActiveSessionByHandle } from "@/app/lib/server/sessionService";
import { getNextMission, acceptMission } from "@/app/lib/server/missionService";
import { submitMissionReport } from "@/app/lib/server/missionService";
import { getProfile, upsertProfile } from "@/app/lib/server/profileService";
import { buildDirectorContext } from "@/app/lib/server/directorService";
import { recordMemoryEvent } from "@/app/lib/server/memoryService";
import prisma from "@/app/lib/prisma";

/**
 * CLI-style command processing endpoint for programmatic access
 * Supports commands like: help, status, mission, report, profile, reset
 */
export async function POST(req: NextRequest) {
  try {
    const { command, handle, sessionId } = await req.json();

    if (!command) {
      return NextResponse.json(
        { error: "Command required", usage: "POST with {command, handle?, sessionId?}" },
        { status: 400 }
      );
    }

    // Parse command and arguments
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    // Get or create session
    let session = sessionId ? await getSessionById(sessionId) : null;
    if (!session && handle) {
      session = await getActiveSessionByHandle(handle);
    }

    switch (cmd) {
      case "help":
        return NextResponse.json({
          success: true,
          output: `[AVAILABLE COMMANDS]
` +
                 `━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` +
                 `help - Show this help message\n` +
                 `status - Show current session status\n` +
                 `mission - Request next mission\n` +
                 `report <text> - Submit mission report\n` +
                 `profile - View agent profile\n` +
                 `reset - Start new session\n` +
                 `\nUsage: POST /api/project89cli\n` +
                 `Body: {command, handle?, sessionId?}`
        });

      case "status":
        if (!session) {
          return NextResponse.json({
            success: false,
            error: "No active session. Provide handle or sessionId."
          });
        }

        const profile = await getProfile(session.userId);
        const directorContext = await buildDirectorContext({ sessionId: session.id, userId: session.userId });
        const activeMission = await prisma.missionRun.findFirst({
          where: {
            userId: session.userId,
            status: { in: ["ACCEPTED", "SUBMITTED", "REVIEWING"] }
          },
          include: { mission: true }
        });

        return NextResponse.json({
          success: true,
          data: {
            sessionId: session.id,
            handle: session.handle,
            trustLevel: directorContext.player?.trustScore || 0,
            phase: directorContext.director?.phase,
            profile: profile ? {
              traits: profile.traits,
              skills: profile.skills
            } : null,
            activeMission: activeMission ? {
              id: activeMission.id,
              title: activeMission.mission.title,
              status: activeMission.status
            } : null
          },
          output: `[SESSION: ${session.id}]\n` +
                 `Handle: ${session.handle}\n` +
                 `Trust: ${directorContext.player?.trustScore || 0}\n` +
                 `Phase: ${directorContext.director?.phase}\n` +
                 (activeMission ? `\nActive Mission: ${activeMission.mission.title}` : "")
        });

      case "mission":
        if (!session) {
          return NextResponse.json({
            success: false,
            error: "No active session. Provide handle or sessionId."
          });
        }

        const mission = await getNextMission(session.userId);
        if (!mission) {
          return NextResponse.json({
            success: true,
            output: "No missions available. Continue exploring."
          });
        }

        const missionRun = await acceptMission({
          userId: session.userId,
          missionId: mission.id,
          sessionId: session.id
        });
        
        // Record mission acceptance
        await recordMemoryEvent({
          userId: session.userId,
          sessionId: session.id,
          type: "MISSION",
          content: `Accepted mission: ${mission.title}`,
          tags: ["mission", mission.type, ...(mission.tags || [])]
        });

        return NextResponse.json({
          success: true,
          data: {
            missionRunId: missionRun.id,
            mission: {
              id: mission.id,
              title: mission.title,
              prompt: mission.prompt,
              type: mission.type,
              track: mission.tags?.find((t: string) => ['logic', 'perception', 'creation', 'field'].includes(t)) || 'general'
            }
          },
          output: `[MISSION ACTIVATED]\n` +
                 `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                 `${mission.title}\n\n` +
                 `${mission.prompt}\n\n` +
                 `Type: ${mission.type}\n` +
                 `Tags: ${mission.tags?.join(', ') || 'none'}\n` +
                 `Run ID: ${missionRun.id}`
        });

      case "report":
        if (!session) {
          return NextResponse.json({
            success: false,
            error: "No active session."
          });
        }

        if (!args) {
          return NextResponse.json({
            success: false,
            error: "Report content required. Usage: report <your findings>"
          });
        }

        // Find active mission run
        const activeRun = await prisma.missionRun.findFirst({
          where: {
            userId: session.userId,
            status: { in: ["ACCEPTED", "SUBMITTED", "REVIEWING"] }
          },
          include: { mission: true }
        });

        if (!activeRun) {
          return NextResponse.json({
            success: false,
            error: "No active mission. Request a mission first."
          });
        }

        const result = await submitMissionReport({
          missionRunId: activeRun.id,
          payload: args
        });

        return NextResponse.json({
          success: true,
          data: {
            score: result.score,
            status: result.status,
            reward: result.reward
          },
          output: `[REPORT ACCEPTED]\n` +
                 `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                 (result.score ? `Score: ${Math.round(result.score * 100)}/100\n` : "") +
                 (result.feedback ? `Feedback: ${result.feedback}\n` : "") +
                 (result.reward ? `Reward: ${result.reward.amount} ${result.reward.type}` : "")
        });

      case "profile":
        if (!session) {
          return NextResponse.json({
            success: false,
            error: "No active session."
          });
        }

        const playerProfile = await getProfile(session.userId);
        if (!playerProfile) {
          return NextResponse.json({
            success: true,
            output: "Profile not initialized. Continue playing to build your profile."
          });
        }

        return NextResponse.json({
          success: true,
          data: playerProfile,
          output: `[AGENT PROFILE]\n` +
                 `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                 `Traits: ${JSON.stringify(playerProfile.traits || {})}\n` +
                 `Skills: ${JSON.stringify(playerProfile.skills || {})}\n` +
                 `Preferences: ${JSON.stringify(playerProfile.preferences || {})}`
        });

      case "reset":
        const newHandle = handle || `agent_${Date.now()}`;
        let user = await prisma.user.findUnique({ where: { handle: newHandle } });
        if (!user) {
          user = await prisma.user.create({ data: { handle: newHandle } });
        }
        const newSession = await prisma.gameSession.create({
          data: {
            userId: user.id,
            status: "OPEN"
          }
        });

        return NextResponse.json({
          success: true,
          data: {
            sessionId: newSession.id,
            handle: newHandle
          },
          output: `[NEW SESSION INITIALIZED]\n` +
                 `Session ID: ${newSession.id}\n` +
                 `Handle: ${newHandle}\n` +
                 `\nThe Logos awaits your commands.`
        });

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown command: ${cmd}`,
          output: "Type 'help' for available commands."
        });
    }
  } catch (error: any) {
    console.error("[project89cli] Error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Internal error processing command" 
      },
      { status: 500 }
    );
  }
}