"use client";

/**
 * "Trigger swaps" panel for the Nutrition page.
 *
 * Common trigger ingredients each have a "Suggest swap" action that reveals
 * a gentler replacement plus a plain-language reason. Swaps come from the
 * deterministic, verified map in the resources engine (never free-form
 * advice) and carry a "Verified Source" badge when the anti-inflammatory
 * diet chunk is retrievable — otherwise a safe offline note.
 */

import React, { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  SparklesIcon,
  CandyIcon,
  TeaIcon,
  BeerIcon,
  HamburgerIcon,
  SodaCanIcon,
  Alert01Icon,
} from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import {
  groundingChunk,
  suggestFoodSwap,
  type TriggerFoodId,
} from "@/lib/resources/engine";
import type { TranslationKey } from "@/lib/translations";
import { CitationBadge } from "./CitationBadge";

const TRIGGERS: Array<{
  id: TriggerFoodId;
  labelKey: TranslationKey;
  icon: IconSvgElement;
}> = [
  { id: "sugar", labelKey: "nutrition.swap.trigger.sugar", icon: CandyIcon },
  { id: "caffeine", labelKey: "nutrition.swap.trigger.caffeine", icon: TeaIcon },
  { id: "alcohol", labelKey: "nutrition.swap.trigger.alcohol", icon: BeerIcon },
  {
    id: "processed",
    labelKey: "nutrition.swap.trigger.processed",
    icon: HamburgerIcon,
  },
  { id: "sodas", labelKey: "nutrition.swap.trigger.sodas", icon: SodaCanIcon },
];

export function TriggerFoodSwap() {
  const { t } = useLanguage();
  const [open, setOpen] = useState<TriggerFoodId | null>(null);

  // Verified-source citation — retrieved through the local RAG pipeline,
  // null → safe offline note (zero-hallucination fallback).
  const dietChunk = useMemo(() => groundingChunk("diet-anti-inflammatory"), []);

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
      <p className="text-sm font-semibold text-foreground">{t("nutrition.swap.title")}</p>
      <p className="mt-1 text-xs text-muted-foreground">{t("nutrition.swap.subtitle")}</p>

      <ul className="mt-3 space-y-2">
        {TRIGGERS.map((trigger) => {
          const isOpen = open === trigger.id;
          const swap = suggestFoodSwap(trigger.id);
          return (
            <li
              key={trigger.id}
              className="rounded-xl border border-border/60 bg-card/50 transition-all duration-200 hover:border-emerald-400/30"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : trigger.id)}
                className="flex w-full items-center gap-2.5 p-2.5 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <HugeiconsIcon icon={trigger.icon} className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 text-sm text-foreground/90">
                  {t(trigger.labelKey)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-500/15 active:scale-[0.98] dark:text-emerald-300">
                  <HugeiconsIcon icon={SparklesIcon} className="h-3 w-3" aria-hidden="true" />
                  {t("nutrition.swap.suggest")}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-border/50 p-3" aria-live="polite">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("nutrition.swap.suggested")}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {t(swap.swapKey)}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("nutrition.swap.because")}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{t(swap.reasonKey)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {dietChunk ? (
                      <CitationBadge chunk={dietChunk} />
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                        <HugeiconsIcon icon={Alert01Icon} className="h-3 w-3" aria-hidden="true" />
                        {t("resources.ai.unverified")}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
