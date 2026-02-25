import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle");
  const userId = searchParams.get("userId");

  if (!handle && !userId) {
    return NextResponse.json({ error: "handle or userId required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: userId
        ? { id: userId }
        : { handle: handle || undefined },
      select: {
        referralPoints: true,
        rewards: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            amount: true,
            type: true,
            metadata: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      points: user.referralPoints,
      recentRewards: user.rewards,
    });
  } catch (error: any) {
    console.error("Points GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, handle, amount, reason, category, experimentId } = body;

    if (action === "award") {
      if (!handle || !amount || !reason) {
        return NextResponse.json(
          { error: "handle, amount, and reason required" },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { handle },
        select: { id: true, referralPoints: true },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const clampedAmount = Math.min(500, Math.max(1, amount));

      const [reward, updatedUser] = await prisma.$transaction([
        prisma.reward.create({
          data: {
            userId: user.id,
            amount: clampedAmount,
            type: "LOGOS_AWARD",
            metadata: {
              reason,
              category: category || "other",
              source: "adventure",
            },
          },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { referralPoints: { increment: clampedAmount } },
          select: { referralPoints: true },
        }),
      ]);

      if (experimentId) {
        try {
          await prisma.experiment.update({
            where: { id: experimentId },
            data: {
              notes: {
                push: `Awarded ${clampedAmount} points: ${reason}`,
              },
            },
          });
        } catch {
        }
      }

      return NextResponse.json({
        success: true,
        awarded: clampedAmount,
        newTotal: updatedUser.referralPoints,
        rewardId: reward.id,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Points POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
