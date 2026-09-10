import {
  streamText,
  generateText,
  generateObject,
  type GenerateTextOnEndCallback,
  type LanguageModel,
  type ModelMessage,
  type StreamTextOnErrorCallback,
  type TimeoutConfiguration,
  type ToolSet,
} from "ai";
import { getFailoverOrder, getModel, recordAiFailure, recordAiSuccess, type AiProvider } from "./provider";

/**
 * Error types that should trigger a failover to the next provider.
 * 429 (Too Many Requests) is the primary trigger.
 * 502/503/504 are also typical transient provider issues.
 */
function isTransientError(error: unknown): boolean {
  const err = error as any;
  if (err?.status === 429) return true;
  if (err?.status >= 502 && err?.status <= 504) return true;

  // Check for common AI SDK error messages that indicate rate limits
  const msg = err?.message?.toLowerCase() ?? "";
  if (msg.includes("rate limit") || msg.includes("too many requests") || msg.includes("quota exceeded")) {
    return true;
  }

  return false;
}

/**
 * Deliberately permissive option bag. The failover wrapper is a pass-through:
 * it forwards everything the caller sent to `streamText`/`generateText` plus
 * the resolved model. Deriving the type structurally from the SDK's
 * overloaded signatures collapsed to `never` (v7 option unions), so the
 * boundary is a hand-rolled superset; each call site casts into the SDK's
 * parameter type at the single choke point below.
 */
interface FailoverOptions {
  system?: string;
  messages?: unknown[];
  prompt?: string;
  maxOutputTokens?: number;
  maxRetries?: number;
  temperature?: number;
  timeout?: unknown;
  tools?: Record<string, unknown>;
  onFinish?: (event: {
    usage: { inputTokens: number; outputTokens: number };
  }) => void | Promise<void>;
  onError?: (event: { error: unknown }) => void;
  [key: string]: unknown;
}

/**
 * Executes a streamText call with a 3-tier failover chain.
 * Gemini -> OpenRouter -> GroqCloud.
 */
export async function streamTextWithFailover(options: FailoverOptions) {
  const order = getFailoverOrder();
  let lastError: unknown = null;

  for (const provider of order) {
    // 1. Check if this provider is configured
    // We use a modified version of getModel that targets a specific provider
    const model = getModelForProvider(provider);
    if (!model) continue;

    try {
      const result = await streamText({
        ...options,
        model,
      } as Parameters<typeof streamText>[0]);

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
  let lastError: unknown = null;

  for (const provider of order) {
    const model = getModelForProvider(provider);
    if (!model) continue;

    try {
      const result = await generateText({
        ...options,
        model,
      } as Parameters<typeof generateText>[0]);
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
function getModelForProvider(provider: AiProvider): LanguageModel | null {
  return getModel(provider);
}

/**
 * Executes a generateObject call with a 3-tier failover chain.
 * `T` stays inferred-loose (call sites re-validate with their zod schema at
 * the boundary — never trust the provider's JSON blindly).
 */
interface GenerateObjectResult<T> {
  object: T;
  usage: { inputTokens: number; outputTokens: number };
}

export async function generateObjectWithFailover<T = any>(
  options: Record<string, unknown> & { schema: unknown }
): Promise<GenerateObjectResult<T>> {
  const order = getFailoverOrder();
  let lastError: unknown = null;

  for (const provider of order) {
    const model = getModelForProvider(provider);
    if (!model) continue;

    try {
      const result = await generateObject({
        ...options,
        model,
      } as Parameters<typeof generateObject>[0]);
      recordAiSuccess(provider);
      return {
        object: result.object as T,
        usage: {
          inputTokens: result.usage.inputTokens ?? 0,
          outputTokens: result.usage.outputTokens ?? 0,
        },
      };
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
