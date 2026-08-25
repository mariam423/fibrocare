"use client";

/**
 * "AI 1-Minute Takeaway" banner for the About / Diagnosis detail pages.
 *
 * An expandable glass card that surfaces the page's 3 most important facts
 * in short, brain-fog-friendly bullets. Every bullet set is grounded in a
 * knowledge chunk retrieved through the local RAG pipeline — the banner
 * carries a "Verified Source" badge when the top retrieval hit matches the
 * expected chunk, and falls back to a safe offline note otherwise
 * (zero-hallucination, same contract as the resource cards).
 */

import React, { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon, ChevronDownIcon } from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { RetrievedChunk } from "@/lib/ai/rag/types";
import type { TranslationKey } from "@/lib/translations";
import { CitationBadge } from "./CitationBadge";

export function AiTakeawayBanner({
  bullets,
  chunk,
}: {
  bullets: [TranslationKey, TranslationKey, TranslationKey];
  chunk: RetrievedChunk | null;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const list = useMemo(
    () => bullets.map((key) => ({ key, text: t(key) })),
    [bullets, t]
  );

  return (
    <section
      className={cn(
        "w-full rounded-2xl border border-emerald-500/20 bg-white/70 shadow-lg shadow-emerald-950/20 backdrop-blur-xl transition-all duration-200 dark:bg-slate-900/60",
        open && "hover:border-emerald-400/40"
      )}
      aria-label={t("resources.takeaway.title")}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-4 text-start transition-all duration-200 hover:scale-[1.01] hover:bg-emerald-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
            <HugeiconsIcon icon={SparklesIcon} className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {t("resources.takeaway.title")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("resources.takeaway.subtitle")}
            </p>
          </div>
        </div>
        <HugeiconsIcon
          icon={ChevronDownIcon}
          className={cn(
            "h-5 w-5 shrink-0 text-emerald-600 transition-transform duration-200 dark:text-emerald-300",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="space-y-3 px-5 pb-5" aria-live="polite">
          <ul className="space-y-2">
            {list.map((item, i) => (
              <li
                key={item.key}
                className="flex items-start gap-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-3"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                  <bdi>{i + 1}</bdi>
                </span>
                <span className="text-sm text-foreground/90">{item.text}</span>
              </li>
            ))}
          </ul>
          {chunk ? (
            <CitationBadge chunk={chunk} />
          ) : (
            <p className="text-xs text-muted-foreground">{t("resources.ai.unverifiedNote")}</p>
          )}
        </div>
      )}
    </section>
  );
}
