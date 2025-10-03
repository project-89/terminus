import { StreamingTextResponse, streamText } from "ai";
import { loadPrompt } from "@/app/lib/prompts";
import { getModel } from "@/app/lib/ai/models";

const CLI_MODEL = getModel("cli");
const SYSTEM_PROMPT = loadPrompt("project89-cli");

export async function POST(req: Request) {
  const { messages } = await req.json();

  if (!Array.isArray(messages)) {
    return new Response(
      JSON.stringify({ error: "Request body must include a messages array" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const result = await streamText({
      model: CLI_MODEL,
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
    console.error("CLI AI Error:", error);
    return new Response(JSON.stringify({ error: "AI processing failed" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
