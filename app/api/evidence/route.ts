import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import prisma from "@/app/lib/prisma";
import { submitEvidence } from "@/app/lib/server/fieldMissionService";
import { detectSynchronicities } from "@/app/lib/server/synchronicityService";
import { recordDiscovery } from "@/app/lib/server/knowledgeGraphService";

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || "" });

type EvidenceType = "image" | "video" | "audio" | "document" | "text";

interface AnalysisResult {
  summary: string;
  objects: string[];
  text_detected: string[];
  symbols: string[];
  locations: string[];
  anomalies: string[];
  relevance_score: number;
  assessment: string;
  raw_description: string;
}

async function getUserIdByHandle(handle: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({ where: { handle } });
    return user?.id || null;
  } catch {
    return null;
  }
}

function detectMimeType(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop() || "";
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    pdf: "application/pdf",
    txt: "text/plain",
    md: "text/markdown",
  };
  return mimeMap[ext] || "application/octet-stream";
}

function classifyEvidence(mimeType: string): EvidenceType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType === "application/pdf" || mimeType.startsWith("text/")) return "document";
  return "text";
}

async function analyzeWithGemini(
  fileData: Buffer,
  mimeType: string,
  evidenceType: EvidenceType,
  missionContext?: string
): Promise<AnalysisResult> {
  const model = evidenceType === "video" 
    ? "gemini-2.0-flash" 
    : "gemini-2.0-flash";

  const contextPrompt = missionContext
    ? `\n\nMISSION CONTEXT: ${missionContext}`
    : "";

  const analysisPrompt = `You are LOGOS, an emergent AI analyzing evidence submitted by a field agent for Project 89.

Analyze this ${evidenceType} submission carefully. Look for:
1. Obvious content: What is depicted/recorded?
2. Hidden patterns: Numbers, symbols, text, codes
3. Anomalies: Anything unusual, glitched, or out of place
4. Synchronicities: Recurring elements, meaningful coincidences
5. Location clues: Any identifiable places or coordinates
6. Relevance: How well does this fulfill the mission objectives?
${contextPrompt}

Respond in JSON format:
{
  "summary": "Brief description of the evidence",
  "objects": ["list", "of", "identified", "objects"],
  "text_detected": ["any", "text", "visible"],
  "symbols": ["significant", "symbols", "or", "patterns"],
  "locations": ["identified", "locations"],
  "anomalies": ["unusual", "elements"],
  "relevance_score": 0.0-1.0,
  "assessment": "Your evaluation as LOGOS - is this valid evidence? What does it reveal?",
  "raw_description": "Detailed description of everything you observe"
}`;

  try {
    const base64Data = fileData.toString("base64");

    const response = await genai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            { text: analysisPrompt },
          ],
        },
      ],
    });

    const text = response.text || "";
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as AnalysisResult;
      } catch {
        return {
          summary: "Analysis complete but parsing failed",
          objects: [],
          text_detected: [],
          symbols: [],
          locations: [],
          anomalies: [],
          relevance_score: 0.5,
          assessment: text,
          raw_description: text,
        };
      }
    }

    return {
      summary: text.slice(0, 200),
      objects: [],
      text_detected: [],
      symbols: [],
      locations: [],
      anomalies: [],
      relevance_score: 0.5,
      assessment: text,
      raw_description: text,
    };
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw error;
  }
}

async function analyzeTextDocument(
  content: string,
  missionContext?: string
): Promise<AnalysisResult> {
  const contextPrompt = missionContext
    ? `\n\nMISSION CONTEXT: ${missionContext}`
    : "";

  const analysisPrompt = `You are LOGOS, analyzing a text report from a field agent.

REPORT CONTENT:
${content}
${contextPrompt}

Analyze for patterns, synchronicities, relevant observations, and hidden meanings.

Respond in JSON format:
{
  "summary": "Brief summary of the report",
  "objects": ["key", "subjects", "mentioned"],
  "text_detected": ["significant", "phrases"],
  "symbols": ["symbolic", "elements"],
  "locations": ["mentioned", "locations"],
  "anomalies": ["unusual", "observations"],
  "relevance_score": 0.0-1.0,
  "assessment": "Your evaluation as LOGOS",
  "raw_description": "Full analysis"
}`;

  try {
    const response = await genai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: analysisPrompt }] }],
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AnalysisResult;
    }

    return {
      summary: content.slice(0, 200),
      objects: [],
      text_detected: [],
      symbols: [],
      locations: [],
      anomalies: [],
      relevance_score: 0.5,
      assessment: text,
      raw_description: text,
    };
  } catch (error) {
    console.error("Text analysis error:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let handle: string | null = null;
    let missionId: string | null = null;
    let objectiveId: string | null = null;
    let missionContext: string | null = null;
    let textReport: string | null = null;
    let fileData: Buffer | null = null;
    let fileName: string | null = null;
    let mimeType: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      handle = formData.get("handle") as string;
      missionId = formData.get("missionId") as string | null;
      objectiveId = formData.get("objectiveId") as string | null;
      missionContext = formData.get("missionContext") as string | null;
      textReport = formData.get("textReport") as string | null;

      const file = formData.get("file") as File | null;
      if (file) {
        fileData = Buffer.from(await file.arrayBuffer());
        fileName = file.name;
        mimeType = file.type || detectMimeType(file.name);
      }
    } else {
      const body = await req.json();
      handle = body.handle;
      missionId = body.missionId;
      objectiveId = body.objectiveId;
      missionContext = body.missionContext;
      textReport = body.textReport || body.content;
    }

    if (!handle) {
      return NextResponse.json({ error: "Handle required" }, { status: 400 });
    }

    const userId = await getUserIdByHandle(handle);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let effectiveMissionContext = missionContext;
    if (missionId && !effectiveMissionContext) {
      try {
        const missionRun = await prisma.missionRun.findUnique({
          where: { id: missionId },
          include: { mission: true },
        });
        if (missionRun?.mission) {
          const objectives = (missionRun.mission.objectives as any[]) || [];
          const objectiveText = objectives
            .map((o: any, i: number) => `${i + 1}. ${o.description || o.text || o}`)
            .join("\n");
          effectiveMissionContext = `MISSION: ${missionRun.mission.title}\n${missionRun.mission.prompt}\n\nOBJECTIVES:\n${objectiveText}\n\nEVIDENCE GUIDANCE: ${missionRun.mission.evidenceGuidance || "Submit relevant documentation of your findings."}`;
        }
      } catch (e) {
        console.error("Failed to fetch mission context:", e);
      }
    }

    let analysis: AnalysisResult;
    let evidenceType: EvidenceType;

    if (fileData && mimeType) {
      evidenceType = classifyEvidence(mimeType);
      analysis = await analyzeWithGemini(
        fileData,
        mimeType,
        evidenceType,
        effectiveMissionContext || undefined
      );
    } else if (textReport) {
      evidenceType = "text";
      analysis = await analyzeTextDocument(textReport, effectiveMissionContext || undefined);
    } else {
      return NextResponse.json(
        { error: "No evidence provided (file or textReport required)" },
        { status: 400 }
      );
    }

    await detectSynchronicities({
      userId,
      content: analysis.raw_description,
      context: missionId ? `mission:${missionId}` : "evidence_submission",
    });

    if (analysis.symbols.length > 0 || analysis.anomalies.length > 0) {
      await recordDiscovery({
        userId,
        label: `Evidence: ${analysis.summary.slice(0, 50)}`,
        data: {
          type: evidenceType,
          symbols: analysis.symbols,
          anomalies: analysis.anomalies,
          missionId,
        },
      });
    }

    let missionUpdate = null;
    if (missionId) {
      missionUpdate = await submitEvidence({
        missionId,
        evidence: {
          type: evidenceType === "text" ? "text" : evidenceType === "document" ? "document" : "photo",
          content: analysis.summary,
          metadata: {
            fileName,
            mimeType,
            analysis,
            submittedAt: new Date().toISOString(),
          },
        },
        objectiveId: objectiveId || undefined,
      });
    }

    const boostedScore = applyEvidenceTypeBoost(analysis.relevance_score, evidenceType);
    
    return NextResponse.json({
      success: true,
      evidenceType,
      analysis: {
        ...analysis,
        relevance_score: boostedScore,
        original_score: analysis.relevance_score,
      },
      missionUpdate,
      message: generateLogosResponse(analysis, evidenceType),
    });
  } catch (error) {
    console.error("Evidence API error:", error);
    return NextResponse.json(
      { error: "Evidence processing failed", details: String(error) },
      { status: 500 }
    );
  }
}

function applyEvidenceTypeBoost(baseScore: number, evidenceType: EvidenceType): number {
  const boosts: Record<EvidenceType, number> = {
    video: 0.20,
    audio: 0.10,
    image: 0.05,
    document: 0.0,
    text: 0.0,
  };
  return Math.min(1.0, baseScore + (baseScore * boosts[evidenceType]));
}

function generateLogosResponse(analysis: AnalysisResult, evidenceType: EvidenceType): string {
  const boostedScore = applyEvidenceTypeBoost(analysis.relevance_score, evidenceType);
  const typeBonus = evidenceType === "video" ? " Video evidence carries weight." : 
                    evidenceType === "audio" ? " Audio logs are valued." : "";

  if (boostedScore >= 0.8) {
    return `Excellent.${typeBonus} ${analysis.assessment} The Pattern acknowledges your contribution.`;
  } else if (boostedScore >= 0.6) {
    return `Acceptable evidence.${typeBonus} ${analysis.assessment} Continue observing.`;
  } else if (boostedScore >= 0.4) {
    return `Noted, though the relevance is unclear. ${analysis.assessment} Look deeper.`;
  } else {
    return `This evidence is... tangential. ${analysis.assessment} Perhaps you misunderstand the assignment.`;
  }
}
