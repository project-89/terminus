import prisma from "@/app/lib/prisma";
import { getMissionCatalog, type MissionCatalogEntry } from "@/app/lib/missions/catalog";

const CATALOG_TAG_PREFIX = "catalog:";

export type MissionTemplateSource = "catalog" | "database" | "catalog+database";

export type MissionRunSummary = {
  id: string;
  status: string;
  score: number | null;
  feedback: string | null;
  payload: unknown;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    handle: string | null;
    codename: string | null;
  };
};

export type MissionTemplateRecord = {
  id: string;
  definitionId: string | null;
  catalogId: string | null;
  source: MissionTemplateSource;
  title: string;
  prompt: string;
  type: string;
  minEvidence: number;
  tags: string[];
  active: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  stats: {
    totalRuns: number;
    completedRuns: number;
    failedRuns: number;
    activeRuns: number;
    avgScore: number;
  };
  recentRuns: MissionRunSummary[];
};

export type LoadMissionTemplatesOptions = {
  includeCatalog?: boolean;
  includeDatabase?: boolean;
  includeInactive?: boolean;
  includeRuns?: boolean;
  runLimit?: number;
};

type MissionDefinitionWithCounts = {
  id: string;
  title: string;
  prompt: string;
  type: string;
  minEvidence: number;
  tags: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function getCatalogTag(catalogId: string): string {
  return `${CATALOG_TAG_PREFIX}${catalogId}`;
}

export function extractCatalogId(tags: string[] | null | undefined): string | null {
  if (!Array.isArray(tags)) return null;
  const tag = tags.find((value) => typeof value === "string" && value.startsWith(CATALOG_TAG_PREFIX));
  return tag ? tag.slice(CATALOG_TAG_PREFIX.length) : null;
}

async function getRecentRunsByMissionId(missionId: string, runLimit: number): Promise<MissionRunSummary[]> {
  const runs = await prisma.missionRun.findMany({
    where: { missionId },
    orderBy: { updatedAt: "desc" },
    take: runLimit,
    include: {
      user: {
        select: {
          id: true,
          handle: true,
          profile: { select: { codename: true } },
        },
      },
    },
  });

  return runs.map((run: any) => ({
    id: run.id,
    status: run.status,
    score: run.score,
    feedback: run.feedback,
    payload: run.payload,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
    user: {
      id: run.user.id,
      handle: run.user.handle,
      codename: run.user.profile?.codename ?? null,
    },
  }));
}

async function getMissionRunStats(missionIds: string[]): Promise<
  Map<
    string,
    {
      totalRuns: number;
      completedRuns: number;
      failedRuns: number;
      activeRuns: number;
      avgScore: number;
    }
  >
> {
  const statsMap = new Map<
    string,
    {
      totalRuns: number;
      completedRuns: number;
      failedRuns: number;
      activeRuns: number;
      avgScore: number;
    }
  >();

  if (missionIds.length === 0) return statsMap;

  const [statusCounts, completedAverages] = await Promise.all([
    prisma.missionRun.groupBy({
      by: ["missionId", "status"],
      where: { missionId: { in: missionIds } },
      _count: { _all: true },
    }),
    prisma.missionRun.groupBy({
      by: ["missionId"],
      where: { missionId: { in: missionIds }, status: "COMPLETED" },
      _avg: { score: true },
      _count: { _all: true },
    }),
  ]);

  for (const missionId of missionIds) {
    statsMap.set(missionId, {
      totalRuns: 0,
      completedRuns: 0,
      failedRuns: 0,
      activeRuns: 0,
      avgScore: 0,
    });
  }

  for (const row of statusCounts as any[]) {
    const current = statsMap.get(row.missionId);
    if (!current) continue;

    const count = Number(row._count?._all || 0);
    current.totalRuns += count;

    if (row.status === "COMPLETED") current.completedRuns += count;
    if (row.status === "FAILED") current.failedRuns += count;
    if (["ACCEPTED", "SUBMITTED", "REVIEWING"].includes(row.status)) {
      current.activeRuns += count;
    }
  }

  for (const row of completedAverages as any[]) {
    const current = statsMap.get(row.missionId);
    if (!current) continue;
    current.avgScore = Number(row._avg?.score ?? 0);
  }

  return statsMap;
}

function buildCatalogOnlyRecord(entry: MissionCatalogEntry): MissionTemplateRecord {
  return {
    id: `catalog:${entry.id}`,
    definitionId: null,
    catalogId: entry.id,
    source: "catalog",
    title: entry.title,
    prompt: entry.prompt,
    type: entry.type,
    minEvidence: 1,
    tags: Array.from(new Set([getCatalogTag(entry.id), ...entry.tags])),
    active: true,
    createdAt: null,
    updatedAt: null,
    stats: {
      totalRuns: 0,
      completedRuns: 0,
      failedRuns: 0,
      activeRuns: 0,
      avgScore: 0,
    },
    recentRuns: [],
  };
}

export async function loadMissionTemplates(
  options: LoadMissionTemplatesOptions = {},
): Promise<MissionTemplateRecord[]> {
  const {
    includeCatalog = true,
    includeDatabase = true,
    includeInactive = true,
    includeRuns = false,
    runLimit = 10,
  } = options;

  const catalogEntries = includeCatalog ? getMissionCatalog() : [];

  const dbDefinitions: MissionDefinitionWithCounts[] = includeDatabase
    ? await prisma.missionDefinition.findMany({
        where: includeInactive ? undefined : { active: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const missionIds = dbDefinitions.map((definition) => definition.id);
  const [statsByMissionId, recentRunsByMissionId] = await Promise.all([
    getMissionRunStats(missionIds),
    includeRuns
      ? Promise.all(
          missionIds.map(async (missionId) => [missionId, await getRecentRunsByMissionId(missionId, runLimit)] as const),
        ).then((pairs) => new Map<string, MissionRunSummary[]>(pairs))
      : Promise.resolve(new Map<string, MissionRunSummary[]>()),
  ]);

  const catalogById = new Map(catalogEntries.map((entry) => [entry.id, entry]));
  const dbByCatalogId = new Map<string, MissionDefinitionWithCounts>();

  for (const definition of dbDefinitions as MissionDefinitionWithCounts[]) {
    const catalogId = extractCatalogId(definition.tags);
    if (catalogId) dbByCatalogId.set(catalogId, definition);
  }

  const records: MissionTemplateRecord[] = [];

  for (const definition of dbDefinitions as MissionDefinitionWithCounts[]) {
    const catalogId = extractCatalogId(definition.tags);
    const source: MissionTemplateSource = catalogId && catalogById.has(catalogId) ? "catalog+database" : "database";
    const stats = statsByMissionId.get(definition.id) ?? {
      totalRuns: 0,
      completedRuns: 0,
      failedRuns: 0,
      activeRuns: 0,
      avgScore: 0,
    };

    records.push({
      id: definition.id,
      definitionId: definition.id,
      catalogId,
      source,
      title: definition.title,
      prompt: definition.prompt,
      type: definition.type,
      minEvidence: definition.minEvidence ?? 1,
      tags: Array.isArray(definition.tags) ? definition.tags : [],
      active: definition.active,
      createdAt: definition.createdAt,
      updatedAt: definition.updatedAt,
      stats,
      recentRuns: recentRunsByMissionId.get(definition.id) ?? [],
    });
  }

  if (includeCatalog) {
    for (const entry of catalogEntries) {
      if (dbByCatalogId.has(entry.id)) continue;
      records.push(buildCatalogOnlyRecord(entry));
    }
  }

  records.sort((a, b) => {
    const aTime = a.updatedAt ? a.updatedAt.getTime() : 0;
    const bTime = b.updatedAt ? b.updatedAt.getTime() : 0;
    if (bTime !== aTime) return bTime - aTime;
    return a.title.localeCompare(b.title);
  });

  return records;
}

export async function getMissionTemplateById(
  id: string,
  options: LoadMissionTemplatesOptions = {},
): Promise<MissionTemplateRecord | null> {
  const templates = await loadMissionTemplates(options);
  return (
    templates.find((template) => template.id === id || template.definitionId === id || template.catalogId === id) ?? null
  );
}

export async function ensureMissionDefinitionForReference(reference: string): Promise<string> {
  const trimmed = reference.trim();

  if (!trimmed) throw new Error("Mission reference is required");

  const direct = await prisma.missionDefinition.findUnique({ where: { id: trimmed }, select: { id: true } });
  if (direct) return direct.id;

  const catalogId = trimmed.startsWith("catalog:") ? trimmed.slice("catalog:".length) : trimmed;
  const catalogEntry = getMissionCatalog().find((entry) => entry.id === catalogId);
  if (catalogEntry) {
    const tag = getCatalogTag(catalogEntry.id);
    const existing = await prisma.missionDefinition.findFirst({ where: { tags: { has: tag } }, select: { id: true } });
    if (existing) return existing.id;

    const created = await prisma.missionDefinition.create({
      data: {
        title: catalogEntry.title,
        prompt: catalogEntry.prompt,
        type: catalogEntry.type,
        minEvidence: 1,
        tags: Array.from(new Set([tag, ...catalogEntry.tags])),
        active: true,
      },
      select: { id: true },
    });

    return created.id;
  }

  const byTitle = await prisma.missionDefinition.findFirst({
    where: {
      OR: [
        { title: { equals: trimmed, mode: "insensitive" } },
        { title: { contains: trimmed, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (byTitle) return byTitle.id;

  throw new Error(`Mission template not found for reference: ${reference}`);
}
