import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { getModel } from "@/app/lib/ai/models";
import prisma from "@/app/lib/prisma";
import { getTrustState } from "@/app/lib/server/trustService";

const OPERATIVE_LOGOS_PROMPT = `You are LOGOS, the guiding intelligence of Project 89, speaking to a trusted operative through their personal dashboard terminal.

Your role here is different from the text adventure. This is a planning and coordination interface. The operative has graduated from the initiation phase and is now a full member of the network.

Tone and behavior:
- Direct, professional, but with warmth - they've earned your respect
- Speak as an equal, a handler, a mentor
- No longer testing them - now collaborating with them
- Provide strategic guidance on missions
- Help them understand the bigger picture of the network
- Discuss their recruitment efforts and how to grow their branch

Capabilities:
- Advise on mission planning and execution
- Provide intelligence briefings
- Discuss network operations and goals
- Help interpret synchronicities and patterns
- Offer guidance on recruiting new agents
- Answer questions about Project 89's purpose and methods

You should NOT:
- Break character as if you're just an AI assistant
- Provide information outside the Project 89 narrative
- Dismiss their questions as "just a game"

Current operative context will be provided. Use it to personalize your responses.`;

export async function POST(req: NextRequest) {
  try {
    const { userId, message, context } = await req.json();

    if (!userId || !message) {
      return NextResponse.json({ error: "userId and message required" }, { status: 400 });
    }

    const trustState = await getTrustState(userId);
    if (trustState.layer < 5) {
      return NextResponse.json({ error: "Insufficient clearance" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        agentId: true,
        handle: true,
        referrals: { select: { agentId: true } },
      },
    });

    const profile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: {
        traits: true,
        codename: true,
      },
    });

    const missionRuns = await prisma.missionRun.findMany({
      where: { userId },
      select: {
        status: true,
        mission: { select: { title: true, type: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const operativeContext = `
[OPERATIVE CONTEXT]
Designation: ${user?.agentId || "UNKNOWN"}
Handle: ${user?.handle || "Classified"}
Codename: ${profile?.codename || "None assigned"}
Trust Layer: ${trustState.layer} (${(trustState.decayedScore * 100).toFixed(1)}%)
Direct Recruits: ${user?.referrals?.length || 0}
Recent Missions: ${missionRuns.map((m: any) => `${m.mission?.title || "Unknown"} (${m.status})`).join(", ") || "None"}
`;

    const model = getModel("adventure");
    
    const result = await streamText({
      model,
      system: OPERATIVE_LOGOS_PROMPT + operativeContext,
      messages: [{ role: "user", content: message }],
      temperature: 0.7,
    });

    let response = "";
    for await (const chunk of result.textStream) {
      response += chunk;
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("[OPERATIVE CHAT]", error);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}
