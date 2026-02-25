import { GoogleGenAI } from "@google/genai";

export type ImageQuality = "fast" | "high" | "ultra";
export type AspectRatio =
  | "1:1"
  | "2:3"
  | "3:2"
  | "3:4"
  | "4:3"
  | "4:5"
  | "5:4"
  | "9:16"
  | "16:9"
  | "21:9";
export type ImageResolution = "1K" | "2K" | "4K";

export type ReferenceImageInput = {
  mimeType: string;
  data: string;
  label?: string;
};

export type ImageGenerationInput = {
  prompt: string;
  style?: string;
  quality?: ImageQuality;
  aspectRatio?: AspectRatio;
  resolution?: ImageResolution;
  modelOverride?: string;
  referenceImages?: ReferenceImageInput[];
};

export type ImageGenerationOutput = {
  buffer: Buffer;
  mimeType: string;
  model: string;
  resolution?: ImageResolution;
  text?: string;
  referencesUsed: number;
};

const MODEL_CONFIG: Record<ImageQuality, { model: string; resolution?: ImageResolution }> = {
  fast: { model: "gemini-3-pro-image-preview", resolution: "1K" },
  high: { model: "gemini-3-pro-image-preview", resolution: "2K" },
  ultra: { model: "gemini-3-pro-image-preview", resolution: "4K" },
};

const MAX_REFERENCES_PRO = 14;
const MAX_REFERENCES_DEFAULT = 3;

function stripDataUrlPrefix(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.startsWith("data:")) return trimmed;
  const commaIdx = trimmed.indexOf(",");
  if (commaIdx === -1) return "";
  return trimmed.slice(commaIdx + 1);
}

function normalizeReferenceImages(
  model: string,
  refs: ReferenceImageInput[] | undefined
): ReferenceImageInput[] {
  const source = Array.isArray(refs) ? refs : [];
  const max = model.includes("gemini-3-pro-image-preview")
    ? MAX_REFERENCES_PRO
    : MAX_REFERENCES_DEFAULT;

  return source
    .filter((ref) => ref && typeof ref.mimeType === "string" && typeof ref.data === "string")
    .map((ref) => ({
      mimeType: ref.mimeType,
      data: stripDataUrlPrefix(ref.data),
      label: ref.label,
    }))
    .filter((ref) => ref.data.length > 0)
    .slice(-max);
}

export async function generateImageAsset(input: ImageGenerationInput): Promise<ImageGenerationOutput> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not configured");
  }

  const prompt = input.prompt?.trim();
  if (!prompt) {
    throw new Error("Prompt is required");
  }

  const quality = input.quality || "high";
  const config = MODEL_CONFIG[quality] || MODEL_CONFIG.fast;
  const model = input.modelOverride || config.model;
  const finalResolution = input.resolution || config.resolution;
  const aspectRatio = input.aspectRatio || "1:1";
  const fullPrompt = input.style ? `${input.style}. ${prompt}` : prompt;
  const referenceImages = normalizeReferenceImages(model, input.referenceImages);

  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

  const contents: any[] = [{ text: fullPrompt }];
  for (const ref of referenceImages) {
    contents.push({
      inlineData: {
        mimeType: ref.mimeType,
        data: ref.data,
      },
    });
  }

  const generationConfig: any = {
    responseModalities: ["IMAGE", "TEXT"],
    imageConfig: {
      aspectRatio,
    },
  };

  if (finalResolution && model.includes("gemini-3")) {
    generationConfig.imageConfig.imageSize = finalResolution;
  }

  const response = await ai.models.generateContent({
    model,
    contents,
    config: generationConfig,
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  let imageData: string | null = null;
  let mimeType = "image/png";
  let firstText: string | undefined;

  for (const part of parts) {
    if (typeof part.text === "string" && !firstText && !(part as any).thought) {
      firstText = part.text;
    }
    if (part.inlineData?.data && !(part as any).thought) {
      imageData = part.inlineData.data;
      mimeType = part.inlineData.mimeType || "image/png";
    }
  }

  if (!imageData) {
    for (const part of parts) {
      if (part.inlineData?.data) {
        imageData = part.inlineData.data;
        mimeType = part.inlineData.mimeType || "image/png";
      }
    }
  }

  if (!imageData) {
    throw new Error("No image generated");
  }

  return {
    buffer: Buffer.from(imageData, "base64"),
    mimeType,
    model,
    resolution: finalResolution,
    text: firstText,
    referencesUsed: referenceImages.length,
  };
}
