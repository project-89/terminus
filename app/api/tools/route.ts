import { StreamingTextResponse, streamText, type CoreMessage } from "ai";
import { loadOpsTools } from "@/app/lib/opsTools/loader";
import { getModel } from "@/app/lib/ai/models";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || "list");
  const tools = loadOpsTools();

  if (action === "list") {
    const list = Array.from(tools.values()).map((t) => ({
      name: t.name,
      title: t.title,
      description: t.description,
      tags: t.tags,
    }));
    return new Response(JSON.stringify({ tools: list }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (action === "run") {
    const name = String(body?.name || "").trim();
    const input = String(body?.input || "");
    const tool = tools.get(name);
    if (!tool) {
      return new Response(JSON.stringify({ error: "tool not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const modelKey = (tool.model as any) || "content";
    const model = getModel("content");

    const system = `${tool.title}\n\n${tool.description || ""}\n\n${tool.content}`.trim();
    const messages: CoreMessage[] = [
      { role: "system", content: system },
      ...(input ? ([{ role: "user", content: input }] as CoreMessage[]) : []),
    ];

    const result = await streamText({ model, messages, temperature: tool.temperature ?? 0.4 });
    return new StreamingTextResponse(result.textStream);
  }

  return new Response(JSON.stringify({ error: "unknown action" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
