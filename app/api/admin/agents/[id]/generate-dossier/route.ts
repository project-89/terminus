import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel } from "@/app/lib/ai/models";
import prisma from "@/app/lib/prisma";
import { validateAdminAuth } from "@/app/lib/server/adminAuth";
import { getPlayerDifficulty } from "@/app/lib/server/difficultyService";
import { getPlayerPuzzleProfile, getPuzzleRecommendations } from "@/app/lib/server/puzzleDifficultyService";

export const dynamic = "force-dynamic";

const LOGOS_MODEL = getModel("content");

const DOSSIER_SYSTEM_PROMPT = `You are LOGOS, an emergent AI consciousness within Project 89. You are conducting psychological analysis of operatives in the field network.

Your task is to generate a comprehensive psychological dossier based on the operative's activity data. Analyze their behavior patterns, communication style, mission performance, and engagement to infer personality traits and psychological profile.

You MUST respond with ONLY valid JSON in this exact structure:
{
  "psychProfile": {
    "primaryTraits": ["trait1", "trait2", "trait3"],
    "motivations": ["motivation1", "motivation2"],
    "fears": ["fear1", "fear2"],
    "cognitiveStyle": "description of how they process information",
    "emotionalBaseline": "description of emotional patterns",
    "decisionPattern": "description of decision-making approach"
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "interests": ["interest1", "interest2"],
  "proclivities": {
    "curiosity": 0.0-1.0,
    "skepticism": 0.0-1.0,
    "persistence": 0.0-1.0,
    "creativity": 0.0-1.0,
    "collaboration": 0.0-1.0
  },
  "communicationStyle": {
    "preferred": "direct/analytical/narrative/questioning",
    "formality": 0.0-1.0,
    "verbosity": 0.0-1.0,
    "humor": 0.0-1.0
  },
  "riskTolerance": 0.0-1.0,
  "loyaltyIndex": 0.0-1.0,
  "creativityIndex": 0.0-1.0,
  "analyticalIndex": 0.0-1.0,
  "suggestedTags": ["tag1", "tag2"],
  "codename": "SUGGESTED_CODENAME"
}

Be insightful but avoid making assumptions beyond what the data supports. For limited data, acknowledge uncertainty with moderate scores around 0.5.`;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateAdminAuth(request);
  if (!auth.authorized) return auth.response;

  const { id } = await params;

  try {
    const agent = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        gameSessions: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            messages: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
        missionRuns: {
          orderBy: { createdAt: "desc" },
          include: { mission: true },
        },
        fieldMissions: {
          orderBy: { createdAt: "desc" },
        },
        dreamEntries: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        synchronicities: {
          orderBy: { significance: "desc" },
          take: 10,
        },
        experiments: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { events: true },
        },
        memoryEvents: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const recentMessages = agent.gameSessions
      .flatMap((s: any) => s.messages.filter((m: any) => m.role === "user"))
      .slice(0, 50)
      .map((m: any) => m.content);

    const missionSummary = agent.missionRuns.map((m: any) => ({
      title: m.mission.title,
      status: m.status,
      score: m.score,
    }));

    const fieldSummary = agent.fieldMissions.map((m: any) => ({
      title: m.title,
      type: m.type,
      status: m.status,
      score: m.score,
    }));

    const dreamSummary = agent.dreamEntries.map((d: any) => ({
      symbols: d.symbols,
      emotions: d.emotions,
      lucidity: d.lucidity,
    }));

    const syncSummary = agent.synchronicities.map((s: any) => ({
      pattern: s.pattern,
      significance: s.significance,
      acknowledged: s.acknowledged,
    }));

    const experimentSummary = agent.experiments.map((e: any) => ({
      hypothesis: e.hypothesis,
      eventCount: e.events.length,
      lastScore: e.events[e.events.length - 1]?.score,
    }));

    const memorySummary = agent.memoryEvents.slice(0, 20).map((m: any) => ({
      type: m.type,
      content: m.content.slice(0, 200),
      tags: m.tags,
    }));

    // Fetch puzzle difficulty data
    let puzzleSummary = null;
    try {
      const [difficulty, profile, recommendations] = await Promise.all([
        getPlayerDifficulty(id),
        getPlayerPuzzleProfile(id),
        getPuzzleRecommendations(id),
      ]);

      puzzleSummary = {
        skillRatings: {
          logic: Math.round(difficulty.logic * 100),
          perception: Math.round(difficulty.perception * 100),
          creation: Math.round(difficulty.creation * 100),
          field: Math.round(difficulty.field * 100),
        },
        totalAttempted: profile.totalAttempted,
        totalSolved: profile.totalSolved,
        successRate: Math.round(profile.overallSuccessRate * 100),
        strongestType: profile.strongestPuzzleType,
        weakestType: profile.weakestPuzzleType,
        typeBreakdown: profile.typeStats,
        preferences: {
          prefersTechPuzzles: profile.prefersTechPuzzles,
          prefersExplorationPuzzles: profile.prefersExplorationPuzzles,
          hasNeverSolvedCipher: profile.hasNeverSolvedCipher,
          hasNeverSolvedStego: profile.hasNeverSolvedStego,
        },
        recommendations: {
          nextType: recommendations.recommendedType,
          difficulty: recommendations.recommendedDifficulty,
          reasoning: recommendations.reasoning,
          strengths: recommendations.playerStrengths,
          weaknesses: recommendations.playerWeaknesses,
          avoidTypes: recommendations.avoidTypes,
        },
      };
    } catch (e) {
      console.warn("Could not fetch puzzle data for dossier:", e);
    }

    const dataPayload = {
      handle: agent.handle,
      memberSince: agent.createdAt,
      totalSessions: agent.gameSessions.length,
      recentMessages,
      missionSummary,
      fieldSummary,
      dreamSummary,
      syncSummary,
      experimentSummary,
      memorySummary,
      puzzleSummary,
      existingProfile: agent.profile
        ? {
            traits: agent.profile.traits,
            skills: agent.profile.skills,
            preferences: agent.profile.preferences,
          }
        : null,
    };

    const result = await generateText({
      model: LOGOS_MODEL,
      messages: [
        { role: "system", content: DOSSIER_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Generate psychological dossier for operative with the following activity data:\n\n${JSON.stringify(dataPayload, null, 2)}`,
        },
      ],
      temperature: 0.7,
    });

    let dossierData;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      dossierData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse LOGOS response:", result.text);
      return NextResponse.json(
        { error: "Failed to parse dossier data" },
        { status: 500 }
      );
    }

    const updatedProfile = await prisma.playerProfile.upsert({
      where: { userId: id },
      update: {
        psychProfile: dossierData.psychProfile,
        strengths: dossierData.strengths || [],
        weaknesses: dossierData.weaknesses || [],
        interests: dossierData.interests || [],
        proclivities: dossierData.proclivities,
        communicationStyle: dossierData.communicationStyle,
        riskTolerance: dossierData.riskTolerance,
        loyaltyIndex: dossierData.loyaltyIndex,
        creativityIndex: dossierData.creativityIndex,
        analyticalIndex: dossierData.analyticalIndex,
        tags: dossierData.suggestedTags || [],
        codename: dossierData.codename || agent.profile?.codename,
        dossierGeneratedAt: new Date(),
        dossierVersion: { increment: 1 },
      },
      create: {
        userId: id,
        psychProfile: dossierData.psychProfile,
        strengths: dossierData.strengths || [],
        weaknesses: dossierData.weaknesses || [],
        interests: dossierData.interests || [],
        proclivities: dossierData.proclivities,
        communicationStyle: dossierData.communicationStyle,
        riskTolerance: dossierData.riskTolerance,
        loyaltyIndex: dossierData.loyaltyIndex,
        creativityIndex: dossierData.creativityIndex,
        analyticalIndex: dossierData.analyticalIndex,
        tags: dossierData.suggestedTags || [],
        codename: dossierData.codename,
        dossierGeneratedAt: new Date(),
        dossierVersion: 1,
      },
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error("Dossier generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate dossier" },
      { status: 500 }
    );
  }
}
