"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Sun01Icon,
  CloudSnowIcon,
  CloudAngledRainIcon,
  SunCloudAngledZap01Icon,
  SunCloud01Icon,
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
/* WeatherSensitivitySection                                           */
/* ------------------------------------------------------------------ */

interface WeatherSensitivitySectionProps {
  titleKey: TranslationKey;
  eyebrowKey: TranslationKey;
  introKey: TranslationKey;
  /** Local photo rendered as a full-width banner below the copy. */
  image?: string;
}

const TIPS: {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
  labelKey: TranslationKey;
  tone: "sky" | "indigo" | "amber" | "teal";
}[] = [
  {
    icon: Sun01Icon,
    labelKey: "about.weatherSensitivity.tip.heat",
    tone: "amber",
  },
  {
    icon: CloudSnowIcon,
    labelKey: "about.weatherSensitivity.tip.cold",
    tone: "sky",
  },
  {
    icon: CloudAngledRainIcon,
    labelKey: "about.weatherSensitivity.tip.pressure",
    tone: "indigo",
  },
  {
    icon: SunCloudAngledZap01Icon,
    labelKey: "about.weatherSensitivity.tip.transition",
    tone: "teal",
  },
];

function TipCard({
  icon: Icon,
  labelKey,
  tone,
}: {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
  labelKey: TranslationKey;
  tone: "sky" | "indigo" | "amber" | "teal";
}) {
  const { t } = useLanguage();
  const toneClass = {
    sky: {
      ring: "ring-sky-500/25",
      bg: "bg-sky-500/10",
      text: "text-sky-600 dark:text-sky-300",
    },
    indigo: {
      ring: "ring-indigo-500/25",
      bg: "bg-indigo-500/10",
      text: "text-indigo-600 dark:text-indigo-300",
    },
    amber: {
      ring: "ring-amber-500/25",
      bg: "bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-300",
    },
    teal: {
      ring: "ring-teal-500/25",
      bg: "bg-teal-500/10",
      text: "text-teal-600 dark:text-teal-300",
    },
  }[tone];

  return (
    <ScrollReveal>
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border border-border/60 bg-white/70 p-3 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sky-500/10 dark:bg-slate-900/55",
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
            icon={Icon}
            className={cn("h-4 w-4", toneClass.text)}
            aria-hidden="true"
          />
        </div>
        <p className="text-sm font-medium text-foreground">
          <BdiText text={t(labelKey)} />
        </p>
      </div>
    </ScrollReveal>
  );
}

/**
 * An educational card explaining how weather — summer heat, winter cold,
 * and rapid temperature/barometric swings — can trigger fibromyalgia
 * flares, with practical patient tips and a full-width banner photo.
 */
export function WeatherSensitivitySection({
  titleKey,
  eyebrowKey,
  introKey,
  image,
}: WeatherSensitivitySectionProps) {
  const { t } = useLanguage();

  return (
    <ScrollReveal as="section">
      <DepthCard tilt={2} delay={0}>
        <SpotlightCard className="group relative !overflow-hidden !pb-0 -mb-2 rounded-3xl border border-sky-500/25 bg-gradient-to-br from-sky-50/70 via-indigo-50/60 to-teal-50/60 shadow-xl shadow-sky-950/15 backdrop-blur-xl dark:from-sky-950/30 dark:via-slate-900/60 dark:to-indigo-950/30">
          {/* Decorative blobs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -end-20 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -start-16 h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-500/10"
          />

          <CardContent className="relative grid gap-6 p-5 pb-3 sm:p-7 sm:pb-4 lg:grid-cols-[1.15fr_1fr]">
            {/* Left: eyebrow + title + medical explanation */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
                <HugeiconsIcon
                  icon={SunCloud01Icon}
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
                {t(eyebrowKey)}
              </div>
              <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                <BdiText text={t(titleKey)} />
              </h3>
              <p className="text-sm leading-relaxed text-foreground/80">
                <BdiText text={t(introKey)} />
              </p>
            </div>

            {/* Right: practical weather tips, filling the column height */}
            <div className="flex flex-col gap-3 lg:h-full">
              <div className="grid grow gap-2 sm:grid-cols-2 lg:content-center">
                {TIPS.map((tip) => (
                  <TipCard
                    key={tip.labelKey}
                    icon={tip.icon}
                    labelKey={tip.labelKey}
                    tone={tip.tone}
                  />
                ))}
              </div>
            </div>
          </CardContent>

          {/* Full-width weather banner photo */}
          {image && (
            <div className="relative border-t border-sky-500/15 bg-white/30 px-5 pb-5 pt-4 sm:px-7 dark:bg-slate-950/25">
              <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-sky-500/20 shadow-sm">
                <img
                  src={image}
                  alt={t(titleKey)}
                  className="h-full w-full object-contain"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-sky-950/25 via-transparent to-transparent"
                />
              </div>
            </div>
          )}
        </SpotlightCard>
      </DepthCard>
    </ScrollReveal>
  );
}