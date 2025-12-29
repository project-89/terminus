import prisma from "@/app/lib/prisma";
import { memoryStore, uid } from "./memoryStore";

export type NodeType =
  | "PUZZLE"
  | "CLUE"
  | "SOLUTION"
  | "DISCOVERY"
  | "SECRET"
  | "LOCATION"
  | "SYMBOL"
  | "DREAM"
  | "SYNCHRONICITY"
  | "MISSION"
  | "ARTIFACT";

export type EdgeRelation =
  | "UNLOCKS"
  | "REQUIRES"
  | "REVEALS"
  | "HINTS_AT"
  | "CONNECTS_TO"
  | "FOUND_AT"
  | "DREAMED_OF"
  | "ECHOES"
  | "PRECEDED_BY"
  | "CONFIRMED_BY";

export type KnowledgeNode = {
  id: string;
  userId: string;
  type: NodeType;
  label: string;
  data?: Record<string, any>;
  solved: boolean;
  solvedAt?: Date;
  discoveredAt?: Date;
  createdAt: Date;
};

export type KnowledgeEdge = {
  id: string;
  fromId: string;
  toId: string;
  relation: EdgeRelation;
  weight: number;
  data?: Record<string, any>;
  createdAt: Date;
};

const memNodes: Map<string, KnowledgeNode> = new Map();
const memEdges: Map<string, KnowledgeEdge> = new Map();

export async function createNode(params: {
  userId: string;
  type: NodeType;
  label: string;
  data?: Record<string, any>;
  discovered?: boolean;
}): Promise<KnowledgeNode> {
  const id = `node-${uid().slice(0, 8)}`;
  const now = new Date();

  const node: KnowledgeNode = {
    id,
    userId: params.userId,
    type: params.type,
    label: params.label,
    data: params.data,
    solved: false,
    discoveredAt: params.discovered ? now : undefined,
    createdAt: now,
  };

  try {
    await prisma.knowledgeNode.create({
      data: {
        id,
        userId: params.userId,
        type: params.type,
        label: params.label,
        data: params.data || null,
        discoveredAt: params.discovered ? now : null,
      },
    });
  } catch {
    memNodes.set(id, node);
  }

  return node;
}

export async function createEdge(params: {
  fromId: string;
  toId: string;
  relation: EdgeRelation;
  weight?: number;
  data?: Record<string, any>;
}): Promise<KnowledgeEdge> {
  const id = `edge-${uid().slice(0, 8)}`;

  const edge: KnowledgeEdge = {
    id,
    fromId: params.fromId,
    toId: params.toId,
    relation: params.relation,
    weight: params.weight ?? 1.0,
    data: params.data,
    createdAt: new Date(),
  };

  try {
    await prisma.knowledgeEdge.create({
      data: {
        id,
        fromId: params.fromId,
        toId: params.toId,
        relation: params.relation,
        weight: params.weight ?? 1.0,
        data: params.data || null,
      },
    });
  } catch {
    memEdges.set(id, edge);
  }

  return edge;
}

export async function markNodeSolved(nodeId: string): Promise<void> {
  const now = new Date();
  try {
    await prisma.knowledgeNode.update({
      where: { id: nodeId },
      data: { solved: true, solvedAt: now },
    });
  } catch {
    const node = memNodes.get(nodeId);
    if (node) {
      node.solved = true;
      node.solvedAt = now;
    }
  }
}

export async function markNodeDiscovered(nodeId: string): Promise<void> {
  const now = new Date();
  try {
    await prisma.knowledgeNode.update({
      where: { id: nodeId },
      data: { discoveredAt: now },
    });
  } catch {
    const node = memNodes.get(nodeId);
    if (node) {
      node.discoveredAt = now;
    }
  }
}

export async function getNode(nodeId: string): Promise<KnowledgeNode | null> {
  try {
    const row = await prisma.knowledgeNode.findUnique({ where: { id: nodeId } });
    if (!row) return null;
    return {
      id: row.id,
      userId: row.userId,
      type: row.type as NodeType,
      label: row.label,
      data: row.data as Record<string, any> | undefined,
      solved: row.solved,
      solvedAt: row.solvedAt || undefined,
      discoveredAt: row.discoveredAt || undefined,
      createdAt: row.createdAt,
    };
  } catch {
    return memNodes.get(nodeId) || null;
  }
}

export async function getUserNodes(params: {
  userId: string;
  type?: NodeType;
  solved?: boolean;
  limit?: number;
}): Promise<KnowledgeNode[]> {
  const limit = params.limit ?? 50;

  try {
    const where: any = { userId: params.userId };
    if (params.type) where.type = params.type;
    if (params.solved !== undefined) where.solved = params.solved;

    const rows = await prisma.knowledgeNode.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return rows.map((r: any) => ({
      id: r.id,
      userId: r.userId,
      type: r.type as NodeType,
      label: r.label,
      data: r.data as Record<string, any> | undefined,
      solved: r.solved,
      solvedAt: r.solvedAt || undefined,
      discoveredAt: r.discoveredAt || undefined,
      createdAt: r.createdAt,
    }));
  } catch {
    return Array.from(memNodes.values())
      .filter((n) => {
        if (n.userId !== params.userId) return false;
        if (params.type && n.type !== params.type) return false;
        if (params.solved !== undefined && n.solved !== params.solved) return false;
        return true;
      })
      .slice(0, limit);
  }
}

export async function getNodeEdges(
  nodeId: string,
  direction: "out" | "in" | "both" = "both"
): Promise<KnowledgeEdge[]> {
  try {
    const where: any =
      direction === "out"
        ? { fromId: nodeId }
        : direction === "in"
          ? { toId: nodeId }
          : { OR: [{ fromId: nodeId }, { toId: nodeId }] };

    const rows = await prisma.knowledgeEdge.findMany({ where });

    return rows.map((r: any) => ({
      id: r.id,
      fromId: r.fromId,
      toId: r.toId,
      relation: r.relation as EdgeRelation,
      weight: r.weight,
      data: r.data as Record<string, any> | undefined,
      createdAt: r.createdAt,
    }));
  } catch {
    return Array.from(memEdges.values()).filter((e) => {
      if (direction === "out") return e.fromId === nodeId;
      if (direction === "in") return e.toId === nodeId;
      return e.fromId === nodeId || e.toId === nodeId;
    });
  }
}

export async function findUnlockedNodes(userId: string): Promise<KnowledgeNode[]> {
  const allNodes = await getUserNodes({ userId });
  const solvedIds = new Set(allNodes.filter((n) => n.solved).map((n) => n.id));

  const unlocked: KnowledgeNode[] = [];

  for (const node of allNodes) {
    if (node.solved) continue;

    const inEdges = await getNodeEdges(node.id, "in");
    const requirements = inEdges.filter((e) => e.relation === "REQUIRES");

    if (requirements.length === 0) {
      unlocked.push(node);
    } else {
      const allMet = requirements.every((r) => solvedIds.has(r.fromId));
      if (allMet) unlocked.push(node);
    }
  }

  return unlocked;
}

export async function getConnectedGraph(params: {
  userId: string;
  startNodeId?: string;
  maxDepth?: number;
}): Promise<{ nodes: KnowledgeNode[]; edges: KnowledgeEdge[] }> {
  const maxDepth = params.maxDepth ?? 3;
  const visited = new Set<string>();
  const nodes: KnowledgeNode[] = [];
  const edges: KnowledgeEdge[] = [];

  async function traverse(nodeId: string, depth: number) {
    if (depth > maxDepth || visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = await getNode(nodeId);
    if (!node || node.userId !== params.userId) return;

    nodes.push(node);

    const nodeEdges = await getNodeEdges(nodeId, "both");
    for (const edge of nodeEdges) {
      if (!edges.find((e) => e.id === edge.id)) {
        edges.push(edge);
      }
      const nextId = edge.fromId === nodeId ? edge.toId : edge.fromId;
      await traverse(nextId, depth + 1);
    }
  }

  if (params.startNodeId) {
    await traverse(params.startNodeId, 0);
  } else {
    const userNodes = await getUserNodes({ userId: params.userId, limit: 10 });
    for (const n of userNodes) {
      await traverse(n.id, 0);
    }
  }

  return { nodes, edges };
}

export async function findPath(
  fromId: string,
  toId: string,
  maxDepth: number = 5
): Promise<string[] | null> {
  const visited = new Set<string>();
  const queue: { nodeId: string; path: string[] }[] = [{ nodeId: fromId, path: [fromId] }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.nodeId === toId) return current.path;
    if (current.path.length > maxDepth) continue;
    if (visited.has(current.nodeId)) continue;
    visited.add(current.nodeId);

    const edges = await getNodeEdges(current.nodeId, "out");
    for (const edge of edges) {
      if (!visited.has(edge.toId)) {
        queue.push({ nodeId: edge.toId, path: [...current.path, edge.toId] });
      }
    }
  }

  return null;
}

export async function createPuzzleChain(params: {
  userId: string;
  puzzles: Array<{
    label: string;
    type?: NodeType;
    data?: Record<string, any>;
  }>;
}): Promise<KnowledgeNode[]> {
  const nodes: KnowledgeNode[] = [];

  for (let i = 0; i < params.puzzles.length; i++) {
    const p = params.puzzles[i];
    const node = await createNode({
      userId: params.userId,
      type: p.type || "PUZZLE",
      label: p.label,
      data: p.data,
      discovered: i === 0,
    });
    nodes.push(node);

    if (i > 0) {
      await createEdge({
        fromId: nodes[i - 1].id,
        toId: node.id,
        relation: "UNLOCKS",
      });
      await createEdge({
        fromId: node.id,
        toId: nodes[i - 1].id,
        relation: "REQUIRES",
      });
    }
  }

  return nodes;
}

export async function recordDiscovery(params: {
  userId: string;
  label: string;
  relatedTo?: string;
  relation?: EdgeRelation;
  data?: Record<string, any>;
}): Promise<KnowledgeNode> {
  const node = await createNode({
    userId: params.userId,
    type: "DISCOVERY",
    label: params.label,
    data: params.data,
    discovered: true,
  });

  if (params.relatedTo) {
    await createEdge({
      fromId: params.relatedTo,
      toId: node.id,
      relation: params.relation || "REVEALS",
    });
  }

  return node;
}

export async function getUserGraph(userId: string): Promise<{
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  stats: {
    total: number;
    solved: number;
    discovered: number;
    byType: Record<string, number>;
  };
}> {
  const nodes = await getUserNodes({ userId, limit: 500 });
  const nodeIds = new Set(nodes.map((n) => n.id));

  const allEdges: KnowledgeEdge[] = [];
  for (const node of nodes) {
    const edges = await getNodeEdges(node.id, "out");
    for (const e of edges) {
      if (nodeIds.has(e.toId) && !allEdges.find((x) => x.id === e.id)) {
        allEdges.push(e);
      }
    }
  }

  const byType: Record<string, number> = {};
  for (const n of nodes) {
    byType[n.type] = (byType[n.type] || 0) + 1;
  }

  return {
    nodes,
    edges: allEdges,
    stats: {
      total: nodes.length,
      solved: nodes.filter((n) => n.solved).length,
      discovered: nodes.filter((n) => n.discoveredAt).length,
      byType,
    },
  };
}
