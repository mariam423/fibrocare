"use client";

import React, { useMemo } from "react";
import { Moon02Icon } from "@hugeicons/core-free-icons";
import AppHeader from "@/components/layout/AppHeader";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { ContentPageLayout } from "@/components/resources/ContentPageLayout";
import { HormonalCycleSection } from "@/components/resources/HormonalCycleSection";
import { useLanguage } from "@/context/LanguageContext";
import {
  PAGE_TAKEAWAYS,
  groundingTakeaway,
} from "@/lib/resources/engine";

/**
 * "الفيبروميالجي والدورة الشهرية" — dedicated knowledge-hub page on the
 * fibromyalgia ↔ menstrual-cycle link: mechanism, predictive forecasting,
 * and self-care. Follows the same structure as /resources/about: an
 * immersive visual section on top, long-form clinical detail (with the
 * foggy-mode toggle + verified citations) below.
 */
export default function CyclePage() {
  const { t } = useLanguage();

  const takeaway = useMemo(
    () => ({
      bullets: PAGE_TAKEAWAYS.cycle.bullets,
      chunk: groundingTakeaway("cycle"),
    }),
    []
  );

  // Long-form detail only — the correlation graphic renders once inside
  // HormonalCycleSection above, so it is deliberately omitted here.
  const sections = [
    {
      title: t("cycle.overview.title"),
      icon: Moon02Icon,
      content: t("cycle.overview.content"),
      plainContent: t("cycle.overview.plain"),
    },
    {
      title: t("cycle.tracking.title"),
      icon: Moon02Icon,
      content: t("cycle.tracking.content"),
      plainContent: t("cycle.tracking.plain"),
    },
  ];

  return (
    <RouteTransition>
      <div>
        <AppHeader backHref="/resources" backLabel={t("nav.backToDashboard")} />
        <main className="container mx-auto max-w-4xl space-y-5 p-4 pt-[calc(env(safe-area-inset-top)+5rem)] pb-24 sm:p-6 sm:pt-[calc(env(safe-area-inset-top)+6rem)] lg:p-8 mb-10">
          {/* 1. Immersive visual section: mechanism → forecast → self-care
                → correlation graphic → references */}
          <HormonalCycleSection
            titleKey="cycle.title"
            eyebrowKey="cycle.eyebrow"
            introKey="cycle.intro"
            mechanismTitleKey="cycle.mechanism.title"
            mechanismBodyKey="cycle.mechanism.body"
            forecastTitleKey="cycle.forecast.title"
            forecastBodyKey="cycle.forecast.body"
            image="/images/cycle-correlation.jpg"
          />

          {/* 2. Long-form clinical detail with foggy-mode + citations */}
          <ContentPageLayout
            titleKey="cycle.title"
            subtitleKey="cycle.subtitle"
            icon={Moon02Icon}
            sections={sections}
            takeaway={takeaway}
          />
        </main>
      </div>
    </RouteTransition>
  );
}
