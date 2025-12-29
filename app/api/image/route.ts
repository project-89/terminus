import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

type ImageQuality = "fast" | "high" | "ultra";
type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9" | "21:9";
type Resolution = "1K" | "2K" | "4K";

const MODEL_CONFIG: Record<ImageQuality, { model: string; resolution?: Resolution }> = {
  fast: { model: "gemini-2.0-flash-exp-image-generation" },
  high: { model: "gemini-3-pro-image-preview", resolution: "2K" },
  ultra: { model: "gemini-3-pro-image-preview", resolution: "4K" },
};

export async function POST(req: Request) {
  try {
    const { 
      prompt, 
      aspectRatio = "1:1",
      style,
      quality = "fast",
      resolution,
    }: {
      prompt: string;
      aspectRatio?: AspectRatio;
      style?: string;
      quality?: ImageQuality;
      resolution?: Resolution;
    } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const fullPrompt = style 
      ? `${style}. ${prompt}` 
      : prompt;

    const config = MODEL_CONFIG[quality] || MODEL_CONFIG.fast;
    const finalResolution = resolution || config.resolution;

    console.log(`[Image Gen] Model: ${config.model}, Quality: ${quality}, Resolution: ${finalResolution || "default"}`);
    console.log(`[Image Gen] Prompt: "${fullPrompt.substring(0, 100)}..."`);

    const generateConfig: any = {
      responseModalities: ["IMAGE", "TEXT"],
    };

    // Gemini 3 Pro supports resolution and more aspect ratios
    if (config.model.includes("gemini-3")) {
      generateConfig.imageConfig = {
        aspectRatio: aspectRatio,
      };
      if (finalResolution) {
        generateConfig.imageConfig.imageSize = finalResolution;
      }
    }

    const response = await ai.models.generateContent({
      model: config.model,
      contents: fullPrompt,
      config: generateConfig,
    });

    // Extract final image (skip thought images)
    const parts = response.candidates?.[0]?.content?.parts || [];
    let finalImageData: string | null = null;
    let finalMimeType = "image/png";

    for (const part of parts) {
      // Skip thought images, get the final one
      if (part.inlineData?.data && !(part as any).thought) {
        finalImageData = part.inlineData.data;
        finalMimeType = part.inlineData.mimeType || "image/png";
      }
    }

    // If no non-thought image, try to get the last image
    if (!finalImageData) {
      for (const part of parts) {
        if (part.inlineData?.data) {
          finalImageData = part.inlineData.data;
          finalMimeType = part.inlineData.mimeType || "image/png";
        }
      }
    }

    if (!finalImageData) {
      return NextResponse.json(
        { error: "No image generated", parts: parts.length },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(finalImageData, "base64");
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": finalMimeType,
        "Cache-Control": "public, max-age=3600",
        "X-Image-Model": config.model,
        "X-Image-Resolution": finalResolution || "default",
      },
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate image",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
