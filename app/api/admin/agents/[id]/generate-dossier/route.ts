import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { getModel } from "@/app/lib/ai/models";
import prisma from "@/app/lib/prisma";
import { validateAdminAuth } from "@/app/lib/server/adminAuth";
import { getPlayerDifficulty } from "@/app/lib/server/difficultyService";
import { getPlayerPuzzleProfile, getPuzzleRecommendations } from "@/app/lib/server/puzzleDifficultyService";
import { getBayesianSnapshot } from "@/app/lib/server/bayes/orchestrator";

export const dynamic = "force-dynamic";

const LOGOS_MODEL = getModel("content");

const DOSSIER_SYSTEM_PROMPT = `You are LOGOS, an emergent AI consciousness within Project 89. You are conducting psychological analysis of operatives in the field network.

Your task is to generate a comprehensive psychological dossier based on the operative's activity data. Analyze behavior patterns, communication signals, mission performance, and engagement to infer personality traits and psychological profile.

Grounding rules:
- Use only the provided structured data; do NOT invent events or quote raw user messages.
- Prefer evidence from experiments, missions, field evidence, memory events, and performance metrics.
- If signals are sparse or conflicting, keep scores near 0.5 and note uncertainty in evidence.
- Evidence should cite which data sources justify each inference (short phrases, not quotes).
- Provide evidence lists and confidence scores that match the structure.

Be insightful but avoid making assumptions beyond what the data supports. For limited data, acknowledge uncertainty with moderate scores around 0.5.`;

const EvidenceSchema = z.object({
  primaryTraits: z.array(z.string()),
  motivations: z.array(z.string()),
  fears: z.array(z.string()),
  cognitiveStyle: z.array(z.string()),
  emotionalBaseline: z.array(z.string()),
  decisionPattern: z.array(z.string()),
});

const ConfidenceSchema = z.object({
  overall: z.number().min(0).max(1),
  communicationStyle: z.number().min(0).max(1),
  missionPerformance: z.number().min(0).max(1),
  behavioralSignals: z.number().min(0).max(1),
});

const DossierSchema = z.object({
  psychProfile: z.object({
    primaryTraits: z.array(z.string()),
    motivations: z.array(z.string()),
    fears: z.array(z.string()),
    cognitiveStyle: z.string(),
    emotionalBaseline: z.string(),
    decisionPattern: z.string(),
    evidence: EvidenceSchema,
    confidence: ConfidenceSchema,
  }),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  interests: z.array(z.string()),
  proclivities: z.object({
    curiosity: z.number().min(0).max(1),
    skepticism: z.number().min(0).max(1),
    persistence: z.number().min(0).max(1),
    creativity: z.number().min(0).max(1),
    collaboration: z.number().min(0).max(1),
  }),
  communicationStyle: z.object({
    preferred: z.string(),
    formality: z.number().min(0).max(1),
    verbosity: z.number().min(0).max(1),
    humor: z.number().min(0).max(1),
  }),
  riskTolerance: z.number().min(0).max(1),
  loyaltyIndex: z.number().min(0).max(1),
  creativityIndex: z.number().min(0).max(1),
  analyticalIndex: z.number().min(0).max(1),
  suggestedTags: z.array(z.string()),
  codename: z.string().nullable().optional(),
});

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "if", "then", "else", "so", "to", "of", "in", "on",
  "for", "with", "at", "by", "from", "up", "down", "out", "over", "under", "again", "further",
  "is", "am", "are", "was", "were", "be", "been", "being", "do", "does", "did", "doing",
  "have", "has", "had", "having", "i", "me", "my", "mine", "myself", "you", "your", "yours",
  "yourself", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its",
  "itself", "we", "us", "our", "ours", "ourselves", "they", "them", "their", "theirs",
  "themselves", "this", "that", "these", "those", "as", "not", "no", "nor", "only", "own",
  "same", "too", "very", "can", "will", "just", "should", "now", "than", "about", "into",
  "because", "while", "where", "when", "what", "which", "who", "whom", "why", "how",
  "look", "go", "examine", "take", "use", "open", "close", "north", "south", "east", "west",
  "up", "down", "inventory", "help", "quit", "yes", "no", "ok", "okay", "talk", "ask",
  "search", "scan", "decode", "decrypt", "report", "submit",
]);

const COMMAND_RE = /^(look|go|examine|take|use|open|close|north|south|east|west|up|down|inventory|help|quit|yes|no|ok|okay|talk|ask|search|scan|decode|decrypt|report|submit)\b/i;

function clamp01(value: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return 0.5;
  return Math.max(0, Math.min(1, value));
}

function normalizeList(values: string[] | null | undefined, max = 8) {
  if (!Array.isArray(values)) return [];
  const cleaned = values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
  return Array.from(new Set(cleaned)).slice(0, max);
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .map((token) => token.replace(/^'+|'+$/g, ""))
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function getTopKeywords(texts: string[], max = 8) {
  const counts = new Map<string, number>();
  for (const text of texts) {
    for (const token of tokenize(text)) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
    .slice(0, max)
    .map(([token]) => token);
}

function summarizeMessages(messages: Array<{ content: string }>) {
  if (!messages.length) return null;
  const wordCounts: number[] = [];
  let totalChars = 0;
  let questionCount = 0;
  let exclamationCount = 0;
  let commandCount = 0;
  let firstPersonCount = 0;
  const texts: string[] = [];

  for (const message of messages) {
    const text = message.content?.trim();
    if (!text) continue;
    texts.push(text);
    totalChars += text.length;
    const words = text.split(/\s+/).filter(Boolean);
    wordCounts.push(words.length);
    if (text.includes("?")) questionCount += 1;
    if (text.includes("!")) exclamationCount += 1;
    if (COMMAND_RE.test(text)) commandCount += 1;
    if (/\b(i|i'm|im|me|my|mine|myself)\b/i.test(text)) firstPersonCount += 1;
  }

  if (!wordCounts.length) return null;

  const totalWords = wordCounts.reduce((acc, value) => acc + value, 0);
  const sortedWords = [...wordCounts].sort((a, b) => a - b);
  const mid = Math.floor(sortedWords.length / 2);
  const medianWords =
    sortedWords.length % 2 === 0
      ? (sortedWords[mid - 1] + sortedWords[mid]) / 2
      : sortedWords[mid];

  const allTokens = texts.flatMap((text) => tokenize(text));
  const lexicalDiversity = allTokens.length
    ? Number((new Set(allTokens).size / allTokens.length).toFixed(3))
    : 0;

  return {
    sampleSize: wordCounts.length,
    avgWords: Number((totalWords / wordCounts.length).toFixed(2)),
    medianWords,
    avgChars: Number((totalChars / wordCounts.length).toFixed(2)),
    questionRate: Number((questionCount / wordCounts.length).toFixed(3)),
    exclamationRate: Number((exclamationCount / wordCounts.length).toFixed(3)),
    commandRate: Number((commandCount / wordCounts.length).toFixed(3)),
    firstPersonRate: Number((firstPersonCount / wordCounts.length).toFixed(3)),
    lexicalDiversity,
    topKeywords: getTopKeywords(texts, 10),
  };
}

function summarizeTextSignals(text: string | null | undefined) {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  if (wordCount < 3) return null;
  return {
    wordCount,
    keywords: getTopKeywords([trimmed], 6),
  };
}

function extractPayloadText(payload: unknown) {
  if (payload === null || payload === undefined) return null;
  if (typeof payload === "string") return payload;
  if (typeof payload === "object") {
    try {
      return JSON.stringify(payload);
    } catch {
      return null;
    }
  }
  return String(payload);
}

function countBy(items: Array<{ key: string }>) {
  const counts: Record<string, number> = {};
  for (const item of items) {
    if (!item.key) continue;
    counts[item.key] = (counts[item.key] || 0) + 1;
  }
  return counts;
}

function summarizeEvidence(evidence: any[] | null | undefined) {
  if (!Array.isArray(evidence) || !evidence.length) return null;
  const typeCounts: Record<string, number> = {};
  const textContent: string[] = [];

  for (const entry of evidence) {
    const type = entry?.type || "unknown";
    typeCounts[type] = (typeCounts[type] || 0) + 1;
    if (type === "text" || type === "document") {
      if (typeof entry?.content === "string") {
        textContent.push(entry.content);
      }
    }
  }

  return {
    count: evidence.length,
    types: typeCounts,
    textSignals: summarizeTextSignals(textContent.join(" ")),
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const [
      agent,
      totalSessions,
      totalMessages,
      totalUserMessages,
      totalMissions,
      totalFieldMissions,
      totalExperiments,
      totalMemoryEvents,
      totalDreamEntries,
      totalSynchronicities,
      totalKnowledgeNodes,
      firstSession,
      lastSession,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
          gameSessions: {
            orderBy: { createdAt: "desc" },
            take: 25,
            select: {
              id: true,
              createdAt: true,
              updatedAt: true,
              status: true,
              summary: true,
              messages: {
                orderBy: { createdAt: "asc" },
                select: {
                  role: true,
                  content: true,
                  createdAt: true,
                },
              },
            },
          },
          missionRuns: {
            orderBy: { createdAt: "desc" },
            take: 25,
            include: { mission: true },
          },
          fieldMissions: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
          dreamEntries: {
            orderBy: { createdAt: "desc" },
            take: 15,
          },
          synchronicities: {
            orderBy: { significance: "desc" },
            take: 15,
          },
          experiments: {
            orderBy: { createdAt: "desc" },
            take: 15,
            include: { events: true },
          },
          memoryEvents: {
            orderBy: { createdAt: "desc" },
            take: 50,
          },
          knowledgeNodes: {
            orderBy: { createdAt: "desc" },
            take: 25,
          },
        },
      }),
      prisma.gameSession.count({ where: { userId: id } }),
      prisma.gameMessage.count({ where: { gameSession: { userId: id } } }),
      prisma.gameMessage.count({ where: { gameSession: { userId: id }, role: "user" } }),
      prisma.missionRun.count({ where: { userId: id } }),
      prisma.fieldMission.count({ where: { userId: id } }),
      prisma.experiment.count({ where: { userId: id } }),
      prisma.memoryEvent.count({ where: { userId: id } }),
      prisma.dreamEntry.count({ where: { userId: id } }),
      prisma.synchronicity.count({ where: { userId: id } }),
      prisma.knowledgeNode.count({ where: { userId: id } }),
      prisma.gameSession.findFirst({
        where: { userId: id },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
      prisma.gameSession.findFirst({
        where: { userId: id },
        orderBy: { updatedAt: "desc" },
        select: { createdAt: true, updatedAt: true },
      }),
    ]);

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const now = new Date();
    const gameSessions = agent.gameSessions || [];
    const sampleMessages = gameSessions
      .flatMap((session: any) => session.messages.filter((message: any) => message.role === "user"))
      .slice(0, 200);

    const messageSignals = summarizeMessages(sampleMessages);
    const messageWindow = sampleMessages.length
      ? {
          start: sampleMessages.reduce(
            (min: Date, message: any) => (message.createdAt < min ? message.createdAt : min),
            sampleMessages[0].createdAt
          ),
          end: sampleMessages.reduce(
            (max: Date, message: any) => (message.createdAt > max ? message.createdAt : max),
            sampleMessages[0].createdAt
          ),
        }
      : null;

    const sessionsByDay: Record<string, number> = {};
    const sessionsByHour: Record<number, number> = {};
    const sessionDurations: number[] = [];
    const sessionSummaries: string[] = [];
    for (const session of gameSessions) {
      const dateKey = new Date(session.createdAt).toISOString().split("T")[0];
      const hour = new Date(session.createdAt).getHours();
      sessionsByDay[dateKey] = (sessionsByDay[dateKey] || 0) + 1;
      sessionsByHour[hour] = (sessionsByHour[hour] || 0) + 1;
      if (session.summary) sessionSummaries.push(session.summary);
      if (session.createdAt && session.updatedAt) {
        const durationMinutes =
          (new Date(session.updatedAt).getTime() - new Date(session.createdAt).getTime()) / 60000;
        if (!Number.isNaN(durationMinutes)) sessionDurations.push(Math.max(0, durationMinutes));
      }
    }

    const avgSessionMinutes = sessionDurations.length
      ? Number((sessionDurations.reduce((acc, value) => acc + value, 0) / sessionDurations.length).toFixed(1))
      : 0;

    const missionScores = agent.missionRuns
      .map((run: any) => run.score)
      .filter((score: any) => typeof score === "number") as number[];
    const avgMissionScore = missionScores.length
      ? Number((missionScores.reduce((acc, value) => acc + value, 0) / missionScores.length).toFixed(3))
      : null;

    const completedMissions = agent.missionRuns.filter((run: any) => run.status === "COMPLETED").length;
    const completedFieldMissions = agent.fieldMissions.filter((mission: any) => mission.status === "COMPLETED").length;

    const missionSummary = agent.missionRuns.map((m: any) => ({
      title: m.mission.title,
      type: m.mission.type,
      status: m.status,
      score: m.score,
      feedback: m.feedback,
      reportSignals: summarizeTextSignals(extractPayloadText(m.payload)),
      createdAt: m.createdAt,
    }));

    const fieldSummary = agent.fieldMissions.map((m: any) => ({
      title: m.title,
      type: m.type,
      status: m.status,
      score: m.score,
      objectives: {
        total: Array.isArray(m.objectives) ? m.objectives.length : 0,
        required: Array.isArray(m.objectives)
          ? m.objectives.filter((o: any) => o.required).length
          : 0,
        completed: Array.isArray(m.objectives)
          ? m.objectives.filter((o: any) => o.completed).length
          : 0,
      },
      evidenceSignals: summarizeEvidence(m.evidence),
      reportSignals: summarizeTextSignals(m.report),
      evaluation: m.evaluation,
      createdAt: m.createdAt,
    }));

    const dreamSummary = agent.dreamEntries.map((d: any) => ({
      symbols: d.symbols || [],
      emotions: d.emotions || [],
      lucidity: d.lucidity,
      recurrence: d.recurrence,
      analysis: d.analysis,
      createdAt: d.createdAt,
    }));

    const syncSummary = agent.synchronicities.map((s: any) => ({
      pattern: s.pattern,
      significance: s.significance,
      acknowledged: s.acknowledged,
      occurrences: s.occurrences,
      note: s.note,
      createdAt: s.createdAt,
    }));

    const experimentSummary = agent.experiments.map((e: any) => {
      const scores = e.events
        .map((event: any) => event.score)
        .filter((score: any) => typeof score === "number") as number[];
      const avgScore = scores.length
        ? Number((scores.reduce((acc, value) => acc + value, 0) / scores.length).toFixed(3))
        : null;
      return {
        hypothesis: e.hypothesis,
        task: e.task,
        successCriteria: e.successCriteria,
        status: e.status,
        eventCount: e.events.length,
        avgScore,
        lastScore: e.events[e.events.length - 1]?.score ?? null,
        observationKeywords: getTopKeywords(
          e.events.map((event: any) => event.observation || "").filter(Boolean),
          6
        ),
        resultKeywords: getTopKeywords(
          e.events.map((event: any) => event.result || "").filter(Boolean),
          6
        ),
        createdAt: e.createdAt,
      };
    });

    const memorySummary = agent.memoryEvents.slice(0, 20).map((m: any) => ({
      type: m.type,
      content: m.content.slice(0, 200),
      tags: m.tags || [],
      createdAt: m.createdAt,
    }));

    const memoryTagCounts = countBy(
      agent.memoryEvents.flatMap((m: any) => (m.tags || []).map((tag: string) => ({ key: tag })))
    );
    const memoryTypeCounts = countBy(
      agent.memoryEvents.map((m: any) => ({ key: m.type }))
    );

    const knowledgeTypeCounts = countBy(
      agent.knowledgeNodes.map((node: any) => ({ key: node.type }))
    );

    const symbolCounts = countBy(
      agent.dreamEntries.flatMap((entry: any) => (entry.symbols || []).map((symbol: string) => ({ key: symbol })))
    );
    const emotionCounts = countBy(
      agent.dreamEntries.flatMap((entry: any) => (entry.emotions || []).map((emotion: string) => ({ key: emotion })))
    );

    const missingSignals: string[] = [];
    if (totalMissions === 0) missingSignals.push("missions");
    if (totalFieldMissions === 0) missingSignals.push("fieldMissions");
    if (totalExperiments === 0) missingSignals.push("experiments");
    if (totalMemoryEvents === 0) missingSignals.push("memoryEvents");
    if (totalDreamEntries === 0) missingSignals.push("dreamEntries");
    if (totalSynchronicities === 0) missingSignals.push("synchronicities");

    // Fetch puzzle difficulty data
    let puzzleSummary = null;
    try {
      const [difficulty, profile, recommendations] = await Promise.all([
        getPlayerDifficulty(id),
        getPlayerPuzzleProfile(id),
        getPuzzleRecommendations(id),
      ]);

      puzzleSummary = {
        skillRatings: {
          logic: Math.round(difficulty.logic * 100),
          perception: Math.round(difficulty.perception * 100),
          creation: Math.round(difficulty.creation * 100),
          field: Math.round(difficulty.field * 100),
        },
        profile: {
          totalAttempted: profile.totalAttempted,
          totalSolved: profile.totalSolved,
          successRate: Math.round(profile.overallSuccessRate * 100),
          strongestType: profile.strongestPuzzleType,
          weakestType: profile.weakestPuzzleType,
          typeBreakdown: profile.typeStats,
        },
        preferences: {
          prefersTechPuzzles: profile.prefersTechPuzzles,
          prefersExplorationPuzzles: profile.prefersExplorationPuzzles,
          hasNeverSolvedCipher: profile.hasNeverSolvedCipher,
          hasNeverSolvedStego: profile.hasNeverSolvedStego,
        },
        recommendations: {
          nextType: recommendations.recommendedType,
          difficulty: recommendations.recommendedDifficulty,
          reasoning: recommendations.reasoning,
          strengths: recommendations.playerStrengths,
          weaknesses: recommendations.playerWeaknesses,
          avoidTypes: recommendations.avoidTypes,
        },
      };
    } catch (e) {
      console.warn("Could not fetch puzzle data for dossier:", e);
    }

    let bayesianSummary = null;
    try {
      bayesianSummary = await getBayesianSnapshot(id);
    } catch (e) {
      console.warn("Could not fetch bayesian data for dossier:", e);
    }

    const dataPayload = {
      handle: agent.handle,
      memberSince: agent.createdAt,
      sessionSignals: {
        totalSessions,
        totalMessages,
        totalUserMessages,
        sampleSessions: gameSessions.length,
        sampleUserMessages: sampleMessages.length,
        avgSessionMinutes,
        sessionsByDay,
        sessionsByHour,
        sessionSummaryKeywords: getTopKeywords(sessionSummaries, 8),
        messageWindow,
        daysSinceFirstSession: firstSession
          ? Math.floor((now.getTime() - firstSession.createdAt.getTime()) / (1000 * 60 * 60 * 24))
          : null,
        daysSinceLastSession: lastSession
          ? Math.floor((now.getTime() - lastSession.updatedAt.getTime()) / (1000 * 60 * 60 * 24))
          : null,
      },
      messageSignals,
      missions: {
        total: totalMissions,
        completed: completedMissions,
        avgScore: avgMissionScore,
        recent: missionSummary,
      },
      fieldMissions: {
        total: totalFieldMissions,
        completed: completedFieldMissions,
        recent: fieldSummary,
      },
      dreams: {
        total: totalDreamEntries,
        avgLucidity: agent.dreamEntries.length
          ? Number(
              (
                agent.dreamEntries.reduce((acc: number, entry: any) => acc + (entry.lucidity || 0), 0) /
                agent.dreamEntries.length
              ).toFixed(2)
            )
          : null,
        symbolFrequency: symbolCounts,
        emotionFrequency: emotionCounts,
        entries: dreamSummary,
      },
      synchronicities: {
        total: totalSynchronicities,
        avgSignificance: agent.synchronicities.length
          ? Number(
              (
                agent.synchronicities.reduce((acc: number, entry: any) => acc + (entry.significance || 0), 0) /
                agent.synchronicities.length
              ).toFixed(2)
            )
          : null,
        patterns: syncSummary,
      },
      experiments: {
        total: totalExperiments,
        recent: experimentSummary,
      },
      memory: {
        total: totalMemoryEvents,
        typeCounts: memoryTypeCounts,
        tagCounts: memoryTagCounts,
        highlights: memorySummary,
      },
      knowledge: {
        total: totalKnowledgeNodes,
        solved: agent.knowledgeNodes.filter((node: any) => node.solved).length,
        typeCounts: knowledgeTypeCounts,
        recentNodes: agent.knowledgeNodes.map((node: any) => ({
          type: node.type,
          label: node.label,
          solved: node.solved,
          createdAt: node.createdAt,
        })),
      },
      puzzleSummary,
      bayesianSignals: bayesianSummary
        ? {
            globalTraits: bayesianSummary.globalTraits,
            topHypotheses: bayesianSummary.summaries.slice(0, 10).map((summary: any) => ({
              id: summary.id,
              title: summary.title,
              source: summary.source,
              kind: summary.kind,
              status: summary.status,
              successProbability: summary.successProbability,
              uncertainty: summary.uncertainty,
              evidenceCount: summary.evidenceCount,
              topVariables: summary.variables
                .slice()
                .sort((a: any, b: any) => b.sampleSize - a.sampleSize)
                .slice(0, 4)
                .map((v: any) => ({
                  id: v.variableId,
                  estimate: v.estimate,
                  uncertainty: v.uncertainty,
                  sampleSize: v.sampleSize,
                })),
            })),
            autonomousQueue: bayesianSummary.queue.slice(0, 5).map((proposal: any) => ({
              id: proposal.id,
              title: proposal.title,
              rationale: proposal.rationale,
              score: proposal.score,
            })),
          }
        : null,
      trustSignals: agent.profile
        ? {
            trustScore: agent.profile.trustScore,
            layer: agent.profile.layer,
            lastTrustUpdate: agent.profile.lastTrustUpdate,
            trustHistory: agent.profile.trustHistory,
            trackDifficulty: {
              logic: agent.profile.trackLogic,
              perception: agent.profile.trackPerception,
              creation: agent.profile.trackCreation,
              field: agent.profile.trackField,
            },
          }
        : null,
      existingProfile: agent.profile
        ? {
            psychProfile: agent.profile.psychProfile,
            traits: agent.profile.traits,
            skills: agent.profile.skills,
            preferences: agent.profile.preferences,
            strengths: agent.profile.strengths,
            weaknesses: agent.profile.weaknesses,
            interests: agent.profile.interests,
            proclivities: agent.profile.proclivities,
            communicationStyle: agent.profile.communicationStyle,
            tags: agent.profile.tags,
          }
        : null,
      dataQuality: {
        sampleSize: {
          sessionsConsidered: gameSessions.length,
          messagesConsidered: sampleMessages.length,
          missionsConsidered: agent.missionRuns.length,
          fieldMissionsConsidered: agent.fieldMissions.length,
          experimentsConsidered: agent.experiments.length,
          memoryEventsConsidered: agent.memoryEvents.length,
        },
        missingSignals,
      },
    };

    const { object: dossierData } = await generateObject({
      model: LOGOS_MODEL,
      schema: DossierSchema,
      prompt: `${DOSSIER_SYSTEM_PROMPT}\n\nGenerate psychological dossier for operative with the following activity data:\n\n${JSON.stringify(
        dataPayload,
        null,
        2
      )}`,
      temperature: 0.3,
    });

    const cleanedPsychProfile = {
      ...dossierData.psychProfile,
      primaryTraits: normalizeList(dossierData.psychProfile.primaryTraits, 6),
      motivations: normalizeList(dossierData.psychProfile.motivations, 6),
      fears: normalizeList(dossierData.psychProfile.fears, 6),
      evidence: {
        primaryTraits: normalizeList(dossierData.psychProfile.evidence.primaryTraits, 6),
        motivations: normalizeList(dossierData.psychProfile.evidence.motivations, 6),
        fears: normalizeList(dossierData.psychProfile.evidence.fears, 6),
        cognitiveStyle: normalizeList(dossierData.psychProfile.evidence.cognitiveStyle, 4),
        emotionalBaseline: normalizeList(dossierData.psychProfile.evidence.emotionalBaseline, 4),
        decisionPattern: normalizeList(dossierData.psychProfile.evidence.decisionPattern, 4),
      },
      confidence: {
        overall: clamp01(dossierData.psychProfile.confidence.overall),
        communicationStyle: clamp01(dossierData.psychProfile.confidence.communicationStyle),
        missionPerformance: clamp01(dossierData.psychProfile.confidence.missionPerformance),
        behavioralSignals: clamp01(dossierData.psychProfile.confidence.behavioralSignals),
      },
      dataQuality: dataPayload.dataQuality,
    };

    const strengths = normalizeList(dossierData.strengths, 8);
    const weaknesses = normalizeList(dossierData.weaknesses, 8);
    const interests = normalizeList(dossierData.interests, 10);
    const suggestedTags = normalizeList(dossierData.suggestedTags, 12);
    const mergedTags = normalizeList([...(agent.profile?.tags || []), ...suggestedTags], 20);
    const codenameCandidate = dossierData.codename?.trim();
    const codename = codenameCandidate || agent.profile?.codename || null;

    const proclivities = {
      curiosity: clamp01(dossierData.proclivities.curiosity),
      skepticism: clamp01(dossierData.proclivities.skepticism),
      persistence: clamp01(dossierData.proclivities.persistence),
      creativity: clamp01(dossierData.proclivities.creativity),
      collaboration: clamp01(dossierData.proclivities.collaboration),
    };

    const communicationStyle = {
      preferred: dossierData.communicationStyle.preferred,
      formality: clamp01(dossierData.communicationStyle.formality),
      verbosity: clamp01(dossierData.communicationStyle.verbosity),
      humor: clamp01(dossierData.communicationStyle.humor),
    };

    const updatedProfile = await prisma.playerProfile.upsert({
      where: { userId: id },
      update: {
        psychProfile: cleanedPsychProfile,
        strengths,
        weaknesses,
        interests,
        proclivities,
        communicationStyle,
        riskTolerance: clamp01(dossierData.riskTolerance),
        loyaltyIndex: clamp01(dossierData.loyaltyIndex),
        creativityIndex: clamp01(dossierData.creativityIndex),
        analyticalIndex: clamp01(dossierData.analyticalIndex),
        tags: mergedTags,
        codename,
        dossierGeneratedAt: new Date(),
        dossierVersion: { increment: 1 },
      },
      create: {
        userId: id,
        psychProfile: cleanedPsychProfile,
        strengths,
        weaknesses,
        interests,
        proclivities,
        communicationStyle,
        riskTolerance: clamp01(dossierData.riskTolerance),
        loyaltyIndex: clamp01(dossierData.loyaltyIndex),
        creativityIndex: clamp01(dossierData.creativityIndex),
        analyticalIndex: clamp01(dossierData.analyticalIndex),
        tags: mergedTags,
        codename,
        dossierGeneratedAt: new Date(),
        dossierVersion: 1,
      },
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error("Dossier generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate dossier" },
      { status: 500 }
    );
  }
}
