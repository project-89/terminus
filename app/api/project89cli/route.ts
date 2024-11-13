import { google } from "@ai-sdk/google";
import { StreamingTextResponse, streamText } from "ai";
import { loadPrompt } from "@/app/lib/prompts";

const model = google("gemini-1.5-pro-latest", {
  safetySettings: [
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_NONE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
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

// Load the Project89 CLI prompt at startup
const SYSTEM_PROMPT = loadPrompt("project89-cli");

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    const result = await streamText({
      model,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        ...messages,
      ],
    });

    return new StreamingTextResponse(result.textStream);
  } catch (error) {
    console.error("AI Error:", error);
    return new Response(JSON.stringify({ error: "AI processing failed" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
