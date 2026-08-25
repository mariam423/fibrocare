"use client";

/**
 * Interactive "Verified Source" citation badge for AI outputs.
 *
 * Renders a small emerald badge; clicking it opens a lightweight drawer
 * (dialog) showing the cited medical guideline title, its clinical origin,
 * and the retrieved knowledge content — so every AI takeaway carries
 * auditable provenance. Only rendered when the caller has a retrieved
 * `RetrievedChunk`; zero-hallucination fallbacks live in the callers.
 */

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { BadgeCheckIcon } from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";
import type { RetrievedChunk } from "@/lib/ai/rag/types";

export function CitationBadge({
  chunk,
  className,
}: {
  chunk: RetrievedChunk;
  className?: string;
}) {
  const { t, locale } = useLanguage();
  // Section badges follow the reading direction of the active locale:
  // Arabic labels flow RTL/right, English labels LTR/left. The values below
  // are English knowledge-base strings and are pinned LTR independently.
  const labelAlign = locale === "ar" ? "text-right" : "text-left";
  const labelClass = `text-[11px] font-semibold uppercase tracking-wide text-muted-foreground ${labelAlign}`;

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            className={`inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 transition-all duration-200 hover:scale-[1.02] hover:border-emerald-500/50 hover:bg-emerald-500/15 active:scale-[0.98] dark:text-emerald-300 ${className ?? ""}`}
            aria-label={t("resources.ai.viewGuideline")}
          >
            <HugeiconsIcon icon={BadgeCheckIcon} className="h-3.5 w-3.5" aria-hidden="true" />
            {t("resources.ai.verified")}
          </button>
        }
      />
      <DialogContent className="ring-1 ring-border">
        {/* Header rendered once — the verified-source title + the cited
            guideline description live here and nowhere else in the body. */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <HugeiconsIcon icon={BadgeCheckIcon} className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            {t("resources.ai.verified")}
          </DialogTitle>
          <DialogDescription>{t("resources.ai.guidelineLabel")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {/* Medical title — English knowledge-base text: value pinned
              LTR/left-aligned and <bdi>-isolated so trailing punctuation
              never inverts inside the Arabic RTL page. */}
          <div>
            <p className={labelClass}>{t("resources.ai.titleLabel")}</p>
            <p dir="ltr" className="text-left text-sm font-medium text-foreground">
              <bdi>{chunk.title}</bdi>
            </p>
          </div>
          {/* Clinical origin — same LTR/bdi treatment. */}
          <div>
            <p className={labelClass}>{t("resources.ai.originLabel")}</p>
            <p dir="ltr" className="text-left text-sm text-foreground">
              <bdi>{chunk.source}</bdi>
            </p>
          </div>
          {/* Clinical summary — long English guideline passage, pinned LTR
              so brackets/quotes/trailing periods stay on the correct edge. */}
          <div>
            <p className={labelClass}>{t("resources.ai.summaryLabel")}</p>
            <div dir="ltr" className="rounded-xl border border-border/60 bg-muted/30 p-3 text-left">
              <p className="text-sm leading-relaxed text-muted-foreground">
                <bdi>{chunk.content}</bdi>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
