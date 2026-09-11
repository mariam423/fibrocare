"use client";

/**
 * "Fibromyalgia & the Menstrual Cycle" — dedicated visual section for the
 * /resources/cycle detail page.
 *
 * Mirrors the structure of GutBrainAxisSection / WeatherSensitivitySection:
 * glassmorphism SpotlightCard inside a DepthCard, decorative ambient blobs,
 * bilingual copy through TranslationKeys, a local photo, and RTL-correct
 * text via BdiText.
 *
 * Blocks:
 *  1. Scientific & biological mechanism — hormone → serotonin/norepinephrine
 *     → pain-sensitivity pathway shown as a horizontal cycle timeline
 *     (menstrual → follicular → ovulatory → luteal → pre-period risk window).
 *  2. Predictive flare forecasting — the 3–7 day pre-period window and how
 *     FibroCare's cycle tracking + flare forecast alert the user early.
 *  3. Actionable self-care strategies — spoon management, thermal therapy,
 *     nutritional support, each as a tip card with an icon.
 *  4. References footer — clean list of medical/academic sources.
 */

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SparklesIcon,
  Moon02Icon,
  CalendarArrowDownIcon,
  AlertCircleIcon,
  Restaurant02Icon,
  DropletIcon,
  FireIcon,
  BookOpen02Icon,
  Link01Icon,
  ArrowRight01Icon,
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
/* Data                                                                */
/* ------------------------------------------------------------------ */

const CYCLE_PHASES: Array<{
  key: TranslationKey;
  subKey: TranslationKey;
  tone: "rose" | "emerald" | "sky" | "amber";
}> = [
  { key: "cycle.phase.menstrual", subKey: "cycle.phase.menstrualSub", tone: "rose" },
  { key: "cycle.phase.follicular", subKey: "cycle.phase.follicularSub", tone: "emerald" },
  { key: "cycle.phase.ovulatory", subKey: "cycle.phase.ovulatorySub", tone: "sky" },
  { key: "cycle.phase.luteal", subKey: "cycle.phase.lutealSub", tone: "amber" },
  { key: "cycle.phase.window", subKey: "cycle.phase.windowSub", tone: "rose" },
];

const PHASE_TONE: Record<
  "rose" | "emerald" | "sky" | "amber",
  { dot: string; text: string; ring: string }
> = {
  rose: {
    dot: "bg-rose-400/80",
    text: "text-rose-700 dark:text-rose-300",
    ring: "border-rose-400/30 bg-rose-500/5",
  },
  emerald: {
    dot: "bg-emerald-400/80",
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "border-emerald-400/30 bg-emerald-500/5",
  },
  sky: {
    dot: "bg-sky-400/80",
    text: "text-sky-700 dark:text-sky-300",
    ring: "border-sky-400/30 bg-sky-500/5",
  },
  amber: {
    dot: "bg-amber-400/80",
    text: "text-amber-700 dark:text-amber-300",
    ring: "border-amber-400/30 bg-amber-500/5",
  },
};

const SELF_CARE_TIPS: Array<{
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  tone: "violet" | "amber" | "teal";
}> = [
  {
    icon: DropletIcon,
    titleKey: "cycle.tip.spoons.title",
    bodyKey: "cycle.tip.spoons.body",
    tone: "violet",
  },
  {
    icon: FireIcon,
    titleKey: "cycle.tip.heat.title",
    bodyKey: "cycle.tip.heat.body",
    tone: "amber",
  },
  {
    icon: Restaurant02Icon,
    titleKey: "cycle.tip.nutrition.title",
    bodyKey: "cycle.tip.nutrition.body",
    tone: "teal",
  },
];

const TIP_TONE: Record<"violet" | "amber" | "teal", string> = {
  violet:
    "border-violet-400/25 bg-violet-500/5 text-violet-700 dark:text-violet-300",
  amber:
    "border-amber-400/25 bg-amber-500/5 text-amber-700 dark:text-amber-300",
  teal:
    "border-teal-400/25 bg-teal-500/5 text-teal-700 dark:text-teal-300",
};

const REFERENCES: Array<{
  titleKey: TranslationKey;
  detailKey: TranslationKey;
  url: string;
}> = [
  {
    titleKey: "cycle.ref.cdc",
    detailKey: "cycle.ref.cdc.detail",
    url: "https://www.cdc.gov/fibromyalgia/index.html",
  },
  {
    titleKey: "cycle.ref.niams",
    detailKey: "cycle.ref.niams.detail",
    url: "https://www.niams.nih.gov/health-topics/fibromyalgia",
  },
  {
    titleKey: "cycle.ref.acr",
    detailKey: "cycle.ref.acr.detail",
    url: "https://www.rheumatology.org/",
  },
  {
    titleKey: "cycle.ref.cochrane",
    detailKey: "cycle.ref.cochrane.detail",
    url: "https://www.cochranelibrary.com/",
  },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface HormonalCycleSectionProps {
  titleKey: TranslationKey;
  eyebrowKey: TranslationKey;
  introKey: TranslationKey;
  /** Mechanism prose (hormones → neurotransmitters → hyperalgesia). */
  mechanismTitleKey: TranslationKey;
  mechanismBodyKey: TranslationKey;
  /** Forecast prose (3–7 days before the period). */
  forecastTitleKey: TranslationKey;
  forecastBodyKey: TranslationKey;
  /** Local correlation graphic from public/images. */
  image?: string;
}

export function HormonalCycleSection({
  titleKey,
  eyebrowKey,
  introKey,
  mechanismTitleKey,
  mechanismBodyKey,
  forecastTitleKey,
  forecastBodyKey,
  image,
}: HormonalCycleSectionProps) {
  const { t } = useLanguage();

  return (
    <ScrollReveal as="section">
      <DepthCard tilt={2} delay={0}>
        <SpotlightCard className="group relative !overflow-hidden !pb-0 -mb-2 rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-50/60 via-violet-50/50 to-teal-50/60 shadow-xl shadow-rose-950/10 backdrop-blur-xl dark:from-rose-950/20 dark:via-slate-900/60 dark:to-teal-950/30">
          {/* Decorative blobs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -end-20 h-64 w-64 rounded-full bg-rose-300/25 blur-3xl dark:bg-rose-500/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -start-16 h-64 w-64 rounded-full bg-teal-300/20 blur-3xl dark:bg-teal-500/10"
          />

          <CardContent className="relative space-y-8 p-5 sm:p-7">
            {/* ── Header ─────────────────────────────────────── */}
            {/* NOTE: no section title here — the page h1 lives in
                ContentPageLayout below; repeating it here made the page
                look double-rendered. titleKey is kept for the image alt. */}
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-700 dark:text-rose-300">
                <HugeiconsIcon
                  icon={SparklesIcon}
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
                {t(eyebrowKey)}
              </div>
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-foreground/80">
                <BdiText text={t(introKey)} />
              </p>
            </div>

            {/* ── 1. Scientific & biological mechanism ───────── */}
            <div className="space-y-3 rounded-2xl border border-rose-500/15 bg-white/40 p-4 sm:p-5 dark:bg-slate-950/25">
              <h4 className="flex items-center gap-2 text-base font-bold text-foreground">
                <HugeiconsIcon
                  icon={Moon02Icon}
                  className="h-4 w-4 text-rose-500 dark:text-rose-400"
                  aria-hidden="true"
                />
                <BdiText text={t(mechanismTitleKey)} />
              </h4>
              <p className="text-sm leading-relaxed text-foreground/85">
                <BdiText text={t(mechanismBodyKey)} />
              </p>

              {/* Cycle-phase timeline: where in the month risk rises */}
              <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3 lg:grid-cols-5">
                {CYCLE_PHASES.map((phase) => {
                  const tone = PHASE_TONE[phase.tone];
                  return (
                    <div
                      key={phase.key}
                      className={cn(
                        "rounded-xl border p-2.5 transition-all duration-200 hover:border-rose-400/40",
                        tone.ring
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "h-2 w-2 shrink-0 rounded-full",
                            tone.dot
                          )}
                          aria-hidden="true"
                        />
                        <span
                          className={cn(
                            "text-xs font-bold",
                            tone.text
                          )}
                        >
                          <BdiText text={t(phase.key)} />
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                        <BdiText text={t(phase.subKey)} />
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 2. Predictive forecasting ──────────────────── */}
            <div className="space-y-3 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-50/50 to-rose-50/40 p-4 sm:p-5 dark:from-amber-950/15 dark:to-rose-950/15">
              <h4 className="flex items-center gap-2 text-base font-bold text-foreground">
                <HugeiconsIcon
                  icon={AlertCircleIcon}
                  className="h-4 w-4 text-amber-600 dark:text-amber-400"
                  aria-hidden="true"
                />
                <BdiText text={t(forecastTitleKey)} />
              </h4>
              <p className="text-sm leading-relaxed text-foreground/85">
                <BdiText text={t(forecastBodyKey)} />
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                  <HugeiconsIcon
                    icon={CalendarArrowDownIcon}
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                  {t("cycle.forecast.badge")}
                </span>
                <span className="text-xs text-muted-foreground">
                  <BdiText text={t("cycle.forecast.hint")} />
                </span>
              </div>
            </div>

            {/* ── 3. Actionable self-care strategies ─────────── */}
            <div className="space-y-3">
              <h4 className="text-base font-bold text-foreground">
                {t("cycle.tips.title")}
              </h4>
              <div className="grid gap-3 sm:grid-cols-3">
                {SELF_CARE_TIPS.map((tip) => (
                  <div
                    key={tip.titleKey}
                    className={cn(
                      "rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
                      TIP_TONE[tip.tone]
                    )}
                  >
                    <HugeiconsIcon
                      icon={tip.icon}
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                    <p className="mt-2 text-sm font-bold">
                      <BdiText text={t(tip.titleKey)} />
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-foreground/75">
                      <BdiText text={t(tip.bodyKey)} />
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Correlation graphic ────────────────────────── */}
            {image && (
              <figure className="border-t border-rose-500/15 pt-5">
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl border border-emerald-500/20 bg-white/50 shadow-lg shadow-emerald-950/15 backdrop-blur-xl sm:aspect-[16/9] dark:bg-slate-950/40">
                  <img
                    src={image}
                    alt={t(titleKey)}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-rose-950/20 via-transparent to-transparent"
                  />
                </div>
                <figcaption className="mt-2 text-center text-xs text-muted-foreground">
                  <BdiText text={t("cycle.image.caption")} />
                </figcaption>
              </figure>
            )}

            {/* ── 4. References & academic sources ───────────── */}
            <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/40 p-4 sm:p-5">
              <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                <HugeiconsIcon
                  icon={BookOpen02Icon}
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                {t("cycle.references.title")}
              </h4>
              <ul className="grid gap-2 sm:grid-cols-2">
                {REFERENCES.map((ref) => (
                  <li key={ref.url}>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/ref flex items-start gap-2 rounded-xl border border-transparent p-2 transition-all duration-200 hover:border-emerald-400/30 hover:bg-emerald-500/5"
                    >
                      <HugeiconsIcon
                        icon={Link01Icon}
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-foreground/90 group-hover/ref:text-primary">
                          <BdiText text={t(ref.titleKey)} />
                        </span>
                        <span className="block text-[11px] leading-relaxed text-muted-foreground">
                          <BdiText text={t(ref.detailKey)} />
                        </span>
                      </span>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground transition-all group-hover/ref:translate-x-0.5 group-hover/ref:text-primary rtl:-scale-x-100"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                <BdiText text={t("cycle.references.disclaimer")} />
              </p>
            </div>
          </CardContent>
        </SpotlightCard>
      </DepthCard>
    </ScrollReveal>
  );
}
