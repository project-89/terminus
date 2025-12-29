import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { recordDream, getUserDreams, getDreamPatterns, analyzeDream } from "@/app/lib/server/dreamService";

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
      case "record": {
        const { content, symbols, emotions } = body;
        if (!content) {
          return NextResponse.json({ error: "Dream content required" }, { status: 400 });
        }
        const dream = await recordDream({
          userId,
          content,
          manualSymbols: symbols,
          manualEmotions: emotions,
        });
        return NextResponse.json(dream);
      }

      case "list": {
        const { limit, symbol } = body;
        const dreams = await getUserDreams({ userId, limit, symbol });
        return NextResponse.json({ dreams });
      }

      case "patterns": {
        const patterns = await getDreamPatterns(userId);
        return NextResponse.json(patterns);
      }

      case "analyze": {
        const { dreamId, analysis } = body;
        if (!dreamId || !analysis) {
          return NextResponse.json({ error: "dreamId and analysis required" }, { status: 400 });
        }
        await analyzeDream(dreamId, analysis);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Dream API error:", error);
    return NextResponse.json(
      { error: "Dream processing failed" },
      { status: 500 }
    );
  }
}
