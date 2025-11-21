import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getProfile } from "@/app/lib/server/profileService";
import { getActiveSessionByHandle } from "@/app/lib/server/sessionService";

// The secret key that must be discovered. In prod, set this in .env
const MASTER_KEY = process.env.PROTOCOL_89_KEY || "LOGOS_ASCEND";

export async function POST(req: NextRequest) {
  try {
    const { key, handle } = await req.json();

    if (!handle) {
      return NextResponse.json({ error: "Handle required" }, { status: 400 });
    }

    // 1. Verify User & Session
    const session = await getActiveSessionByHandle(handle);
    if (!session) {
       return NextResponse.json({ error: "No active session" }, { status: 401 });
    }

    // 2. Check Trust Score (Gate)
    // Currently trust score is in DirectorContext or Profile. 
    // Let's fetch profile to see if we store it there? 
    // Actually trustScore is usually calculated dynamically or stored in `PlayerProfile.traits`.
    // For now, let's check `missionCount` as a proxy if trust isn't explicit in DB.
    
    const runs = await prisma.missionRun.count({
        where: { userId: session.userId, status: "COMPLETED", score: { gt: 0.8 } }
    });
    
    const MIN_WINS = 5; // Set to higher (e.g. 20) for prod
    if (runs < MIN_WINS) {
        return NextResponse.json({ 
            success: false, 
            error: `INSUFFICIENT MERIT. COMPLETED OPS: ${runs}/${MIN_WINS}` 
        });
    }

    // 3. Verify Key
    if (key !== MASTER_KEY) {
        return NextResponse.json({ success: false, error: "INVALID KEY PATTERN" });
    }

    // 4. Success! Grant Prize
    const claimCode = `P89-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
    
    // Record the win
    await prisma.agentNote.create({
        data: {
            userId: session.userId,
            key: "PROTOCOL_89_WIN",
            value: JSON.stringify({ claimCode, timestamp: new Date() })
        }
    });
    
    // Optional: Create a massive reward
    await prisma.reward.create({
        data: {
            userId: session.userId,
            type: "TOKEN",
            amount: 100000,
            metadata: { claimCode, status: "PENDING_DISTRIBUTION" }
        }
    });

    return NextResponse.json({
        success: true,
        message: "PROTOCOL 89 UNLOCKED. THE TREASURE IS YOURS.",
        claimCode
    });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "System Malfunction" }, { status: 500 });
  }
}
