import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { LAYER_NAMES } from "@/app/lib/server/trustService";

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
        const rewards = await prisma.reward.aggregate({
          where: { userId },
          _sum: { amount: true },
        });
        const daysActive = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        
        return NextResponse.json({
          userId: user.id,
          agentId: user.agentId,
          trustScore: profile.trustScore,
          layer: profile.layer,
          layerName: LAYER_NAMES[profile.layer] || "Unknown",
          daysActive,
          isReferred: !!user.referredById,
          identityLocked: user.identityLocked,
          points: rewards._sum?.amount || 0,
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
        await prisma.reward.deleteMany({ where: { userId } });
        if (amount > 0) {
          await prisma.reward.create({
            data: {
              userId,
              type: "CREDIT",
              amount,
              metadata: { reason: "dev_command" },
            },
          });
        }
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
        const sessionIds = sessions.map(s => s.id);
        if (sessionIds.length > 0) {
          await prisma.gameMessage.deleteMany({ where: { gameSessionId: { in: sessionIds } } });
          await prisma.gameSession.deleteMany({ where: { userId } });
        }
        return NextResponse.json({ message: "Reset to fresh state" });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[DEV API]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
