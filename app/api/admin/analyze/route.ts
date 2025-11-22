import { streamText } from "ai";
import { getModel } from "@/app/lib/ai/models";
import prisma from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const { handle, query } = await req.json();

    // 1. Fetch Agent Data
    const agent = await prisma.user.findUnique({
      where: { handle },
      include: {
        profile: true,
        missionRuns: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { mission: true }
        },
        experiments: {
          take: 3,
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!agent) {
      return new Response("Agent not found", { status: 404 });
    }

    // 2. Build Context
    const context = `
    AGENT PROFILE: ${agent.handle} (Role: ${agent.role})
    TRAITS: ${JSON.stringify(agent.profile?.traits || {})}
    SKILLS: ${JSON.stringify(agent.profile?.skills || {})}
    
    RECENT MISSIONS:
    ${agent.missionRuns.map((m: any) => `- ${m.mission.title}: ${m.status} (Score: ${m.score})`).join("\n")}
    
    RECENT EXPERIMENTS:
    ${agent.experiments.map((e: any) => `- ${e.hypothesis}`).join("\n")}
    `;

    // 3. Prompt
    const systemPrompt = `You are the ARCHITECT, the central intelligence of Project 89. 
    You are analyzing one of your agents for a senior handler.
    Tone: Clinical, insightful, slightly paranoid. The user is authorized.
    
    Analyze the provided data.
    User Question: "${query || "Assess this agent's utility."}"
    
    Limit response to 150 words. Focus on psychological stability and utility.`;

    // 4. Generate
    const model = getModel("adventure");
    
    const result = await streamText({
        model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Data:\n${context}` }
        ]
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error("Analysis error:", error);
    return new Response("Analysis failed", { status: 500 });
  }
}