import { NextResponse } from "next/server";
import {
  generateImageAsset,
  type AspectRatio,
  type ImageQuality,
  type ImageResolution,
  type ReferenceImageInput,
} from "@/app/lib/server/imageGenerationService";

type Resolution = ImageResolution;

export async function POST(req: Request) {
  try {
    const {
      prompt,
      aspectRatio = "1:1",
      style,
      quality = "high",
      resolution,
      referenceImages,
      model,
    }: {
      prompt: string;
      aspectRatio?: AspectRatio;
      style?: string;
      quality?: ImageQuality;
      resolution?: Resolution;
      referenceImages?: ReferenceImageInput[];
      model?: string;
    } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const result = await generateImageAsset({
      prompt,
      style,
      quality,
      aspectRatio,
      resolution,
      referenceImages,
      modelOverride: model,
    });
    
    const body = new Uint8Array(result.buffer);
    return new NextResponse(body, {
      headers: {
        "Content-Type": result.mimeType,
        "Cache-Control": "public, max-age=3600",
        "X-Image-Model": result.model,
        "X-Image-Resolution": result.resolution || "default",
        "X-Image-References-Used": String(result.referencesUsed || 0),
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
