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
  const { t } = useLanguage();

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
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <HugeiconsIcon icon={BadgeCheckIcon} className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            {t("resources.ai.verified")}
          </DialogTitle>
          <DialogDescription>{t("resources.ai.guidelineLabel")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("resources.ai.guidelineLabel")}
            </p>
            <p className="text-sm font-medium text-foreground">{chunk.title}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("resources.ai.originLabel")}
            </p>
            <p className="text-sm text-foreground">{chunk.source}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
            <p className="text-sm leading-relaxed text-muted-foreground">{chunk.content}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
