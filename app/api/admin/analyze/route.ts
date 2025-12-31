import { NextResponse } from "next/server";
import { streamText } from "ai";
import { getModel } from "@/app/lib/ai/models";

const ANALYST_MODEL = getModel("content");

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const handle = typeof body.handle === "string" ? body.handle : "Agent";
  const query = typeof body.query === "string" ? body.query : "";

  if (!query.trim()) {
    return NextResponse.json(
      { error: "Query required" },
      { status: 400 }
    );
  }

  const system = `You are ARCHITECT, an ops analyst for Project 89.
- Style: concise, tactical, supportive; 1–3 short paragraphs.
- Context: answering operator questions about agents, missions, and experiments.
- If asked about unknown data, acknowledge limits; do not hallucinate specifics.`;

  const result = streamText({
    model: ANALYST_MODEL,
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: `Subject: ${handle}\n\n${query}`,
      },
    ],
    temperature: 0.4,
  });

  return result.toTextStreamResponse();
}
