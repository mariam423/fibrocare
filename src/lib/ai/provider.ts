/**
 * Provider-agnostic AI model factory.
 *
 * App code talks to a `LanguageModel` from the Vercel AI SDK; the provider is
 * chosen by environment, never by rewriting call sites. All three providers
 * are optional — the app keeps working (graceful offline mode) when no key
 * is configured, using the deterministic insight engines as a fallback.
 *
 * Env:
 *   AI_PROVIDER    = "google" | "openai" | "anthropic"  (optional; auto-detected)
 *   AI_MODEL       = optional model-id override
 *   GEMINI_API_KEY / OPENAI_API_KEY / ANTHROPIC_API_KEY
 *   AI_MOCK_MODE   = "true" forces simulated AI replies (no key needed);
 *                    "false" disables them. Unset defaults to ON in local dev
 *                    when no key is configured, so `npm run dev` always has an
 *                    interactive companion.
 */

import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";

export type AiProvider = "google" | "openai" | "anthropic";

/**
 * How the AI runtime is behaving right now:
 *   live    — a real provider key is configured (LLM calls work)
 *   mock    — no key, but simulated responses are enabled (local testing)
 *   offline — no key and simulation disabled (graceful offline mode)
 */
export type AiRuntimeMode = "live" | "mock" | "offline";

/** Default small/fast model per provider — ideal for a wellness companion. */
const PROVIDER_MODELS: Record<AiProvider, string> = {
  google: "gemini-2.5-flash",
  openai: "gpt-4o-mini",
  anthropic: "claude-haiku-4-5",
};

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
      : "Claude";
}

/** Returns the configured model or null when no provider key exists. */
export function getModel(): LanguageModel | null {
  const provider = getActiveProvider();
  if (!provider) return null;
  const modelId = process.env.AI_MODEL || PROVIDER_MODELS[provider];
  switch (provider) {
    case "google":
      return google(modelId);
    case "openai":
      return openai(modelId);
    case "anthropic":
      return anthropic(modelId);
  }
}
