import { generateObject } from "ai";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import prisma from "@/app/lib/prisma";

// Use a fast flash model for classification
const CLASSIFIER_MODEL = google(
  process.env.PROJECT89_CLASSIFIER_MODEL ?? "gemini-3-flash-preview"
);

const ClassificationSchema = z.object({
  isReal: z.boolean().describe("True if this is about the user's REAL life, not game interaction"),
  type: z.enum(["observation", "dream", "synchronicity", "report", "personal", "game"]),
  extract: z.string().nullable().describe("Cleaned/summarized content if real, null if game-only"),
  confidence: z.number().min(0).max(1).describe("Confidence score 0-1"),
});

type Classification = z.infer<typeof ClassificationSchema>;

const CLASSIFIER_PROMPT = `You classify messages from players in a text adventure game called Project 89.
Determine if the message contains REAL-WORLD content from the player's actual life, or is just GAME interaction.

REAL-WORLD examples (things that happened in their actual life):
- "I saw graffiti with the number 89 on my walk today"
- "I had a weird dream about signals and static last night"
- "Took this photo at the abandoned building downtown"
- "My clock stopped at 3:33 twice this week - strange coincidence"
- "I've been feeling like reality is thin lately"
- Sharing actual photos, locations, experiences

GAME-ONLY examples (interacting with the text adventure):
- "look around", "examine the door", "go north"
- "I'll try entering the code"
- Responding to game narrative prompts
- "what's in the room?", "talk to the figure"
- Roleplaying within the game world

If REAL: extract the meaningful content, cleaned up.
If GAME: set extract to null.

Be generous - if someone shares something personal or experiential, that's real.
Game commands are usually short imperatives or responses to prompts.`;

/**
 * Classify a single user message and extract real-world content if present.
 * Designed to be called as a non-blocking side effect.
 */
export async function classifyAndExtractMemory(params: {
  userId: string;
  sessionId: string;
  message: string;
}): Promise<Classification | null> {
  const { userId, sessionId, message } = params;

  // Skip very short messages (likely game commands)
  if (message.length < 15) {
    return null;
  }

  // Skip obvious game commands
  const gameCommands = /^(look|go|examine|take|use|open|close|north|south|east|west|up|down|inventory|help|quit|yes|no|ok|okay)\b/i;
  if (gameCommands.test(message.trim())) {
    return null;
  }

  try {
    const { object: classification } = await generateObject({
      model: CLASSIFIER_MODEL,
      schema: ClassificationSchema,
      prompt: `${CLASSIFIER_PROMPT}\n\nMessage to classify:\n"${message}"`,
      temperature: 0.1, // Low temperature for consistent classification
    });

    // Only save high-confidence real content
    if (classification.isReal && classification.confidence >= 0.7 && classification.extract) {
      await saveExtractedMemory({
        userId,
        sessionId,
        type: classification.type,
        content: classification.extract,
        originalMessage: message,
        confidence: classification.confidence,
      });
    }

    return classification;
  } catch (error) {
    // Don't let classification errors break the main flow
    console.error("[MemoryExtraction] Classification failed:", error);
    return null;
  }
}

/**
 * Save an extracted real-world memory
 */
async function saveExtractedMemory(params: {
  userId: string;
  sessionId: string;
  type: string;
  content: string;
  originalMessage: string;
  confidence: number;
}) {
  const { userId, sessionId, type, content, originalMessage, confidence } = params;

  // Map classification type to MemoryEventType
  const typeMap: Record<string, string> = {
    observation: "OBSERVATION",
    dream: "OBSERVATION", // Could create DREAM type if needed
    synchronicity: "OBSERVATION",
    report: "REPORT",
    personal: "REFLECTION",
  };

  const memoryType = typeMap[type] || "OBSERVATION";

  try {
    await prisma.memoryEvent.create({
      data: {
        userId,
        sessionId,
        type: memoryType as any,
        content,
        tags: [
          `extracted:${type}`,
          `confidence:${Math.round(confidence * 100)}`,
          "source:real_world",
        ],
      },
    });

    console.log(
      `[MemoryExtraction] Saved ${type} memory for user ${userId} (confidence: ${Math.round(confidence * 100)}%)`
    );
  } catch (error) {
    console.error("[MemoryExtraction] Failed to save memory:", error);
  }
}

/**
 * Fire-and-forget wrapper - call this from message processing
 */
export function extractMemoryAsync(params: {
  userId: string;
  sessionId: string;
  message: string;
}): void {
  // Don't await - let it run in background
  classifyAndExtractMemory(params).catch((err) => {
    console.error("[MemoryExtraction] Async extraction failed:", err);
  });
}

/**
 * Batch process a session's messages (for backfill or reprocessing)
 */
export async function extractMemoriesFromSession(sessionId: string): Promise<number> {
  const session = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: {
        where: { role: "user" },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  let extracted = 0;

  for (const msg of session.messages) {
    const result = await classifyAndExtractMemory({
      userId: session.userId,
      sessionId: session.id,
      message: msg.content,
    });

    if (result?.isReal && result.confidence >= 0.7) {
      extracted++;
    }

    // Small delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 100));
  }

  return extracted;
}
