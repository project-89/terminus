export interface AIModelConfig {
  temperature?: number;
  maxTokens?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  model: string;
}

export interface AIResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIModelService {
  generateText(
    messages: Array<{ role: string; content: string }>,
    config?: Partial<AIModelConfig>
  ): Promise<AIResponse>;
}
