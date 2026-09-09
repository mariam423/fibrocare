import { streamText, generateText, generateObject, type StreamTextResult, type GenerateTextResult, type CoreMessage } from "ai";
import { getFailoverOrder, getModel, recordAiFailure, recordAiSuccess, type AiProvider } from "./provider";
import { cn } from "@/lib/utils";

/**
 * Error types that should trigger a failover to the next provider.
 * 429 (Too Many Requests) is the primary trigger.
 * 502/503/504 are also typical transient provider issues.
 */
function isTransientError(error: any): boolean {
  if (error?.status === 429) return true;
  if (error?.status >= 502 && error?.status <= 504) return true;

  // Check for common AI SDK error messages that indicate rate limits
  const msg = error?.message?.toLowerCase() ?? "";
  if (msg.includes("rate limit") || msg.includes("too many requests") || msg.includes("quota exceeded")) {
    return true;
  }

  return false;
}

interface FailoverOptions {
  system?: string;
  messages: CoreMessage[];
  maxOutputTokens?: number;
  timeout?: any;
  maxRetries?: number;
  tools?: any;
  // Allow passing through other streamText/generateText options
  [key: string]: any;
}

/**
 * Executes a streamText call with a 3-tier failover chain.
 * Gemini -> OpenRouter -> GroqCloud.
 */
export async function streamTextWithFailover(options: FailoverOptions) {
  const order = getFailoverOrder();
  let lastError: any = null;

  for (const provider of order) {
    // 1. Check if this provider is configured
    // We use a modified version of getModel that targets a specific provider
    const model = getModelForProvider(provider);
    if (!model) continue;

    try {
      const result = await streamText({
        ...options,
        model,
      });

      // We can't fully "await" the stream here without consuming it,
      // but we can return the result. The actual error might happen during streaming.
      // However, most 429s happen during the initial request.

      // Record success for this provider
      recordAiSuccess(provider);
      return result;
    } catch (error) {
      lastError = error;
      if (isTransientError(error)) {
        console.warn(`[ai-failover] Provider ${provider} rate-limited or transient error. Trying next...`, error);
        recordAiFailure(provider);
        continue; // Try next provider
      }
      // For non-transient errors, we might want to fail fast or still try failover.
      // Given the criticality, we'll try failover for most errors.
      recordAiFailure(provider);
    }
  }

  // If we reach here, all providers failed.
  throw lastError || new Error("All AI providers failed or are unconfigured.");
}

/**
 * Executes a generateText call with a 3-tier failover chain.
 */
export async function generateTextWithFailover(options: FailoverOptions) {
  const order = getFailoverOrder();
  let lastError: any = null;

  for (const provider of order) {
    const model = getModelForProvider(provider);
    if (!model) continue;

    try {
      const result = await generateText({
        ...options,
        model,
      });
      recordAiSuccess(provider);
      return result;
    } catch (error) {
      lastError = error;
      if (isTransientError(error)) {
        console.warn(`[ai-failover] Provider ${provider} rate-limited or transient error. Trying next...`, error);
        recordAiFailure(provider);
        continue;
      }
      recordAiFailure(provider);
    }
  }

  throw lastError || new Error("All AI providers failed or are unconfigured.");
}

/**
 * Internal helper to get a model for a specific provider,
 * bypassing the default 'active provider' logic.
 */
function getModelForProvider(provider: AiProvider): any {
  return getModel(provider);
}

/**
 * Executes a generateObject call with a 3-tier failover chain.
 */
export async function generateObjectWithFailover<T>(options: any & { schema: any }) {
  const order = getFailoverOrder();
  let lastError: any = null;

  for (const provider of order) {
    const model = getModelForProvider(provider);
    if (!model) continue;

    try {
      const result = await generateObject({
        ...options,
        model,
      });
      recordAiSuccess(provider);
      return result;
    } catch (error) {
      lastError = error;
      if (isTransientError(error)) {
        console.warn(`[ai-failover] Provider ${provider} rate-limited or transient error. Trying next...`, error);
        recordAiFailure(provider);
        continue;
      }
      recordAiFailure(provider);
    }
  }

  throw lastError || new Error("All AI providers failed or are unconfigured.");
}
