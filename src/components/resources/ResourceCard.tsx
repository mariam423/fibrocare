"use client";

/**
 * Resource card for the Care Resources grid.
 *
 * Unified glassmorphism shell (emerald-tinted, backdrop-blur), uniform
 * aspect-video imagery with hover zoom + emerald gradient overlay, an
 * expandable "Quick AI Summary" drawer (3 brain-fog-friendly bullets with a
 * verified-source citation), and a detail dialog whose "Explain like I'm
 * foggy" toggle swaps the longer tips for the ultra-short plain-language
 * points. Every string is a translation key.
 */

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Book01Icon, ChevronDownIcon } from "@hugeicons/core-free-icons";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import {
  CARD_SUMMARIES,
  groundingChunkForCard,
  type EffortLevel,
} from "@/lib/resources/engine";
import { CitationBadge } from "./CitationBadge";

export interface LocalizedResource {
  id: string;
  title: string;
  description: string;
  categoryLabel: string;
  icon: React.ReactNode;
  image: string;
  bannerGradient: string;
  color: { light: string; dark: string };
  tips: string[];
  effort: EffortLevel;
}

const EFFORT_KEYS: Record<EffortLevel, "resources.effort.low" | "resources.effort.medium"> = {
  low: "resources.effort.low",
  medium: "resources.effort.medium",
};

export function ResourceCard({ res }: { res: LocalizedResource }) {
  const { t } = useLanguage();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [foggy, setFoggy] = useState(false);

  const summary = CARD_SUMMARIES[res.id];
  const chunk = useMemo(
    () => (summary ? groundingChunkForCard(res.id) : null),
    [res.id, summary]
  );

  return (
    <SpotlightCard className="group h-full overflow-hidden rounded-2xl border border-emerald-500/20 bg-white/70 shadow-lg shadow-emerald-950/20 backdrop-blur-xl transition-all duration-300 hover:shadow-emerald-950/30 dark:bg-slate-900/60">
      {/* Imagery — uniform ratio, hover zoom, emerald wash */}
      <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl">
        <Image
          src={res.image}
          alt={res.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/50 via-emerald-950/10 to-transparent" />
        <span className="absolute start-3 top-3 rounded-full border border-white/30 bg-black/40 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          {t(EFFORT_KEYS[res.effort])}
        </span>
      </div>

      <CardHeader className="px-5 pb-2 pt-4">
        <div className="mb-1.5 flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset",
              res.color.light,
              res.color.dark
            )}
          >
            {res.categoryLabel}
          </span>
        </div>
        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              res.color.light,
              res.color.dark
            )}
          >
            {res.icon}
          </span>
          {res.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-muted-foreground">
          {res.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 px-5 pb-5 pt-2">
        {/* Quick AI Summary (TL;DR) drawer */}
        {summary && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
            <button
              type="button"
              onClick={() => setSummaryOpen((open) => !open)}
              aria-expanded={summaryOpen}
              className="flex w-full items-center justify-between gap-2 rounded-lg text-start text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              {t("resources.ai.toggle")}
              <HugeiconsIcon
                icon={ChevronDownIcon}
                className={cn("h-4 w-4 shrink-0 text-primary transition-transform duration-200", summaryOpen && "rotate-180")}
                aria-hidden="true"
              />
            </button>
            {summaryOpen && (
              <div className="mt-2 space-y-2" aria-live="polite">
                <ul className="space-y-1.5">
                  {summary.bullets.map((key) => (
                    <li key={key} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>
                {chunk ? (
                  <CitationBadge chunk={chunk} />
                ) : (
                  <p className="text-xs text-muted-foreground">{t("resources.ai.unverified")}</p>
                )}
              </div>
            )}
          </div>
        )}

        <Dialog>
          <DialogTrigger
            render={
              <Button
                variant="outline"
                className="w-full rounded-xl border-border transition-all duration-200 hover:scale-[1.02] hover:bg-muted active:scale-[0.98]"
              >
                <HugeiconsIcon icon={Book01Icon} className="me-2 h-4 w-4" aria-hidden="true" />
                {t("common.readMore")}
              </Button>
            }
          />
          <DialogContent className="ring-1 ring-border">
            <DialogHeader>
              <DialogTitle className="text-2xl text-foreground">{res.title}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {t("resources.tipsFor", { category: res.categoryLabel })}
              </DialogDescription>
            </DialogHeader>

            {/* Plain Language Simplifier — "Explain like I'm foggy" */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">
                {foggy ? t("resources.ai.foggy") : t("resources.ai.standard")}
              </p>
              <button
                type="button"
                onClick={() => setFoggy((f) => !f)}
                aria-pressed={foggy}
                className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {foggy ? t("resources.ai.standard") : t("resources.ai.foggy")}
              </button>
            </div>

            <div className="space-y-4 py-2">
              {foggy && summary ? (
                <div className="space-y-2">
                  <ul className="space-y-3">
                    {summary.bullets.map((key) => (
                      <li key={key} className="flex items-start gap-3 text-foreground">
                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{t(key)}</span>
                      </li>
                    ))}
                  </ul>
                  {chunk ? (
                    <CitationBadge chunk={chunk} />
                  ) : (
                    <p className="text-xs text-muted-foreground">{t("resources.ai.unverifiedNote")}</p>
                  )}
                </div>
              ) : (
                <ul className="space-y-3">
                  {res.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-foreground">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </SpotlightCard>
  );
}
