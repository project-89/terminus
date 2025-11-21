import { NextRequest, NextResponse } from "next/server";
import { rewardService } from "@/app/lib/services/rewardService";
import prisma from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const userId = searchParams.get("userId"); // In real app, get from session/auth
  
  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  try {
    const [balance, catalog] = await Promise.all([
      rewardService.getBalance(userId),
      rewardService.getCatalog()
    ]);

    return NextResponse.json({ balance, catalog });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId, action, itemId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  try {
    if (action === "redeem") {
       if (!itemId) return NextResponse.json({ error: "ItemId required" }, { status: 400 });
       
       const result = await rewardService.redeem(userId, itemId);
       return NextResponse.json(result);
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Redemption failed" }, { status: 400 });
  }
}
