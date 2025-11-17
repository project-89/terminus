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

const ADVENTURE_MODEL = getModel("adventure");

type AdventureContext = {
  sessionId?: string;
  handle?: string;
  // Optional hint used to mark a turn immediately after a report submission
  reportJustSubmitted?: boolean;
};

// Function to generate tools configuration
function getToolsConfig(_context?: AdventureContext) {
  return {
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
      tools: getToolsConfig(context),
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
