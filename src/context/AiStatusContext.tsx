"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getAiStatus } from "@/app/actions";

/** Shape of the shared AI runtime status (kept in sync with the server action). */
export type AiStatus = Awaited<ReturnType<typeof getAiStatus>>;

/** Human label for a live provider id (Gemini/OpenAI/Claude/OpenRouter) or "". */
export function providerDisplayName(provider: string | null): string {
  return provider === "google"
    ? "Gemini"
    : provider === "openai"
      ? "OpenAI"
      : provider === "anthropic"
        ? "Claude"
        : provider === "openrouter"
          ? "OpenRouter"
          : "";
}

interface AiStatusContextValue {
  /** `null` while the initial status is still resolving. */
  status: AiStatus | null;
  /** Re-run `getAiStatus()` (e.g. after an env change without a reload). */
  refresh: () => Promise<void>;
}

const AiStatusContext = createContext<AiStatusContextValue | null>(null);

/**
 * Fetches the AI operational mode (live / mock / offline) exactly once and
 * shares it with every consumer — the header badge and the AI Care Companion
 * previously each called the `getAiStatus` server action on mount.
 */
export function AiStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AiStatus | null>(null);
  // Guard against React StrictMode double-invoking effects in dev, and
  // against overlapping manual refreshes.
  const startedRef = useRef(false);
  const inFlightRef = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      setStatus(await getAiStatus());
    } catch {
      // Same graceful fallback the components used before: an unreachable or
      // failing status read degrades to offline, never to a broken UI.
      setStatus({ configured: false, provider: null, mock: false });
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void refresh();
  }, [refresh]);

  return (
    <AiStatusContext.Provider value={{ status, refresh }}>
      {children}
    </AiStatusContext.Provider>
  );
}

export function useAiStatus(): AiStatusContextValue {
  const ctx = useContext(AiStatusContext);
  if (!ctx) {
    throw new Error("useAiStatus must be used within an AiStatusProvider");
  }
  return ctx;
}
