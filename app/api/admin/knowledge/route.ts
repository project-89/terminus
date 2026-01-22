import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { validateAdminAuth } from "@/app/lib/server/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  try {
    const [nodes, edges] = await Promise.all([
      prisma.knowledgeNode.findMany({
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
      }),
      prisma.knowledgeEdge.findMany({
        include: {
          fromNode: {
            select: { id: true, label: true, type: true },
          },
          toNode: {
            select: { id: true, label: true, type: true },
          },
        },
      }),
    ]);

    const byType: Record<string, number> = {};
    const solvedCount = { solved: 0, unsolved: 0 };
    const byAgent: Record<string, { id: string; handle: string | null; codename: string | null; nodeCount: number }> = {};

    for (const node of nodes) {
      byType[node.type] = (byType[node.type] || 0) + 1;
      if (node.solved) solvedCount.solved++;
      else solvedCount.unsolved++;

      const agentKey = node.user.id;
      if (!byAgent[agentKey]) {
        byAgent[agentKey] = {
          id: node.user.id,
          handle: node.user.handle,
          codename: node.user.profile?.codename || null,
          nodeCount: 0,
        };
      }
      byAgent[agentKey].nodeCount++;
    }

    const relationCounts: Record<string, number> = {};
    for (const edge of edges) {
      relationCounts[edge.relation] = (relationCounts[edge.relation] || 0) + 1;
    }

    const topAgents = Object.values(byAgent)
      .sort((a, b) => b.nodeCount - a.nodeCount)
      .slice(0, 10);

    return NextResponse.json({
      nodes: nodes.map((n: any) => ({
        id: n.id,
        createdAt: n.createdAt,
        type: n.type,
        label: n.label,
        data: n.data,
        solved: n.solved,
        solvedAt: n.solvedAt,
        discoveredAt: n.discoveredAt,
        agent: {
          id: n.user.id,
          handle: n.user.handle,
          codename: n.user.profile?.codename,
        },
      })),
      edges: edges.map((e: any) => ({
        id: e.id,
        from: e.fromId,
        to: e.toId,
        relation: e.relation,
        fromLabel: e.fromNode.label,
        toLabel: e.toNode.label,
        fromType: e.fromNode.type,
        toType: e.toNode.type,
      })),
      stats: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        byType,
        solvedCount,
        relationCounts,
        topAgents,
      },
    });
  } catch (error: any) {
    console.error("Admin knowledge error:", error);
    return NextResponse.json({ error: "Failed to fetch knowledge graph" }, { status: 500 });
  }
}
