"use client";

import {
  providerDisplayName,
  useAiStatus,
} from "@/context/AiStatusContext";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

type AiMode = "live" | "mock" | "offline";

const PILL_STYLES: Record<AiMode, string> = {
  live: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/30",
  mock: "bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/30",
  offline:
    "bg-slate-500/10 text-slate-600 ring-slate-500/25 dark:bg-slate-400/10 dark:text-slate-300 dark:ring-slate-400/30",
};

const DOT_STYLES: Record<AiMode, string> = {
  live: "bg-emerald-500",
  mock: "bg-amber-500",
  offline: "bg-slate-400",
};

/**
 * Compact AI operational-mode badge for the app header: shows whether the
 * AI Care Companion is running live (real provider key), in mock mode
 * (simulated replies, no key), or offline. Reads the shared AiStatusContext,
 * which fetches `getAiStatus()` once for the whole app — the companion shows
 * the exact same mode.
 */
export function AiStatusBadge() {
  const { t } = useLanguage();
  const { status } = useAiStatus();

  const mode: AiMode | null =
    status === null
      ? null
      : status.configured
        ? status.mock
          ? "mock"
          : "live"
        : "offline";
  const provider = status === null ? "" : providerDisplayName(status.provider);

  const label =
    mode === "live"
      ? provider
        ? `${t("ai.live")} · ${provider}`
        : t("ai.live")
      : mode === "mock"
        ? t("ai.mock")
        : mode === "offline"
          ? t("ai.offline")
          : t("ai.checking");

  return (
    <span
      role="status"
      title={`${t("ai.statusLabel")}: ${label}`}
      aria-label={`${t("ai.statusLabel")}: ${label}`}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset transition-colors",
        mode === null
          ? "bg-muted text-muted-foreground ring-border"
          : PILL_STYLES[mode]
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          mode === null ? "bg-muted-foreground/60" : DOT_STYLES[mode],
          mode === "live" &&
            "animate-pulse [animation-duration:2.2s] motion-reduce:animate-none"
        )}
      />
      {label}
    </span>
  );
}
