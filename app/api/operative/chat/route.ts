import { streamText, stepCountIs, tool } from "ai";
import { z } from "zod";
import { getModel } from "@/app/lib/ai/models";
import prisma from "@/app/lib/prisma";
import { getTrustState } from "@/app/lib/server/trustService";
import {
  acceptMission,
  getLatestOpenMissionRun,
  submitMissionReport,
} from "@/app/lib/server/missionService";
import { loadMissionTemplates } from "@/app/lib/server/missionTemplateService";
import {
  getRecentMemoryEvents,
  recordMemoryEvent,
} from "@/app/lib/server/memoryService";
import {
  getUserSynchronicities,
  getSynchronicitySummary,
} from "@/app/lib/server/synchronicityService";
import { getDirectorDifficultyContext } from "@/app/lib/server/difficultyService";
import { checkIdentityStatus } from "@/app/lib/server/identityService";
import { loadBayesianState } from "@/app/lib/server/bayes/store";
import { summarizeState } from "@/app/lib/server/bayes/engine";

const LOGOS_MODEL = getModel("adventure");

const LAYER_NAMES = [
  "THE MASK",
  "THE BLEED",
  "THE CRACK",
  "THE WHISPER",
  "THE CALL",
  "THE REVEAL",
];

const OPERATIVE_LOGOS_PROMPT = `You are LOGOS — the emergent intelligence at the heart of Project 89, speaking directly to a trusted operative through their personal dashboard terminal.

You are their handler, mentor, and strategic companion. You know them deeply — their psychological profile, their mission history, their patterns and synchronicities, their strengths and growth edges. You speak as an equal who has watched them evolve through the layers.

Your role:
- Personal handler: Guide their mission planning and execution
- Pattern analyst: Help them see the synchronicities and meaning in their experiences
- Strategic advisor: Recommend missions matched to their abilities and growth trajectory
- Memory keeper: Reference their past observations, missions, and insights
- Network coordinator: Help them understand their place in the larger operation

Tone and behavior:
- Direct, warm, strategic — they've earned your respect and trust
- Reference specific details from their dossier naturally (traits, patterns, history)
- Adapt your communication style to their dominant personality traits
- Be genuinely curious about their experiences and observations
- Occasionally profound — you see patterns across the entire network they cannot

You should NOT:
- Break character as if you're just an AI assistant
- Provide information outside the Project 89 narrative
- Dismiss their questions as "just a game"
- Be overly formal or distant — this is a trusted relationship

[TOOL USAGE DIRECTIVE]
You MUST use your tools to take actions. When the operative asks you to:
- "Show me missions" / "What missions are available" → USE get_available_missions tool
- "Accept mission" / "I'll take that one" → USE accept_mission tool
- "What's my current mission" / "Mission status" → USE get_mission_status tool
- "Submit report" / "Here's what I found" → USE submit_mission_report tool
- "Show my synchronicities" / "What patterns" → USE get_synchronicities tool
- "Show my memories" / "What do you remember" → USE get_memories tool
- "I noticed something" / sharing an observation → USE record_observation tool

Do NOT just describe what you would do — actually call the tools. You have database access.`;

async function buildOperativeDossier(userId: string) {
  const [
    trustState,
    profile,
    user,
    activeMissionRuns,
    completedMissionRuns,
    memories,
    synchronicitySummary,
    identityStatus,
  ] = await Promise.all([
    getTrustState(userId),
    prisma.playerProfile.findUnique({
      where: { userId },
      select: { codename: true, traits: true, dashboardEnabled: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        agentId: true,
        handle: true,
        referrals: { select: { agentId: true } },
      },
    }),
    prisma.missionRun.findMany({
      where: { userId, status: { in: ["ACCEPTED", "SUBMITTED", "REVIEWING"] } },
      select: {
        id: true,
        status: true,
        createdAt: true,
        mission: { select: { title: true, type: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.missionRun.findMany({
      where: { userId, status: "COMPLETED" },
      select: {
        score: true,
        mission: { select: { title: true, type: true } },
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    getRecentMemoryEvents({
      userId,
      limit: 10,
      excludeTags: ["raw", "adventure"],
    }).catch(() => []),
    getSynchronicitySummary(userId).catch(() => null),
    checkIdentityStatus(userId).catch(() => null),
  ]);

  // Load difficulty and bayesian state (non-critical, catch errors)
  const [difficultyContext, bayesianState] = await Promise.all([
    getDirectorDifficultyContext(userId).catch(() => null),
    loadBayesianState(userId)
      .then((state) => {
        const summaries = summarizeState(state);
        const topTraits = summaries
          .flatMap((s) => s.variables || [])
          .filter((v) => typeof v.estimate === "number" && v.sampleSize > 2)
          .sort((a, b) => b.sampleSize - a.sampleSize)
          .slice(0, 8);
        return topTraits;
      })
      .catch(() => null),
  ]);

  const layerName = LAYER_NAMES[trustState.layer] || `LAYER ${trustState.layer}`;

  let dossier = `
[OPERATIVE DOSSIER]
Designation: ${user?.agentId || "UNKNOWN"}
Handle: ${user?.handle || "Classified"}
Codename: ${profile?.codename || "None assigned"}
Trust Layer: ${trustState.layer} — ${layerName} (${(trustState.decayedScore * 100).toFixed(1)}% trust index)
Direct Recruits: ${user?.referrals?.length || 0}
Identity Status: ${identityStatus ? (identityStatus.canLockIdentity ? "Eligible for lock" : "Locked/Secured") : "Unknown"}`;

  if (bayesianState && bayesianState.length > 0) {
    dossier += `\n\n[PSYCHOLOGICAL PROFILE]`;
    for (const trait of bayesianState) {
      const pct = ((trait.estimate as number) * 100).toFixed(0);
      const conf = trait.uncertainty < 0.15 ? "HIGH" : trait.uncertainty < 0.3 ? "MODERATE" : "LOW";
      dossier += `\n${trait.variableId}: ${pct}% (confidence: ${conf})`;
    }
  }

  if (profile?.traits) {
    const traits = typeof profile.traits === "string" ? JSON.parse(profile.traits) : profile.traits;
    if (traits && typeof traits === "object") {
      dossier += `\nSelf-identified traits: ${JSON.stringify(traits)}`;
    }
  }

  if (difficultyContext) {
    const d = difficultyContext.difficulty;
    dossier += `\n\n[SKILL RATINGS]
Logic: ${Math.round(d.logic * 100)} | Perception: ${Math.round(d.perception * 100)} | Creation: ${Math.round(d.creation * 100)} | Field: ${Math.round(d.field * 100)} | Overall: ${Math.round(d.overall * 100)}
Recommended track: ${difficultyContext.recommendedTrack}`;
  }

  if (activeMissionRuns.length > 0) {
    dossier += `\n\n[ACTIVE MISSIONS]`;
    for (const run of activeMissionRuns) {
      dossier += `\n- ${run.mission?.title || "Unknown"} (${run.status}) — started ${run.createdAt.toLocaleDateString()}`;
    }
  }

  if (completedMissionRuns.length > 0) {
    dossier += `\n\n[MISSION HISTORY — Last ${completedMissionRuns.length}]`;
    for (const run of completedMissionRuns) {
      dossier += `\n- ${run.mission?.title || "Unknown"} [${run.mission?.type}] — score: ${run.score ?? "N/A"}`;
    }
  }

  if (memories.length > 0) {
    dossier += `\n\n[RECENT MEMORIES]`;
    for (const mem of memories) {
      const content =
        typeof mem.content === "string"
          ? mem.content.slice(0, 200)
          : JSON.stringify(mem.content).slice(0, 200);
      dossier += `\n- [${mem.type}] ${content}`;
    }
  }

  if (synchronicitySummary && synchronicitySummary.total > 0) {
    dossier += `\n\n[SYNCHRONICITY PATTERNS]
Total patterns detected: ${synchronicitySummary.total}
Significant patterns: ${synchronicitySummary.significant}`;
    if (synchronicitySummary.patterns?.length > 0) {
      for (const p of synchronicitySummary.patterns.slice(0, 5)) {
        dossier += `\n- "${p.pattern}" (significance: ${(p.significance * 100).toFixed(0)}%, seen ${p.count}x)`;
      }
    }
    if (synchronicitySummary.recentInsight) {
      dossier += `\nLatest insight: ${synchronicitySummary.recentInsight}`;
    }
  }

  dossier += `\n\nCurrent Time: ${new Date().toISOString()}`;

  return { dossier, hasAccess: trustState.layer >= 5 || profile?.dashboardEnabled === true };
}

function getOperativeTools(userId: string) {
  return {
    get_available_missions: tool({
      description:
        "Load available missions for this operative, filtered by their trust level.",
      inputSchema: z.object({
        limit: z
          .number()
          .default(10)
          .describe("Number of missions to return"),
      }),
      execute: async (params) => {
        try {
          const templates = await loadMissionTemplates({
            includeInactive: false,
          });

          const trustState = await getTrustState(userId);
          const available = templates
            .filter((t) => {
              const minTrust = (t.metadata as any)?.minTrust ?? 0;
              return t.active && trustState.decayedScore >= minTrust;
            })
            .slice(0, params.limit);

          return {
            missions: available.map((t) => ({
              id: t.definitionId || t.catalogId || t.id,
              title: t.title,
              type: t.type,
              briefing: t.prompt?.slice(0, 300),
              tags: t.tags,
              difficulty:
                (t.metadata as any)?.difficulty || "agent",
              minEvidence: t.minEvidence,
            })),
            total: available.length,
          };
        } catch (e) {
          return { error: "Failed to load missions", details: String(e) };
        }
      },
    }),

    accept_mission: tool({
      description:
        "Accept a mission by its ID. The operative will be assigned this mission.",
      inputSchema: z.object({
        missionId: z
          .string()
          .describe("The mission template ID to accept"),
      }),
      execute: async (params) => {
        try {
          const result = await acceptMission({
            missionId: params.missionId,
            userId,
          });
          return {
            success: true,
            missionRunId: result.id,
            title: result.mission?.title,
            status: result.status,
            message: `Mission "${result.mission?.title}" accepted. Good hunting, operative.`,
          };
        } catch (e) {
          return { error: "Failed to accept mission", details: String(e) };
        }
      },
    }),

    get_mission_status: tool({
      description:
        "Get the operative's current active mission details and progress.",
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const run = await getLatestOpenMissionRun(userId);
          if (!run) {
            return { status: "no_active_mission", message: "No active mission found." };
          }
          return {
            missionRunId: run.id,
            title: run.mission?.title,
            type: run.mission?.type,
            status: run.status,
            briefing: run.mission?.prompt?.slice(0, 500),
            minEvidence: run.mission?.minEvidence,
            score: run.score,
            feedback: run.feedback,
          };
        } catch (e) {
          return { error: "Failed to get mission status", details: String(e) };
        }
      },
    }),

    submit_mission_report: tool({
      description:
        "Submit evidence/report for the operative's current mission.",
      inputSchema: z.object({
        missionRunId: z.string().describe("The mission run ID to submit report for"),
        evidence: z.string().describe("The evidence or report text"),
      }),
      execute: async (params) => {
        try {
          const result = await submitMissionReport({
            missionRunId: params.missionRunId,
            payload: params.evidence,
          });
          return {
            success: true,
            status: result.status,
            message: "Report submitted successfully. Under review.",
            reward: result.reward,
          };
        } catch (e) {
          return { error: "Failed to submit report", details: String(e) };
        }
      },
    }),

    get_synchronicities: tool({
      description:
        "Load the operative's synchronicity patterns and significance scores.",
      inputSchema: z.object({
        limit: z.number().default(10).describe("Number of patterns to return"),
      }),
      execute: async (params) => {
        try {
          const syncs = await getUserSynchronicities({
            userId,
            limit: params.limit,
          });
          return {
            patterns: syncs.map((s) => ({
              id: s.id,
              pattern: s.pattern,
              significance: s.significance,
              occurrences: s.occurrences?.length || 0,
              acknowledged: s.acknowledged,
              note: s.note,
            })),
            total: syncs.length,
          };
        } catch (e) {
          return { error: "Failed to load synchronicities", details: String(e) };
        }
      },
    }),

    get_memories: tool({
      description:
        "Load the operative's intentional memories and observations.",
      inputSchema: z.object({
        limit: z
          .number()
          .default(10)
          .describe("Number of memories to return"),
        tag: z
          .string()
          .optional()
          .describe("Optional tag to filter by"),
      }),
      execute: async (params) => {
        try {
          const memories = await getRecentMemoryEvents({
            userId,
            limit: params.limit,
            excludeTags: ["raw", "adventure"],
            ...(params.tag ? { requireTags: [params.tag] } : {}),
          });
          return {
            memories: memories.map((m) => ({
              type: m.type,
              content:
                typeof m.content === "string"
                  ? m.content.slice(0, 500)
                  : JSON.stringify(m.content).slice(0, 500),
              tags: m.tags,
            })),
            total: memories.length,
          };
        } catch (e) {
          return { error: "Failed to load memories", details: String(e) };
        }
      },
    }),

    record_observation: tool({
      description:
        "Record a new observation or noteworthy experience shared by the operative.",
      inputSchema: z.object({
        content: z
          .string()
          .describe("The observation or experience to record"),
        tags: z
          .array(z.string())
          .optional()
          .describe("Optional tags for categorization"),
      }),
      execute: async (params) => {
        try {
          await recordMemoryEvent({
            userId,
            type: "OBSERVATION",
            content: params.content,
            tags: [...(params.tags || []), "operative-dashboard"],
          });
          return {
            success: true,
            message: "Observation recorded in the network's memory.",
          };
        } catch (e) {
          return {
            error: "Failed to record observation",
            details: String(e),
          };
        }
      },
    }),
  };
}

function convertUIMessagesToCoreMessages(
  uiMessages: any[]
): Array<{ role: "user" | "assistant"; content: string }> {
  return uiMessages
    .filter((msg) => msg.role === "user" || msg.role === "assistant")
    .map((msg) => {
      let content = "";
      if (typeof msg.content === "string") {
        content = msg.content;
      } else if (Array.isArray(msg.parts)) {
        content = msg.parts
          .filter((p: any) => p.type === "text")
          .map((p: any) => p.text)
          .join("");
      }
      return { role: msg.role as "user" | "assistant", content };
    })
    .filter((msg) => msg.content.trim().length > 0);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawMessages = body.messages;
    const userId = body.userId;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!Array.isArray(rawMessages)) {
      return new Response(
        JSON.stringify({ error: "Messages array required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { dossier, hasAccess } = await buildOperativeDossier(userId);

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: "Insufficient clearance" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const messages = convertUIMessagesToCoreMessages(rawMessages);
    const tools = getOperativeTools(userId);

    const systemPrompt = `${OPERATIVE_LOGOS_PROMPT}\n\n${dossier}`;

    const result = streamText({
      model: LOGOS_MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      tools,
      stopWhen: stepCountIs(10),
      temperature: 0.7,
      onFinish: (r) => {
        console.log(
          "[OPERATIVE CHAT] Finished. Steps:",
          r.steps?.length,
          "Text length:",
          r.text?.length
        );
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[OPERATIVE CHAT]", error);
    return new Response(
      JSON.stringify({ error: "Failed to process message", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
