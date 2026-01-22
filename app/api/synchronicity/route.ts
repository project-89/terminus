import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import {
  recordSynchronicity,
  getUserSynchronicities,
  getSynchronicitySummary,
  acknowledgeSynchronicity,
} from "@/app/lib/server/synchronicityService";

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
    const { action, handle, sessionId } = body;

    // Resolve userId from handle or sessionId
    let userId: string | null = null;
    if (handle) {
      userId = await getUserIdByHandle(handle);
    } else if (sessionId) {
      try {
        const session = await prisma.session.findUnique({ where: { id: sessionId } });
        userId = session?.userId || null;
      } catch {
        userId = null;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    switch (action) {
      case "log": {
        // Log a synchronicity observed by AI or player
        const { pattern, description, significance } = body;
        if (!pattern) {
          return NextResponse.json({ error: "Pattern required" }, { status: 400 });
        }

        const sigMap: Record<string, number> = {
          low: 0.3,
          medium: 0.5,
          high: 0.8,
        };
        const sigValue = typeof significance === "number"
          ? significance
          : sigMap[significance] || 0.5;

        const record = await recordSynchronicity({
          userId,
          pattern,
          value: { description, source: "ai_observed" },
          context: description || pattern,
          significance: sigValue,
        });
        return NextResponse.json({ synchronicity: record });
      }

      case "list": {
        const { limit, minSignificance } = body;
        const synchronicities = await getUserSynchronicities({ userId, limit, minSignificance });
        return NextResponse.json({ synchronicities });
      }

      case "summary": {
        const summary = await getSynchronicitySummary(userId);
        return NextResponse.json(summary);
      }

      case "acknowledge": {
        const { id, note } = body;
        if (!id) {
          return NextResponse.json({ error: "Synchronicity ID required" }, { status: 400 });
        }
        await acknowledgeSynchronicity(id, note);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Synchronicity API error:", error);
    return NextResponse.json(
      { error: "Synchronicity processing failed" },
      { status: 500 }
    );
  }
}
