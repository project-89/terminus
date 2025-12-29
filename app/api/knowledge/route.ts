import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import {
  createNode,
  createEdge,
  markNodeSolved,
  markNodeDiscovered,
  getNode,
  getUserNodes,
  getNodeEdges,
  findUnlockedNodes,
  getConnectedGraph,
  findPath,
  createPuzzleChain,
  recordDiscovery,
  getUserGraph,
  type NodeType,
  type EdgeRelation,
} from "@/app/lib/server/knowledgeGraphService";

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
      case "create_node": {
        const { type, label, data, discovered } = body;
        const node = await createNode({
          userId,
          type: type as NodeType,
          label,
          data,
          discovered,
        });
        return NextResponse.json(node);
      }

      case "create_edge": {
        const { fromId, toId, relation, weight, data } = body;
        const edge = await createEdge({
          fromId,
          toId,
          relation: relation as EdgeRelation,
          weight,
          data,
        });
        return NextResponse.json(edge);
      }

      case "solve_node": {
        const { nodeId } = body;
        await markNodeSolved(nodeId);
        return NextResponse.json({ success: true });
      }

      case "discover_node": {
        const { nodeId } = body;
        await markNodeDiscovered(nodeId);
        return NextResponse.json({ success: true });
      }

      case "get_node": {
        const { nodeId } = body;
        const node = await getNode(nodeId);
        return NextResponse.json(node);
      }

      case "list_nodes": {
        const { type, solved, limit } = body;
        const nodes = await getUserNodes({
          userId,
          type: type as NodeType | undefined,
          solved,
          limit,
        });
        return NextResponse.json({ nodes });
      }

      case "get_edges": {
        const { nodeId, direction } = body;
        const edges = await getNodeEdges(nodeId, direction);
        return NextResponse.json({ edges });
      }

      case "find_unlocked": {
        const nodes = await findUnlockedNodes(userId);
        return NextResponse.json({ nodes });
      }

      case "get_graph": {
        const { startNodeId, maxDepth } = body;
        const graph = await getConnectedGraph({ userId, startNodeId, maxDepth });
        return NextResponse.json(graph);
      }

      case "find_path": {
        const { fromId, toId, maxDepth } = body;
        const path = await findPath(fromId, toId, maxDepth);
        return NextResponse.json({ path });
      }

      case "create_puzzle_chain": {
        const { puzzles } = body;
        const nodes = await createPuzzleChain({ userId, puzzles });
        return NextResponse.json({ nodes });
      }

      case "record_discovery": {
        const { label, relatedTo, relation, data } = body;
        const node = await recordDiscovery({
          userId,
          label,
          relatedTo,
          relation: relation as EdgeRelation | undefined,
          data,
        });
        return NextResponse.json(node);
      }

      case "get_user_graph": {
        const result = await getUserGraph(userId);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Knowledge API error:", error);
    return NextResponse.json(
      { error: "Knowledge graph operation failed" },
      { status: 500 }
    );
  }
}
