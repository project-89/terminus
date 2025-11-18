import { StreamingTextResponse, streamText } from "ai";
import { z } from "zod";
import { serverTools } from "@/app/lib/terminal/tools/serverTools";
import { loadPrompt } from "@/app/lib/prompts";
import { getModel } from "@/app/lib/ai/models";
import { buildAdventureSystemPrompt } from "@/app/lib/ai/promptBuilder";
import { buildDirectorContext } from "@/app/lib/server/directorService";
import { loadKnowledge } from "@/app/lib/ai/knowledge";
import { loadIFCanon } from "@/app/lib/ai/canon";

const ADVENTURE_PROMPT = loadIFCanon();

// Define tool parameter schemas
const glitchParameters = z.object({
  intensity: z.number().min(0).max(1).describe("Glitch intensity (0-1)"),
  duration: z.number().min(0).max(5000).describe("Duration in milliseconds"),
});

const soundParameters = z.object({
  description: z
    .string()
    .describe("Concise description of the sound to generate"),
  duration: z.number().min(0.1).max(10).describe("Duration in seconds"),
  influence: z
    .number()
    .min(0)
    .max(1)
    .default(0.7)
    .describe("Prompt influence (0-1)"),
});

const matrixRainParameters = z.object({
  duration: z.number().min(0).max(10000).describe("Duration in milliseconds"),
  intensity: z.number().min(0).max(1).describe("Effect intensity (0-1)"),
});

const experimentCreateParameters = z.object({
  id: z
    .string()
    .min(3)
    .max(64)
    .optional()
    .describe("Stable experiment id (exp-*) if you need to reference it later"),
  hypothesis: z
    .string()
    .min(4)
    .describe("Hypothesis you are testing about the agent"),
  task: z.string().min(4).describe("Task or ritual you want the agent to perform"),
  success_criteria: z
    .string()
    .optional()
    .describe("How you will judge success (text; optional)"),
  timeout_s: z
    .number()
    .int()
    .min(5)
    .max(600)
    .optional()
    .describe("Time budget in seconds"),
  title: z
    .string()
    .optional()
    .describe("Optional display title for ops surfaces"),
});

const experimentNoteParameters = z.object({
  id: z.string().min(3).describe("Experiment id to add the note to"),
  observation: z
    .string()
    .optional()
    .describe("Short note about what you observed"),
  result: z
    .string()
    .optional()
    .describe("pass/fail/aborted style summary"),
  score: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe("Score 0..1 if you measured it"),
});

const ADVENTURE_MODEL = getModel("adventure");

const missionRequestParameters = z.object({
  missionId: z.string().optional().describe("Specific mission id to run"),
  intent: z.string().optional().describe("Reason or hint for the mission request"),
});

const missionExpectReportParameters = z.object({
  prompt: z
    .string()
    .min(4)
    .describe("Guidance for the agent on what evidence to report"),
});

const profileSetParameters = z.object({
  path: z
    .string()
    .min(3)
    .describe("Profile path to update (e.g. preferences.intensity)"),
  value: z.union([z.string(), z.number(), z.boolean()]).describe("Value to set"),
});

const personaSetParameters = z.object({
  mode: z.enum(["cloak", "reveal", "neutral"]).describe("Persona stance"),
  duration_s: z
    .number()
    .min(0.5)
    .max(60)
    .optional()
    .describe("Optional duration for the effect"),
});

const screenTransitionParameters = z.object({
  to: z.string().describe("Screen id to transition to (home/adventure/...)"),
  options: z.any().optional(),
});

type AdventureContext = {
  sessionId?: string;
  handle?: string;
  // Optional hint used to mark a turn immediately after a report submission
  reportJustSubmitted?: boolean;
  accessTier?: number;
  hasFullAccess?: boolean;
};

type ToolRuntimeContext = AdventureContext & {
  trustScore?: number;
};

// Function to generate tools configuration
function getToolsConfig(context?: ToolRuntimeContext) {
  const accessTier = context?.accessTier ?? 0;
  const trustScore = context?.trustScore ?? 0;
  const hasFullAccess = Boolean(context?.hasFullAccess);

  const allowOpsTools = hasFullAccess || accessTier >= 1 || trustScore >= 0.55;
  const allowDirectorTools = hasFullAccess || accessTier >= 2 || trustScore >= 0.75;

  const toolset: Record<string, any> = {
    glitch_screen: {
      description: "Creates visual glitches",
      parameters: glitchParameters,
    },
    generate_sound: {
      description:
        "Generates and plays an AI-generated sound effect based on description. Use this to enhace the story or alter reality.",
      parameters: soundParameters,
    },
    matrix_rain: {
      description: "Creates a matrix-style digital rain effect",
      parameters: matrixRainParameters,
    },
    experiment_create: {
      description:
        "Log a new behavioral experiment you want the agent to perform. Use before giving the task.",
      parameters: experimentCreateParameters,
    },
    experiment_note: {
      description:
        "Append an observation/result to an active experiment once the agent reacts.",
      parameters: experimentNoteParameters,
    },
  };

  if (allowOpsTools) {
    Object.assign(toolset, {
      mission_request: {
        description: "Issue (or retrieve) the next mission for the agent.",
        parameters: missionRequestParameters,
      },
      mission_expect_report: {
        description: "Tell the agent you are waiting for evidence/reporting.",
        parameters: missionExpectReportParameters,
      },
      profile_set: {
        description: "Update the agent profile/preferences.",
        parameters: profileSetParameters,
      },
    });
  }

  if (allowDirectorTools) {
    Object.assign(toolset, {
      screen_transition: {
        description: "Switch the player to another terminal surface.",
        parameters: screenTransitionParameters,
      },
      persona_set: {
        description: "Modulate the LOGOS persona (cloak/reveal).",
        parameters: personaSetParameters,
      },
    });
  }

  return {
    ...toolset,
    ...serverTools,
  };
}

// Add better error handling and logging
export async function POST(req: Request) {
  try {
    const { messages, context }: { messages: any[]; context?: AdventureContext } =
      await req.json();

    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Request body must include a messages array" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Filter out empty messages
    const validMessages = messages.filter(
      (msg: { content: string }) => msg.content && msg.content.trim() !== ""
    );

    console.log("Processing request with messages:", validMessages);

    // Build adaptive director context for the system prompt
    const directorCtx = await buildDirectorContext({
      handle: context?.handle,
      sessionId: context?.sessionId,
      reportJustSubmitted: Boolean(context?.reportJustSubmitted),
      clientAccessTier: context?.accessTier,
    });
    // Load local Project 89 knowledge (Markdown/JSON/TXT under app/knowledge)
    const knowledgeDocs = loadKnowledge();
    const knowledge = knowledgeDocs
      .slice(0, 3)
      .map((d) => `[# ${d.name}]\n${d.content}`)
      .join("\n\n");

    const system = buildAdventureSystemPrompt({
      ...directorCtx,
      // Attach knowledge snippets; retrieval can be made smarter later
      // @ts-ignore
      knowledge,
      // Include IF canon to constrain behavior
      canon: ADVENTURE_PROMPT,
    } as any);

    const tools = getToolsConfig({
      ...(context || {}),
      trustScore: directorCtx.player?.trustScore,
    });

    const result = await streamText({
      model: ADVENTURE_MODEL,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          // Use the new builder; keep legacy file content only if needed later.
          content: system,
        },
        ...validMessages,
      ],
      tools,
      onFinish: (result) => {
        console.log("*** Adventure API onFinish:", result.steps[0]);
      },
      experimental_toolCallStreaming: true,
    });

    console.log("Stream created, sending response");
    return new StreamingTextResponse(result.textStream);
  } catch (error) {
    console.error("Adventure API Error:", error);
    return new Response(
      JSON.stringify({
        error: "AI processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
