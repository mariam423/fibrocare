/**
 * Provider-agnostic AI model factory.
 *
 * App code talks to a `LanguageModel` from the Vercel AI SDK; the provider is
 * chosen by environment, never by rewriting call sites. All three providers
 * are optional — the app keeps working (graceful offline mode) when no key
 * is configured, using the deterministic insight engines as a fallback.
 *
 * Env:
 *   AI_PROVIDER    = "google" | "openai" | "anthropic" | "openrouter"  (optional; auto-detected)
 *   AI_MODEL       = optional model-id override
 *   GEMINI_API_KEY / OPENAI_API_KEY / ANTHROPIC_API_KEY / OPENROUTER_API_KEY
 *   AI_MOCK_MODE   = "true" forces simulated AI replies (no key needed);
 *                    "false" disables them. Unset defaults to ON in local dev
 *                    when no key is configured, so `npm run dev` always has an
 *                    interactive companion.
 */

import { createGoogle } from "@ai-sdk/google";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";

export type AiProvider = "google" | "openai" | "anthropic" | "openrouter";

/**
 * How the AI runtime is behaving right now:
 *   live    — a real provider key is configured (LLM calls work)
 *   mock    — no key, but simulated responses are enabled (local testing)
 *   offline — no key and simulation disabled (graceful offline mode)
 */
export type AiRuntimeMode = "live" | "mock" | "offline";

/** Default small/fast model per provider — ideal for a wellness companion. */
const PROVIDER_MODELS: Record<AiProvider, string> = {
  // gemini-2.5-flash was retired for new API users upstream (404
  // "no longer available to new users"); gemini-3.6-flash is the
  // successor the API recommends.
  google: "gemini-3.6-flash",
  openai: "gpt-4o-mini",
  anthropic: "claude-haiku-4-5",
  // OpenRouter slugs are vendor-prefixed. The task's preferred engines
  // (anthropic/claude-3.5-sonnet → retired upstream; google/gemini-flash-1.5
  // → retired) are gone, and paid Sonnet endpoints 402 on a fresh key. Free
  // tiers are shared pools — gemma/glm were rate-limited (429) in testing,
  // so the default is the free model that verified 200 live. Override with
  // AI_MODEL=anthropic/claude-sonnet-4.5 once credits exist.
  openrouter: "nvidia/nemotron-3-super-120b-a12b:free",
};

/** App identity sent with every OpenRouter request (their header contract). */
function appOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "http://localhost:3000"
  );
}

/**
 * Reads keys lazily so every call reflects the current process.env. This is
 * important in dev, where Next.js hot-reloads modules and .env files may be
 * edited without a full restart. Next.js loads `.env` / `.env.local` at
 * startup, so a freshly added key needs the dev server restarted to appear.
 */
function getProviderKeys(): Record<AiProvider, string | undefined> {
  return {
    google: process.env.GEMINI_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
  };
}

/** Whether any LLM provider key is present. When false, AI features degrade. */
export function isAiConfigured(): boolean {
  return Object.values(getProviderKeys()).some(Boolean);
}

/**
 * Whether simulated "mock" AI responses are active. Explicit env always
 * wins; otherwise defaults to ON in local dev when no real key is present
 * (never in production, so a deployed app without keys stays honestly
 * offline instead of faking AI responses).
 */
export function isMockMode(): boolean {
  const explicit = (process.env.AI_MOCK_MODE ?? "").trim().toLowerCase();
  if (explicit === "true" || explicit === "1") return true;
  if (explicit === "false" || explicit === "0") return false;
  return !isAiConfigured() && process.env.NODE_ENV !== "production";
}

/** Resolves the current runtime mode without exposing keys. */
export function getAiRuntime(): {
  mode: AiRuntimeMode;
  provider: AiProvider | null;
} {
  const provider = getActiveProvider();
  if (provider) return { mode: "live", provider };
  if (isMockMode()) return { mode: "mock", provider: null };
  return { mode: "offline", provider: null };
}

/** The provider that is both requested (or first available) and has a key. */
export function getActiveProvider(): AiProvider | null {
  const keys = getProviderKeys();
  const requested = (process.env.AI_PROVIDER ?? "").toLowerCase() as AiProvider;
  if (requested && keys[requested]) return requested;
  const found = (Object.keys(keys) as AiProvider[]).find((p) => keys[p]);
  return found ?? null;
}

export function getProviderDisplayName(): string {
  const provider = getActiveProvider();
  if (!provider) return "Offline";
  return provider === "google"
    ? "Gemini"
    : provider === "openai"
      ? "OpenAI"
      : provider === "anthropic"
        ? "Claude"
        : "OpenRouter";
}

/** Returns the configured model or null when no provider key exists. */
export function getModel(): LanguageModel | null {
  const provider = getActiveProvider();
  if (!provider) return null;
  const modelId = process.env.AI_MODEL || PROVIDER_MODELS[provider];
  switch (provider) {
    case "google":
      // Pass the key explicitly. The app's documented contract (env docs,
      // offline/mock hints) is GEMINI_API_KEY, but the SDK's implicit env
      // fallback is GOOGLE_GENERATIVE_AI_API_KEY — relying on that fallback
      // made the app report "configured" while every live call failed with
      // a missing-key error.
      return createGoogle({ apiKey: process.env.GEMINI_API_KEY })(modelId);
    case "openai":
      return openai(modelId);
    case "anthropic":
      return anthropic(modelId);
    case "openrouter":
      // OpenRouter speaks the OpenAI chat-completions dialect and asks
      // callers to identify their app via HTTP-Referer / X-Title.
      return createOpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
        headers: {
          "HTTP-Referer": appOrigin(),
          "X-Title": "FibroCare",
        },
      })(modelId);
  }
}

/**
 * Returns the configured model, but consults the circuit breaker first.
 * When the breaker for this provider is open, returns `null` so the
 * caller falls through to the existing offline/mock branch instead of
 * cascading 502s.
 *
 * Use this in route handlers that previously called `getModel()`. The
 * underlying model is the same; only the short-circuit behavior changes.
 */
export function getModelSafe(): LanguageModel | null {
  const provider = getActiveProvider();
  if (!provider) return null;
  // Dynamic require keeps the optional dependency out of the build for
  // callers that don't need the breaker.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getBreakerState } = require("@/lib/observability/circuitBreaker") as typeof import("@/lib/observability/circuitBreaker");
  if (getBreakerState(`ai:${provider}`) === "open") return null;
  return getModel();
}

/** Record a successful AI call — closes the breaker for the active provider. */
export function recordAiSuccess(): void {
  const provider = getActiveProvider();
  if (!provider) return;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { recordBreakerSuccess } = require("@/lib/observability/circuitBreaker") as typeof import("@/lib/observability/circuitBreaker");
  recordBreakerSuccess(`ai:${provider}`);
}

/** Record a failed AI call — opens the breaker after the threshold. */
export function recordAiFailure(): void {
  const provider = getActiveProvider();
  if (!provider) return;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { recordBreakerFailure } = require("@/lib/observability/circuitBreaker") as typeof import("@/lib/observability/circuitBreaker");
  recordBreakerFailure(`ai:${provider}`);
}
