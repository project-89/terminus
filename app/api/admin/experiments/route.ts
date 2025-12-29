import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const experiments = await prisma.experiment.findMany({
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
        events: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const byHypothesisTheme: Record<string, number> = {};
    const resultCounts = { pass: 0, fail: 0, inconclusive: 0 };

    for (const exp of experiments) {
      const words = exp.hypothesis.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 5) {
          byHypothesisTheme[word] = (byHypothesisTheme[word] || 0) + 1;
        }
      }
      
      for (const event of exp.events) {
        if (event.result === "pass") resultCounts.pass++;
        else if (event.result === "fail") resultCounts.fail++;
        else resultCounts.inconclusive++;
      }
    }

    const topThemes = Object.entries(byHypothesisTheme)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([theme, count]) => ({ theme, count }));

    return NextResponse.json({
      experiments: experiments.map(exp => ({
        id: exp.id,
        createdAt: exp.createdAt,
        hypothesis: exp.hypothesis,
        task: exp.task,
        successCriteria: exp.successCriteria,
        timeoutS: exp.timeoutS,
        title: exp.title,
        agent: {
          id: exp.user.id,
          handle: exp.user.handle,
          codename: exp.user.profile?.codename,
        },
        events: exp.events.map(e => ({
          id: e.id,
          createdAt: e.createdAt,
          observation: e.observation,
          result: e.result,
          score: e.score,
        })),
        latestResult: exp.events[exp.events.length - 1]?.result,
        latestScore: exp.events[exp.events.length - 1]?.score,
      })),
      stats: {
        total: experiments.length,
        resultCounts,
        topThemes,
        avgEventsPerExperiment: experiments.length > 0 
          ? experiments.reduce((acc, e) => acc + e.events.length, 0) / experiments.length 
          : 0,
      },
    });
  } catch (error: any) {
    console.error("Admin experiments error:", error);
    return NextResponse.json({ error: "Failed to fetch experiments" }, { status: 500 });
  }
}
