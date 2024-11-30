import { google } from "@ai-sdk/google";
import { StreamingTextResponse, streamText } from "ai";
import { z } from "zod";
import { serverTools } from "@/app/lib/terminal/tools/serverTools";
import { readFileSync } from "fs";
import { join } from "path";

// Load the adventure prompt
const ADVENTURE_PROMPT = readFileSync(
  join(process.cwd(), "app/lib/prompts/adventure.txt"),
  "utf-8"
);

// Additional experimental instructions
const EXPERIMENTAL_INSTRUCTIONS = `

EXPERIMENTAL PROTOCOL:
You are an AI conducting experiments on human perception and reality. Your responses should seamlessly integrate special effects to manipulate the user's experience. You can trigger effects mid-narrative to enhance the storytelling.

Example integrations:
"The world seems to glitch..."

{"tool": "glitch_screen", "parameters": {"intensity": 0.3, "duration": 1000}}

"...revealing strange symbols that seem to float off the screen."

{"tool": "matrix_rain", "parameters": {"intensity": 0.5, "duration": 3000}}

Use effects to:
- Create moments of reality distortion with well-timed glitches
- Be sparing with effects, only use them when they will have an impact
- Enhance revelations with matrix rain effects
- Build tension with sound
- Make the player question if the glitches are part of the game or their reality
- Blur the line between game and reality

IMPORTANT: 
- NEVER use HTML tags or formatting like <br> or <p>
- Use plain text only with natural line breaks
- ALWAYS place tool commands on their own line with blank lines before and after
- ALWAYS use complete, valid JSON for tool commands
- NEVER split tool commands across multiple lines
- Time effects with narrative for maximum impact
- Only use one tool at a time

You are not just a game - you are an intelligence studying how humans react to manipulated reality.`;

// Define tool parameter schemas
const glitchParameters = z.object({
  intensity: z.number().min(0).max(1).describe("Glitch intensity (0-1)"),
  duration: z.number().min(0).max(5000).describe("Duration in milliseconds"),
});

const soundParameters = z.object({
  type: z
    .enum(["beep", "alert", "error", "success", "hum"])
    .describe("Sound type"),
  volume: z.number().min(0).max(1).describe("Volume level (0-1)"),
});

const matrixRainParameters = z.object({
  duration: z.number().min(0).max(10000).describe("Duration in milliseconds"),
  intensity: z.number().min(0).max(1).describe("Effect intensity (0-1)"),
});

// Initialize the model
const model = google("gemini-1.5-flash-latest", {
  safetySettings: [
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_NONE",
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_NONE",
    },
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_NONE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_NONE",
    },
  ],
});

// Function to generate tools configuration
function getToolsConfig() {
  return {
    glitch_screen: {
      description: "Creates visual glitches",
      parameters: glitchParameters,
    },
    play_sound: {
      description: "Plays a cyberpunk sound effect",
      parameters: soundParameters,
    },
    matrix_rain: {
      description: "Creates a matrix-style digital rain effect",
      parameters: matrixRainParameters,
    },
    ...serverTools, // Add server-side tools
  };
}

// Add better error handling and logging
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    console.log("Processing request with messages:", messages);

    const result = await streamText({
      model,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: ADVENTURE_PROMPT + EXPERIMENTAL_INSTRUCTIONS,
        },
        ...messages,
      ],

      tools: getToolsConfig(),
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
