"use client";

/**
 * AI Flare Action Plan Generator.
 *
 * "Create Action Plan" compiles a 3-step immediate-relief protocol from
 * real-time pain (HealthContext), remaining spoons (shared storage slot),
 * and live weather. Every step is grounded in a knowledge chunk retrieved
 * through the local RAG pipeline and carries a "Verified Source" badge;
 * if a step cannot be verified in the knowledge index, the UI shows a safe
 * offline note instead of ungrounded advice.
 */

import React, { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useHealth } from "@/context/HealthContext";
import { useWeather } from "@/hooks/useWeather";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  buildFlareActionPlan,
  groundingChunk,
  type FlarePlan,
} from "@/lib/resources/engine";
import type { RetrievedChunk } from "@/lib/ai/rag/types";
import { CitationBadge } from "./CitationBadge";

export function FlareActionPlan() {
  const { t } = useLanguage();
  const { currentPainLevel } = useHealth();
  const weather = useWeather();
  // Shared storage slot — written by the toolkit's spoon tracker, read here.
  const [spoons] = useLocalStorage<number>("fibrocare:spoons", 6);

  const [plan, setPlan] = useState<FlarePlan | null>(null);
  const [chunks, setChunks] = useState<(RetrievedChunk | null)[]>([]);

  const buildPlan = () => {
    const next = buildFlareActionPlan({
      painLevel: currentPainLevel,
      spoonsRemaining: spoons,
      weatherTriggers: weather.triggers,
    });
    setPlan(next);
    setChunks(next.steps.map((step) => groundingChunk(step.chunkId)));
  };

  const context = useMemo(() => {
    const { temperature, humidity } = weather.weather;
    return `${t("rescue.context.pain")} ${currentPainLevel}/10 · ${t(
      "rescue.context.spoons"
    )} ${spoons} · ${t("rescue.context.weather")} ${temperature}° ${humidity}%`;
  }, [t, currentPainLevel, spoons, weather.weather]);

  return (
    <section className="w-full rounded-2xl border border-emerald-500/20 bg-white/70 shadow-lg shadow-emerald-950/20 backdrop-blur-xl dark:bg-slate-900/60">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <HugeiconsIcon icon={SparklesIcon} className="h-5 w-5 text-primary" aria-hidden="true" />
            {t("resources.plan.title")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("resources.plan.subtitle")}</p>
        </div>
        <Button
          onClick={buildPlan}
          className="shrink-0 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] active:bg-emerald-500/10"
        >
          <HugeiconsIcon icon={SparklesIcon} className="me-1 h-4 w-4" aria-hidden="true" />
          {plan ? t("resources.plan.rebuild") : t("resources.plan.create")}
        </Button>
      </div>

      {plan && (
        <div className="space-y-3 px-5 pb-5" aria-live="polite">
          <p className="text-xs text-muted-foreground">
            <bdi>{t("resources.plan.basedOn", { context })}</bdi>
          </p>
          <ol className="space-y-3">
            {plan.steps.map((step, idx) => {
              const chunk = chunks[idx] ?? null;
              return (
                <li
                  key={step.titleKey}
                  className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    <bdi>{idx + 1}</bdi>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                      {t(step.titleKey)}
                      {chunk ? (
                        <CitationBadge chunk={chunk} />
                      ) : (
                        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                          {t("resources.ai.unverified")}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{t(step.detailKey)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          {chunks.some((c) => c === null) && (
            <p className="text-xs text-muted-foreground">{t("resources.ai.unverifiedNote")}</p>
          )}
        </div>
      )}
    </section>
  );
}
