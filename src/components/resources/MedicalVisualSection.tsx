"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Activity01Icon,
  AiBrain01Icon,
  Moon02Icon,
  FlashIcon,
  SparklesIcon,
  FlameIcon,
  Shield01Icon,
  FastWindIcon,
  Restaurant02Icon,
} from "@hugeicons/core-free-icons";
import Image from "next/image";
import { CardContent } from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { BdiText } from "./BdiText";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* DefinitionHeroCard                                                  */
/* ------------------------------------------------------------------ */

interface DefinitionHeroCardProps {
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  contentKey: TranslationKey;
  highlights: { labelKey: TranslationKey; valueKey: TranslationKey }[];
  illustration: string;
  illustrationAlt: string;
  /** Optional local photo rendered in place of the SVG illustration. */
  image?: string;
}

/**
 * A wide, immersive card that introduces the condition: title, plain-language
 * summary, three numeric/pill highlights, and a medical illustration on the
 * right. Uses glassmorphism + soft pastel gradient backdrop.
 */
export function DefinitionHeroCard({
  titleKey,
  subtitleKey,
  contentKey,
  highlights,
  illustration,
  illustrationAlt,
  image,
}: DefinitionHeroCardProps) {
  const { t } = useLanguage();
  return (
    <ScrollReveal>
      <DepthCard tilt={3} delay={0}>
        <SpotlightCard className="group relative !overflow-hidden !pb-0 -mb-2 rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-white/85 via-emerald-50/70 to-teal-50/70 shadow-xl shadow-emerald-950/20 backdrop-blur-xl dark:from-slate-900/70 dark:via-slate-900/60 dark:to-emerald-950/40">
          {/* Decorative ambient blobs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -end-20 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-500/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -start-16 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl dark:bg-teal-500/10"
          />

          <CardContent className="relative grid gap-6 p-6 sm:p-7 md:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <HugeiconsIcon
                  icon={SparklesIcon}
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
                {t("about.visual.eyebrow")}
              </div>
              <h2 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
                <BdiText text={t(titleKey)} />
              </h2>
              <p className="text-base leading-relaxed text-foreground/85">
                <BdiText text={t(subtitleKey)} />
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                <BdiText text={t(contentKey)} />
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                {highlights.map((h) => (
                  <div
                    key={h.labelKey}
                    className="rounded-2xl border border-emerald-500/20 bg-white/70 p-3 text-center shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:shadow-emerald-500/10 dark:bg-slate-900/50"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <BdiText text={t(h.labelKey)} />
                    </p>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      <BdiText text={t(h.valueKey)} />
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo / Illustration — stretches to the full height of the
                text column on md+ so there is never an empty band beside it */}
            <div className="relative mx-auto w-full max-w-sm md:h-full">
              <div
                aria-hidden="true"
                className="absolute inset-0 -m-2 rounded-[2rem] bg-gradient-to-br from-emerald-300/30 via-teal-300/20 to-cyan-300/20 blur-xl"
              />
              {image ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-emerald-500/20 bg-white/40 shadow-lg backdrop-blur-md md:h-full md:aspect-auto dark:bg-slate-950/40">
                  <img
                    src={image}
                    alt={illustrationAlt}
                    className="h-full w-full object-contain"
                    sizes="(min-width: 768px) 400px, 100vw"
                  />
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-white/40 shadow-lg backdrop-blur-md dark:bg-slate-950/40">
                  <Image
                    src={illustration}
                    alt={illustrationAlt}
                    width={720}
                    height={480}
                    className="h-auto w-full"
                    sizes="(min-width: 768px) 400px, 100vw"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </SpotlightCard>
      </DepthCard>
    </ScrollReveal>
  );
}

/* ------------------------------------------------------------------ */
/* CausesGrid                                                          */
/* ------------------------------------------------------------------ */

const ACCENT_STYLES = {
  emerald: {
    ring: "ring-emerald-500/25",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-300",
    glow: "from-emerald-300/20 to-teal-300/10",
  },
  violet: {
    ring: "ring-violet-500/25",
    bg: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-300",
    glow: "from-violet-300/20 to-fuchsia-300/10",
  },
  sky: {
    ring: "ring-sky-500/25",
    bg: "bg-sky-500/10",
    text: "text-sky-600 dark:text-sky-300",
    glow: "from-sky-300/20 to-indigo-300/10",
  },
  amber: {
    ring: "ring-amber-500/25",
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-300",
    glow: "from-amber-300/20 to-orange-300/10",
  },
  rose: {
    ring: "ring-rose-500/25",
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-300",
    glow: "from-rose-300/20 to-pink-300/10",
  },
  teal: {
    ring: "ring-teal-500/25",
    bg: "bg-teal-500/10",
    text: "text-teal-600 dark:text-teal-300",
    glow: "from-teal-300/20 to-cyan-300/10",
  },
} as const;

interface CauseCard {
  icon: IconSvgElement;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  accent: keyof typeof ACCENT_STYLES;
  image: string;
}

const CAUSE_CARDS: CauseCard[] = [
  {
    icon: AiBrain01Icon,
    titleKey: "about.cause.amplified.title",
    descriptionKey: "about.cause.amplified.desc",
    accent: "emerald",
    image: "/images/%D8%A7%D9%84%D8%AA%D8%AD%D8%B3%D8%B3%20%D8%A7%D9%84%D9%85%D8%B1%D9%83%D8%B2%D9%8As.jpg",
  },
  {
    icon: Activity01Icon,
    titleKey: "about.cause.genetic.title",
    descriptionKey: "about.cause.genetic.desc",
    accent: "violet",
    image: "/images/%D8%A7%D8%B3%D8%AA%D8%B9%D8%AF%D8%A7%D8%AF%20%D9%88%D8%B1%D8%A7%D8%AB%D9%8A.jpg",
  },
  {
    icon: FlashIcon,
    titleKey: "about.cause.trauma.title",
    descriptionKey: "about.cause.trauma.desc",
    accent: "amber",
    image: "/images/%D8%B5%D8%AF%D9%85%D8%A9%20%D8%AC%D8%B3%D8%AF%D9%8A%D8%A9%20%D8%A3%D9%88%20%D8%B9%D8%A7%D8%B7%D9%81%D9%8A%D8%A9.jpg",
  },
  {
    icon: Moon02Icon,
    titleKey: "about.cause.sleep.title",
    descriptionKey: "about.cause.sleep.desc",
    accent: "sky",
    image: "/images/%D8%A7%D8%B6%D8%B7%D8%B1%D8%A7%D8%A8%D8%A7%D8%AA%20%D8%A7%D9%84%D9%86%D9%88%D9%85s.jpg",
  },
  {
    icon: Shield01Icon,
    titleKey: "about.cause.infection.title",
    descriptionKey: "about.cause.infection.desc",
    accent: "rose",
    image: "/images/%D8%A7%D9%84%D8%B9%D8%AF%D9%88%D9%89.jpg",
  },
];

interface CausesGridProps {
  titleKey: TranslationKey;
  introKey: TranslationKey;
}

/**
 * Section header + 5 illustrated cause cards in a responsive content-driven
 * grid (`auto-rows-max`, no forced equal-height rows). Each card wraps only
 * its own image + text — no `h-full` stretch, no fixed min-height, and no
 * injected bottom padding — so no empty white band appears inside the bodies.
 */
export function CausesGrid({ titleKey, introKey }: CausesGridProps) {
  const { t } = useLanguage();
  return (
    <section className="space-y-4">
      <ScrollReveal>
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HugeiconsIcon icon={FlashIcon} className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              <BdiText text={t(titleKey)} />
            </h3>
            <p className="text-sm text-muted-foreground">
              <BdiText text={t(introKey)} />
            </p>
          </div>
        </header>
      </ScrollReveal>

      <div className="grid auto-rows-max grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CAUSE_CARDS.map((card, i) => {
          const style = ACCENT_STYLES[card.accent];
          return (
            <ScrollReveal
              key={card.titleKey}
              delay={i * 0.05}
            >
              <DepthCard tilt={3} delay={i * 0.04} hover>
                <SpotlightCard
                  className={cn(
                    "group relative !overflow-hidden !pb-0 -mb-2 rounded-2xl border border-border/60 bg-white/70 shadow-lg shadow-emerald-950/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:shadow-emerald-950/20 dark:bg-slate-900/60",
                    style.ring
                  )}
                >
                  {/* Soft accent glow */}
                  <div
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute -top-12 -end-12 h-40 w-40 rounded-full bg-gradient-to-br opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100",
                      style.glow
                    )}
                  />
                  <CardContent className="relative flex flex-col gap-2 p-0">
                    {/* Photo — stable aspect-video box */}
                    <div className="relative aspect-video w-full overflow-hidden">
                      <img
                        src={card.image}
                        alt={t(card.titleKey)}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/30 via-transparent to-transparent" />
                    </div>
                    <div className="flex flex-col gap-2 p-5 pt-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 transition-transform duration-300 group-hover:scale-110",
                            style.bg,
                            style.ring
                          )}
                        >
                          <HugeiconsIcon
                            icon={card.icon}
                            className={cn("h-5 w-5", style.text)}
                            aria-hidden="true"
                          />
                        </div>
                        <h4 className="font-semibold text-foreground">
                          <BdiText text={t(card.titleKey)} />
                        </h4>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        <BdiText text={t(card.descriptionKey)} />
                      </p>
                    </div>
                  </CardContent>
                </SpotlightCard>
              </DepthCard>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* SymptomsGrid                                                        */
/* ------------------------------------------------------------------ */

interface SymptomCard {
  icon: IconSvgElement;
  labelKey: TranslationKey;
  valueKey: TranslationKey;
  accent: keyof typeof ACCENT_STYLES;
}

const SYMPTOM_CARDS: SymptomCard[] = [
  {
    icon: Activity01Icon,
    labelKey: "about.symptom.pain.label",
    valueKey: "about.symptom.pain.value",
    accent: "rose",
  },
  {
    icon: FlashIcon,
    labelKey: "about.symptom.fatigue.label",
    valueKey: "about.symptom.fatigue.value",
    accent: "amber",
  },
  {
    icon: AiBrain01Icon,
    labelKey: "about.symptom.fog.label",
    valueKey: "about.symptom.fog.value",
    accent: "violet",
  },
  {
    icon: Moon02Icon,
    labelKey: "about.symptom.sleep.label",
    valueKey: "about.symptom.sleep.value",
    accent: "sky",
  },
  {
    icon: FlameIcon,
    labelKey: "about.symptom.headache.label",
    valueKey: "about.symptom.headache.value",
    accent: "emerald",
  },
  {
    icon: SparklesIcon,
    labelKey: "about.symptom.sensitivity.label",
    valueKey: "about.symptom.sensitivity.value",
    accent: "teal",
  },
  {
    icon: FastWindIcon,
    labelKey: "about.symptom.stiffness.label",
    valueKey: "about.symptom.stiffness.value",
    accent: "sky",
  },
  {
    icon: Restaurant02Icon,
    labelKey: "about.symptom.digestive.label",
    valueKey: "about.symptom.digestive.value",
    accent: "amber",
  },
];

interface SymptomsGridProps {
  titleKey: TranslationKey;
  introKey: TranslationKey;
  illustration: string;
  illustrationAlt: string;
  /** Optional local photo rendered in place of the body-map illustration. */
  image?: string;
}

/**
 * Splits the symptoms list into a left grid of icon-cards and a right
 * pain-map image. The image column stretches to the full height of the card
 * column on desktop (`lg:h-full` + stretch), so the photo is always exactly
 * as tall as the text block beside it — no empty band above or below. On
 * mobile the cards stack above the image, which keeps its proportional ratio.
 */
export function SymptomsGrid({
  titleKey,
  introKey,
  illustration,
  illustrationAlt,
  image,
}: SymptomsGridProps) {
  const { t } = useLanguage();
  return (
    <section className="space-y-4">
      <ScrollReveal>
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HugeiconsIcon icon={Activity01Icon} className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              <BdiText text={t(titleKey)} />
            </h3>
            <p className="text-sm text-muted-foreground">
              <BdiText text={t(introKey)} />
            </p>
          </div>
        </header>
      </ScrollReveal>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Left column — Symptoms icon-card grid (content-driven, no forced rows) */}
        <div className="grid auto-rows-max grid-cols-1 gap-3 sm:grid-cols-2">
          {SYMPTOM_CARDS.map((card, i) => {
            const style = ACCENT_STYLES[card.accent];
            return (
              <ScrollReveal key={card.labelKey} delay={i * 0.04}>
                <DepthCard tilt={3} delay={i * 0.03} hover>
                  <SpotlightCard
                    className={cn(
                      "group rounded-2xl border border-border/60 bg-white/75 p-4 shadow-md shadow-emerald-950/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-emerald-950/15 dark:bg-slate-900/55",
                      style.ring
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110",
                          style.bg,
                          style.ring
                        )}
                      >
                        <HugeiconsIcon
                          icon={card.icon}
                          className={cn("h-5 w-5", style.text)}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-semibold text-foreground">
                          <BdiText text={t(card.labelKey)} />
                        </p>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          <BdiText text={t(card.valueKey)} />
                        </p>
                      </div>
                    </div>
                  </SpotlightCard>
                </DepthCard>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Right column — pain-map image stretches to the full height of the
            card column so it always matches the text block exactly — no
            horizontal bands above or below the image on desktop. */}
        <div className="group relative w-full">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl sm:aspect-[16/10] lg:h-full lg:aspect-auto">
            {image ? (
              <img
                src={image}
                alt={illustrationAlt}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <Image
                src={illustration}
                alt={illustrationAlt}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            {/* Legibility washes */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-emerald-900/10 to-transparent"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 ring-1 ring-inset ring-emerald-500/20"
            />
            {/* Caption chip */}
            <div className="absolute inset-x-0 bottom-3 flex justify-center px-4">
              <span className="max-w-full rounded-full border border-white/20 bg-black/35 px-3 py-1 text-center text-xs font-medium text-white/90 backdrop-blur-sm">
                <BdiText text={t("about.visual.symptoms.caption")} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
