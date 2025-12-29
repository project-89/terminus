import { NextResponse } from "next/server";
import { 
  generateReferralCode, 
  getReferralStats, 
  processReferral,
  getLeaderboard 
} from "@/app/lib/server/referralService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const action = searchParams.get("action");

  try {
    if (action === "leaderboard") {
      const leaderboard = await getLeaderboard();
      return NextResponse.json(leaderboard);
    }

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    if (action === "generate") {
      const code = await generateReferralCode(userId);
      return NextResponse.json({ code });
    }

    const stats = await getReferralStats(userId);
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Referral GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, referralCode } = body;

    if (action === "apply") {
      if (!userId || !referralCode) {
        return NextResponse.json(
          { error: "userId and referralCode required" },
          { status: 400 }
        );
      }

      const result = await processReferral(userId, referralCode);
      
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ 
        success: true, 
        referrerId: result.referrerId,
        message: "Referral applied successfully" 
      });
    }

    if (action === "generate") {
      if (!userId) {
        return NextResponse.json({ error: "userId required" }, { status: 400 });
      }
      
      const code = await generateReferralCode(userId);
      return NextResponse.json({ code });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Referral POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
