import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { LAYER_NAMES, getTrustState } from "@/app/lib/server/trustService";
import { listRecentExperiments } from "@/app/lib/server/experimentService";
import { loadPuzzles, getPuzzleMetadata } from "@/app/lib/game/puzzleLoader";

const isDev = process.env.NODE_ENV === "development";

export async function POST(req: NextRequest) {
  if (!isDev) {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const { userId, action, value } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = user.profile || await prisma.playerProfile.create({
      data: { userId },
    });

    switch (action) {
      case "status": {
        const trustState = await getTrustState(userId);
        const daysActive = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        
        return NextResponse.json({
          userId: user.id,
          agentId: user.agentId,
          trustScore: trustState.trustScore,
          effectiveTrustScore: trustState.decayedScore,
          layer: trustState.layer,
          layerName: LAYER_NAMES[trustState.layer] || "Unknown",
          pendingCeremony: trustState.pendingCeremony,
          daysActive,
          isReferred: !!user.referredById,
          identityLocked: user.identityLocked,
          points: user.referralPoints || 0,
        });
      }

      case "trust": {
        const trustScore = Math.max(0, Math.min(1, parseFloat(value) || 0));
        await prisma.playerProfile.update({
          where: { userId },
          data: { trustScore, lastActiveAt: new Date() },
        });
        return NextResponse.json({ 
          message: `Trust score set to ${(trustScore * 100).toFixed(1)}%`,
          newValue: trustScore,
        });
      }

      case "layer": {
        const layer = Math.max(0, Math.min(5, parseInt(value) || 0));
        const thresholds = [0, 0.10, 0.25, 0.50, 0.75, 0.92];
        const trustScore = thresholds[layer] + 0.01;
        
        await prisma.playerProfile.update({
          where: { userId },
          data: { 
            layer, 
            trustScore,
            lastActiveAt: new Date(),
          },
        });
        return NextResponse.json({ 
          message: `Layer set to ${layer} (${LAYER_NAMES[layer]})`,
          newValue: layer,
        });
      }

      case "days": {
        const days = Math.max(0, parseInt(value) || 0);
        const newDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        await prisma.user.update({
          where: { id: userId },
          data: { createdAt: newDate },
        });
        return NextResponse.json({ 
          message: `Account age set to ${days} days`,
          newValue: days,
        });
      }

      case "points": {
        const amount = parseInt(value) || 0;
        await prisma.user.update({
          where: { id: userId },
          data: { referralPoints: Math.max(0, amount) },
        });
        return NextResponse.json({ 
          message: `Points set to ${amount}`,
          newValue: amount,
        });
      }

      case "graduate": {
        const newDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        await prisma.user.update({
          where: { id: userId },
          data: { 
            createdAt: newDate,
            identityLocked: true,
            agentId: user.agentId || `AGENT-${userId.slice(-4).toUpperCase()}`,
            referralCode: user.referralCode || `P89-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          },
        });
        await prisma.playerProfile.update({
          where: { userId },
          data: { 
            layer: 5, 
            trustScore: 0.95,
            lastActiveAt: new Date(),
          },
        });
        return NextResponse.json({ 
          message: "Graduated to Layer 5 operative! Visit /operative for your dashboard.",
          newValue: 5,
        });
      }

      case "referred": {
        if (user.referredById) {
          await prisma.user.update({
            where: { id: userId },
            data: { referredById: null },
          });
          return NextResponse.json({ message: "Removed referral (now isolated)" });
        } else {
          let referrer = await prisma.user.findFirst({
            where: { id: { not: userId } },
          });
          if (!referrer) {
            referrer = await prisma.user.create({
              data: { 
                handle: `dev_referrer_${Date.now()}`,
                referralCode: `P89-DEV${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
              },
            });
          }
          await prisma.user.update({
            where: { id: userId },
            data: { referredById: referrer.id },
          });
          return NextResponse.json({ message: "Added referral (now activated)" });
        }
      }

      case "lock": {
        const newValue = !user.identityLocked;
        await prisma.user.update({
          where: { id: userId },
          data: { 
            identityLocked: newValue,
            agentId: newValue ? (user.agentId || `AGENT-${userId.slice(-4).toUpperCase()}`) : user.agentId,
          },
        });
        return NextResponse.json({ 
          message: `Identity ${newValue ? "locked" : "unlocked"}`,
          newValue,
        });
      }

      case "reset": {
        await prisma.playerProfile.update({
          where: { userId },
          data: {
            layer: 0,
            trustScore: 0,
            lastActiveAt: null,
            pendingCeremony: null,
            layerCeremoniesCompleted: [],
          },
        });
        await prisma.user.update({
          where: { id: userId },
          data: {
            createdAt: new Date(),
            identityLocked: false,
            referredById: null,
          },
        });
        await prisma.reward.deleteMany({ where: { userId } });
        const sessions = await prisma.gameSession.findMany({ where: { userId }, select: { id: true } });
        const sessionIds = sessions.map((s: any) => s.id);
        if (sessionIds.length > 0) {
          await prisma.gameMessage.deleteMany({ where: { gameSessionId: { in: sessionIds } } });
          await prisma.gameSession.deleteMany({ where: { userId } });
        }
        return NextResponse.json({ message: "Reset to fresh state" });
      }

      // === DEBUG COMMANDS ===

      case "experiment": {
        // Get current active experiment for this user
        const experiments = await listRecentExperiments({ userId, limit: 5 });
        const activeSession = await prisma.gameSession.findFirst({
          where: { userId, status: "OPEN" },
          orderBy: { createdAt: "desc" },
        });

        // Also check agentNotes for experiment data
        const experimentNotes = await prisma.agentNote.findMany({
          where: {
            userId,
            type: { in: ["experiment_create", "experiment_note", "experiment_result"] },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        });

        return NextResponse.json({
          experiments: experiments.map((e: any) => ({
            id: e.id,
            type: e.type,
            name: e.name,
            hypothesis: e.hypothesis,
            status: e.status,
            createdAt: e.createdAt,
          })),
          experimentNotes: experimentNotes.map((n: any) => ({
            type: n.type,
            content: n.content,
            createdAt: n.createdAt,
          })),
          sessionId: activeSession?.id,
        });
      }

      case "tools": {
        // Get recent tool calls from agentNotes
        const toolNotes = await prisma.agentNote.findMany({
          where: {
            userId,
            type: { startsWith: "tool:" },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        });

        // Also get from game messages that might have tool data
        const recentMessages = await prisma.gameMessage.findMany({
          where: {
            gameSession: { userId },
            role: "assistant",
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            content: true,
            createdAt: true,
            metadata: true,
          },
        });

        return NextResponse.json({
          toolNotes: toolNotes.map((n: any) => ({
            tool: n.type.replace("tool:", ""),
            content: n.content,
            createdAt: n.createdAt,
          })),
          recentMessages: recentMessages.length,
        });
      }

      case "state": {
        // Get comprehensive session/game state
        const activeSession = await prisma.gameSession.findFirst({
          where: { userId, status: "OPEN" },
          orderBy: { createdAt: "desc" },
          include: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 5,
              select: { role: true, createdAt: true },
            },
          },
        });

        const missionRuns = await prisma.missionRun.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 3,
          include: { mission: { select: { title: true } } },
        });

        return NextResponse.json({
          user: {
            id: user.id,
            handle: user.handle,
            agentId: user.agentId,
            identityLocked: user.identityLocked,
            createdAt: user.createdAt,
          },
          profile: {
            trustScore: profile.trustScore,
            layer: profile.layer,
            layerName: LAYER_NAMES[profile.layer],
            lastActiveAt: profile.lastActiveAt,
          },
          session: activeSession ? {
            id: activeSession.id,
            status: activeSession.status,
            messageCount: activeSession.messages.length,
            createdAt: activeSession.createdAt,
          } : null,
          recentMissions: missionRuns.map((mr: any) => ({
            id: mr.id,
            title: mr.mission?.title,
            status: mr.status,
            score: mr.score,
          })),
        });
      }

      case "puzzles": {
        // Get puzzle status from game state
        const activeSession = await prisma.gameSession.findFirst({
          where: { userId, status: "OPEN" },
          orderBy: { createdAt: "desc" },
        });

        // Load all puzzles from JSON files
        const allPuzzles = loadPuzzles();

        // Get solved puzzles from canonical saved game state
        let solvedPuzzles: string[] = [];
        if (activeSession?.gameState && typeof activeSession.gameState === "object") {
          const gameState = activeSession.gameState as any;
          solvedPuzzles = Array.isArray(gameState.puzzlesSolved) ? gameState.puzzlesSolved : [];
        }

        // Also check agentNotes for puzzle completions
        const puzzleNotes = await prisma.agentNote.findMany({
          where: {
            userId,
            type: { in: ["puzzle_solved", "puzzle_hint", "puzzle_progress"] },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        });

        return NextResponse.json({
          totalPuzzles: allPuzzles.length,
          solvedCount: solvedPuzzles.length,
          solvedPuzzles,
          puzzles: allPuzzles.map((p: any) => {
            const meta = getPuzzleMetadata(p.id);
            return {
              id: p.id,
              name: p.name,
              solved: solvedPuzzles.includes(p.id),
              region: meta?.region,
              layer: meta?.layer,
              dependsOn: p.dependsOn || [],
            };
          }),
          puzzleNotes: puzzleNotes.map((n: any) => ({
            type: n.type,
            content: n.content,
            createdAt: n.createdAt,
          })),
        });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[DEV API]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
