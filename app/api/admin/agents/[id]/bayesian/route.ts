import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { validateAdminAuth } from "@/app/lib/server/adminAuth";
import { getBayesianSnapshot } from "@/app/lib/server/bayes/orchestrator";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const agent = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const snapshot = await getBayesianSnapshot(id);
    const summaries = snapshot.summaries.slice(0, 60).map((summary) => ({
      ...summary,
      variables: [...summary.variables].sort((a, b) => b.sampleSize - a.sampleSize),
    }));

    return NextResponse.json({
      agentId: id,
      generatedAt: snapshot.generatedAt,
      stats: {
        hypothesisCount: summaries.length,
        activeHypotheses: summaries.filter((summary) => summary.status === "active").length,
        queueSize: snapshot.queue.length,
        historyCount: snapshot.history.length,
      },
      globalTraits: snapshot.globalTraits,
      summaries,
      queue: snapshot.queue.slice(0, 20),
      history: snapshot.history.slice(-120).reverse(),
    });
  } catch (error) {
    console.error("Admin agent bayesian error:", error);
    return NextResponse.json({ error: "Failed to fetch bayesian snapshot" }, { status: 500 });
  }
}
