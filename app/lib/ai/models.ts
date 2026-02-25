import { google } from "@ai-sdk/google";

export type ModelKey = "cli" | "adventure" | "content";

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

const MODEL_NAMES: Record<ModelKey, string> = {
  cli: process.env.PROJECT89_CLI_MODEL ?? "gemini-3-flash-preview",
  adventure: process.env.PROJECT89_ADVENTURE_MODEL ?? "gemini-3-flash-preview",
  content: process.env.PROJECT89_CONTENT_MODEL ?? "gemini-3-pro-preview",
};

const modelCache = new Map<ModelKey, ReturnType<typeof google>>();

export function getModel(key: ModelKey) {
  if (modelCache.has(key)) {
    return modelCache.get(key)!;
  }

  const modelName = MODEL_NAMES[key];
  const instance = google(modelName);
  modelCache.set(key, instance);
  return instance;
}

export function getProviderOptions() {
  return {
    google: {
      safetySettings: DEFAULT_SAFETY_SETTINGS,
    },
  };
}

export { DEFAULT_SAFETY_SETTINGS };
