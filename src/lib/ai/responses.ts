import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

export function createResponsesCall(
  request: Request,
  config: { apiKey: string; model: string },
  messages: ModelMessage[],
  instructions?: string,
) {
  const provider = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: config.apiKey,
  });
  const result = streamText({
    model: provider.responses(config.model),
    ...(instructions ? { instructions } : {}),
    maxRetries: 0,
    messages,
    abortSignal: request.signal,
  });
  return {
    result,
    response: () => result.toUIMessageStreamResponse({ sendReasoning: true }),
  };
}
