import { streamText, type ModelMessage } from "ai";
import { loadOpsTools } from "@/app/lib/opsTools/loader";
import { getModel } from "@/app/lib/ai/models";
import { validateAdminAuth } from "@/app/lib/server/adminAuth";

export async function POST(req: Request) {
  // Ops tools are admin-only
  const auth = validateAdminAuth(req);
  if (!auth.authorized) return auth.response;

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

    const modelKey = (tool.model as string) || "content";
    const model = getModel(modelKey as any);

    const system = `${tool.title}\n\n${tool.description || ""}\n\n${tool.content}`.trim();
    const messages: ModelMessage[] = [
      { role: "system", content: system },
      ...(input ? ([{ role: "user", content: input }] as ModelMessage[]) : []),
    ];

    const result = streamText({ model, messages, temperature: tool.temperature ?? 0.4 });
    return result.toTextStreamResponse();
  }

  return new Response(JSON.stringify({ error: "unknown action" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
