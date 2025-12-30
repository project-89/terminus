import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dreams = await prisma.dreamEntry.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            handle: true,
            profile: {
              select: {
                codename: true,
              },
            },
          },
        },
      },
    });

    const symbolCounts: Record<string, number> = {};
    const emotionCounts: Record<string, number> = {};
    const symbolConnections: Record<string, Set<string>> = {};
    let totalLucidity = 0;
    let lucidCount = 0;

    for (const dream of dreams) {
      for (const symbol of dream.symbols) {
        symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
        if (!symbolConnections[symbol]) {
          symbolConnections[symbol] = new Set();
        }
        for (const other of dream.symbols) {
          if (other !== symbol) {
            symbolConnections[symbol].add(other);
          }
        }
      }
      for (const emotion of dream.emotions) {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      }
      if (dream.lucidity !== null) {
        totalLucidity += dream.lucidity;
        lucidCount++;
      }
    }

    const topSymbols = Object.entries(symbolCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([symbol, count]) => ({ 
        symbol, 
        count, 
        connections: Array.from(symbolConnections[symbol] || []).slice(0, 5) 
      }));

    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([emotion, count]) => ({ emotion, count }));

    const recurringDreams = dreams.filter((d: any) => d.recurrence > 1);

    return NextResponse.json({
      dreams: dreams.map((d: any) => ({
        id: d.id,
        createdAt: d.createdAt,
        content: d.content,
        symbols: d.symbols,
        emotions: d.emotions,
        lucidity: d.lucidity,
        recurrence: d.recurrence,
        analysis: d.analysis,
        agent: {
          id: d.user.id,
          handle: d.user.handle,
          codename: d.user.profile?.codename,
        },
      })),
      stats: {
        total: dreams.length,
        avgLucidity: lucidCount > 0 ? totalLucidity / lucidCount : 0,
        recurringCount: recurringDreams.length,
        uniqueSymbols: Object.keys(symbolCounts).length,
        uniqueEmotions: Object.keys(emotionCounts).length,
        topSymbols,
        topEmotions,
      },
    });
  } catch (error: any) {
    console.error("Admin dreams error:", error);
    return NextResponse.json({ error: "Failed to fetch dreams" }, { status: 500 });
  }
}
