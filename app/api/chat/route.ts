import { EventSystem } from "@/app/lib/events/EventSystem";
import { openai } from "@vercel/ai";
import { StreamingTextResponse } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const eventSystem = EventSystem.getInstance();

  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages,
    tools: eventSystem.getToolDefinitions(),
    stream: true,
  });

  return new StreamingTextResponse(response);
}
