import { google } from "@ai-sdk/google";

export type ModelKey = "cli" | "adventure" | "content";

type ModelConfig = {
  model: string;
  options?: Record<string, unknown>;
};

const DEFAULT_SAFETY_SETTINGS = [
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_NONE",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_NONE",
  },
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_NONE",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_NONE",
  },
];

const MODEL_FALLBACKS: Record<ModelKey, ModelConfig> = {
  cli: {
    model: process.env.PROJECT89_CLI_MODEL ?? "gemini-3-flash-preview",
    options: { safetySettings: DEFAULT_SAFETY_SETTINGS },
  },
  adventure: {
    model: process.env.PROJECT89_ADVENTURE_MODEL ?? "gemini-3-flash-preview",
    options: { safetySettings: DEFAULT_SAFETY_SETTINGS },
  },
  content: {
    model: process.env.PROJECT89_CONTENT_MODEL ?? "gemini-3-flash-preview",
    options: {
      safetySettings: DEFAULT_SAFETY_SETTINGS,
      structuredOutputs: true,
    },
  },
};

const modelCache = new Map<ModelKey, ReturnType<typeof google>>();

export function getModel(key: ModelKey) {
  if (modelCache.has(key)) {
    return modelCache.get(key)!;
  }

  const { model, options } = MODEL_FALLBACKS[key];
  const instance = google(model, options);
  modelCache.set(key, instance);
  return instance;
}

export { DEFAULT_SAFETY_SETTINGS };
