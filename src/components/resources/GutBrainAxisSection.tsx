"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiBrain01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Restaurant02Icon,
  FastWindIcon,
  Shield01Icon,
  Activity01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { CardContent } from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { BdiText } from "./BdiText";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* AxisNode — a small circular node for the brain↔gut pathway          */
/* ------------------------------------------------------------------ */

function AxisNode({
  icon: Icon,
  label,
  hint,
  tone,
  delay = 0,
}: {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
  label: string;
  hint: string;
  tone: "violet" | "teal" | "amber" | "emerald" | "rose";
  delay?: number;
}) {
  const toneClass = {
    violet: {
      ring: "ring-violet-500/30",
      bg: "bg-violet-500/10",
      text: "text-violet-600 dark:text-violet-300",
      glow: "from-violet-400/30 to-fuchsia-300/10",
    },
    teal: {
      ring: "ring-teal-500/30",
      bg: "bg-teal-500/10",
      text: "text-teal-600 dark:text-teal-300",
      glow: "from-teal-400/30 to-cyan-300/10",
    },
    amber: {
      ring: "ring-amber-500/30",
      bg: "bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-300",
      glow: "from-amber-400/30 to-orange-300/10",
    },
    emerald: {
      ring: "ring-emerald-500/30",
      bg: "bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-300",
      glow: "from-emerald-400/30 to-teal-300/10",
    },
    rose: {
      ring: "ring-rose-500/30",
      bg: "bg-rose-500/10",
      text: "text-rose-600 dark:text-rose-300",
      glow: "from-rose-400/30 to-pink-300/10",
    },
  }[tone];

  return (
    <ScrollReveal delay={delay}>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="relative">
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute -inset-2 rounded-full bg-gradient-to-br opacity-60 blur-xl",
              toneClass.glow
            )}
          />
          <div
            className={cn(
              "relative flex h-16 w-16 items-center justify-center rounded-full bg-white/80 ring-1 shadow-md backdrop-blur-md transition-transform duration-300 hover:scale-105 dark:bg-slate-900/70",
              toneClass.ring
            )}
          >
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full",
                toneClass.bg
              )}
            >
              <HugeiconsIcon
                icon={Icon}
                className={cn("h-5 w-5", toneClass.text)}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="max-w-[18ch] text-[11px] leading-snug text-muted-foreground">
          {hint}
        </p>
      </div>
    </ScrollReveal>
  );
}

/* ------------------------------------------------------------------ */
/* ConnectionArrow — a soft, animated-feel arrow between axis nodes    */
/* ------------------------------------------------------------------ */

function ConnectionArrow({
  direction = "down",
  className,
}: {
  direction?: "down" | "up" | "bidirectional";
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-10 w-full items-center justify-center text-teal-500/60 dark:text-teal-300/50",
        className
      )}
    >
      <div className="relative flex h-full w-px items-center justify-center bg-gradient-to-b from-transparent via-teal-400/50 to-transparent">
        {direction !== "up" && (
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className="absolute -bottom-1 h-4 w-4"
            aria-hidden="true"
          />
        )}
        {direction !== "down" && (
          <HugeiconsIcon
            icon={ArrowUp01Icon}
            className="absolute -top-1 h-4 w-4"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* GutBrainAxisSection                                                 */
/* ------------------------------------------------------------------ */

interface GutBrainAxisSectionProps {
  titleKey: TranslationKey;
  introKey: TranslationKey;
  detailKey: TranslationKey;
}

/**
 * A dedicated visual section explaining the gut–brain axis and why IBS
 * co-occurs with fibromyalgia. Uses a vertical pathway diagram (brain →
 * vagus nerve → gut → symptoms) and a side panel of "what this means for
 * you" supportive notes.
 */
export function GutBrainAxisSection({
  titleKey,
  introKey,
  detailKey,
}: GutBrainAxisSectionProps) {
  const { t } = useLanguage();

  return (
    <ScrollReveal>
      <DepthCard tilt={2} delay={0}>
        <SpotlightCard className="group relative overflow-hidden rounded-3xl border border-teal-500/25 bg-gradient-to-br from-teal-50/70 via-emerald-50/60 to-violet-50/60 shadow-xl shadow-teal-950/15 backdrop-blur-xl dark:from-teal-950/30 dark:via-slate-900/60 dark:to-violet-950/30">
          {/* Decorative blobs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -end-20 h-64 w-64 rounded-full bg-teal-300/30 blur-3xl dark:bg-teal-500/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -start-16 h-64 w-64 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-500/10"
          />

          <CardContent className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_1.2fr] md:items-center">
            {/* Left: pathway diagram */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-700 dark:text-teal-300">
                <HugeiconsIcon
                  icon={SparklesIcon}
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
                {t("about.visual.gutBrain.eyebrow")}
              </div>
              <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                <BdiText text={t(titleKey)} />
              </h3>
              <p className="text-sm leading-relaxed text-foreground/80">
                <BdiText text={t(introKey)} />
              </p>

              {/* Vertical pathway */}
              <div className="mt-4 flex flex-col items-stretch">
                <AxisNode
                  icon={AiBrain01Icon}
                  label={t("about.gut.node.brain")}
                  hint={t("about.gut.node.brainHint")}
                  tone="violet"
                  delay={0}
                />
                <ConnectionArrow direction="bidirectional" />
                <AxisNode
                  icon={FastWindIcon}
                  label={t("about.gut.node.vagus")}
                  hint={t("about.gut.node.vagusHint")}
                  tone="emerald"
                  delay={0.05}
                />
                <ConnectionArrow direction="bidirectional" />
                <AxisNode
                  icon={Restaurant02Icon}
                  label={t("about.gut.node.gut")}
                  hint={t("about.gut.node.gutHint")}
                  tone="teal"
                  delay={0.1}
                />
                <ConnectionArrow direction="down" />
                <AxisNode
                  icon={Activity01Icon}
                  label={t("about.gut.node.symptoms")}
                  hint={t("about.gut.node.symptomsHint")}
                  tone="rose"
                  delay={0.15}
                />
              </div>
            </div>

            {/* Right: detail panel + supportive tips */}
            <div className="space-y-3">
              <div className="rounded-2xl border border-teal-500/20 bg-white/70 p-5 shadow-sm backdrop-blur-md dark:bg-slate-900/55">
                <p className="text-sm leading-relaxed text-foreground/85">
                  <BdiText text={t(detailKey)} />
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    {
                      icon: Restaurant02Icon,
                      labelKey: "about.gut.tip.bloating" as const,
                      tone: "teal",
                    },
                    {
                      icon: FastWindIcon,
                      labelKey: "about.gut.tip.motility" as const,
                      tone: "emerald",
                    },
                    {
                      icon: AiBrain01Icon,
                      labelKey: "about.gut.tip.stress" as const,
                      tone: "violet",
                    },
                    {
                      icon: Shield01Icon,
                      labelKey: "about.gut.tip.microbiome" as const,
                      tone: "amber",
                    },
                  ] as const
                ).map((tip, i) => {
                  const toneClass = {
                    teal: {
                      ring: "ring-teal-500/25",
                      bg: "bg-teal-500/10",
                      text: "text-teal-600 dark:text-teal-300",
                    },
                    emerald: {
                      ring: "ring-emerald-500/25",
                      bg: "bg-emerald-500/10",
                      text: "text-emerald-600 dark:text-emerald-300",
                    },
                    violet: {
                      ring: "ring-violet-500/25",
                      bg: "bg-violet-500/10",
                      text: "text-violet-600 dark:text-violet-300",
                    },
                    amber: {
                      ring: "ring-amber-500/25",
                      bg: "bg-amber-500/10",
                      text: "text-amber-600 dark:text-amber-300",
                    },
                  }[tip.tone];

                  return (
                    <ScrollReveal key={tip.labelKey} delay={0.1 + i * 0.04}>
                      <div
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border border-border/60 bg-white/70 p-3 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-emerald-500/10 dark:bg-slate-900/55",
                          toneClass.ring
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1",
                            toneClass.bg,
                            toneClass.ring
                          )}
                        >
                          <HugeiconsIcon
                            icon={tip.icon}
                            className={cn("h-4 w-4", toneClass.text)}
                            aria-hidden="true"
                          />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          <BdiText text={t(tip.labelKey)} />
                        </p>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </SpotlightCard>
      </DepthCard>
    </ScrollReveal>
  );
}
