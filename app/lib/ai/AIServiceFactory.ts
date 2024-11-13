import { AIModelService } from "./models/types";
import { GoogleAIService } from "./models/googleAI";

export type AIProvider = "google" | "claude" | "anthropic";

export class AIServiceFactory {
  private static instance: AIServiceFactory;
  private services: Map<AIProvider, AIModelService> = new Map();

  private constructor() {}

  static getInstance(): AIServiceFactory {
    if (!AIServiceFactory.instance) {
      AIServiceFactory.instance = new AIServiceFactory();
    }
    return AIServiceFactory.instance;
  }

  getService(provider: AIProvider): AIModelService {
    if (!this.services.has(provider)) {
      switch (provider) {
        case "google":
          this.services.set(
            provider,
            new GoogleAIService(process.env.GOOGLE_AI_API_KEY!)
          );
          break;
        // Add other providers here
        default:
          throw new Error(`Unsupported AI provider: ${provider}`);
      }
    }
    return this.services.get(provider)!;
  }
}
