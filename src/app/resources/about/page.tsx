"use client";

import React, { useMemo } from "react";
import {
  Activity01Icon,
} from "@hugeicons/core-free-icons";
import AppHeader from "@/components/layout/AppHeader";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { ContentPageLayout } from "@/components/resources/ContentPageLayout";
import {
  CausesGrid,
  DefinitionHeroCard,
  SymptomsGrid,
} from "@/components/resources/MedicalVisualSection";
import { GutBrainAxisSection } from "@/components/resources/GutBrainAxisSection";
import { WeatherSensitivitySection } from "@/components/resources/WeatherSensitivitySection";
import { useLanguage } from "@/context/LanguageContext";
import {
  PAGE_TAKEAWAYS,
  groundingTakeaway,
} from "@/lib/resources/engine";

export default function AboutPage() {
  const { t } = useLanguage();

  const takeaway = useMemo(
    () => ({
      bullets: PAGE_TAKEAWAYS.about.bullets,
      chunk: groundingTakeaway("about"),
    }),
    []
  );

  /**
   * The plain "sections" list kept for the legacy ContentPageLayout so
   * citation badges, foggy-mode toggle, and "Verified Source" continue to
   * work for the long-form clinical prose. The immersive visuals render
   * above and below this block.
   */
  const sections = [
    {
      title: t("about.overview"),
      icon: Activity01Icon,
      content: t("about.overviewContent"),
      plainContent: t("about.overviewPlain"),
      image: "/images/%D9%85%D8%A7%20%D9%87%D9%88%20%D8%A7%D9%84%D8%AA%D9%87%D8%A7%D8%A8%20%D8%A7%D9%84%D8%B9%D8%B6%D9%84%D8%A7%D8%AA%20%D8%A7%D9%84%D9%84%D9%8A%D9%81%D9%8A%D8%A9%D8%9F.jpg",
    },
    {
      title: t("about.symptoms"),
      icon: Activity01Icon,
      content: t("about.symptomsDetail"),
      plainContent: t("about.symptomsPlain"),
      image: "/images/%D9%84%D8%A3%D8%B9%D8%B1%D8%A7%D8%B6%20%D8%A7%D9%84%D8%B4%D8%A7%D8%A6%D8%B9%D8%A9.jpg",
    },
  ];

  return (
    <RouteTransition>
      <div>
        <AppHeader backHref="/resources" backLabel={t("nav.backToDashboard")} />
        <main className="container mx-auto max-w-4xl space-y-5 p-4 pt-[calc(env(safe-area-inset-top)+5rem)] pb-24 sm:p-6 sm:pt-[calc(env(safe-area-inset-top)+6rem)] lg:p-8 mb-10">
          {/* 1. Immersive definition hero with medical illustration */}
          <DefinitionHeroCard
            titleKey="about.title"
            subtitleKey="about.subtitle"
            contentKey="about.overviewContent"
            illustration="/images/medical/brain-body.svg"
            illustrationAlt={t("about.visual.eyebrow")}
            image="/images/resources/fibromyalgia-pain-points.png"
            highlights={[
              {
                labelKey: "about.highlight.prevalence.label",
                valueKey: "about.highlight.prevalence.value",
              },
              {
                labelKey: "about.highlight.pain.label",
                valueKey: "about.highlight.pain.value",
              },
              {
                labelKey: "about.highlight.management.label",
                valueKey: "about.highlight.management.value",
              },
            ]}
          />

          {/* 2. Visual causes grid */}
          <CausesGrid
            titleKey="about.causes"
            introKey="about.causesIntro"
          />

          {/* 3. Visual symptoms grid + body map illustration */}
          <SymptomsGrid
            titleKey="about.symptoms"
            introKey="about.symptomsIntro"
            illustration="/images/medical/trigger-points.svg"
            illustrationAlt={t("about.visual.symptoms.caption")}
            image="/images/%D9%84%D8%A3%D8%B9%D8%B1%D8%A7%D8%B6%20%D8%A7%D9%84%D8%B4%D8%A7%D8%A6%D8%B9%D8%A9.jpg"
          />

          {/* 4. Gut–brain axis visual (IBS correlation) */}
          <GutBrainAxisSection
            titleKey="about.gutBrain.title"
            introKey="about.gutBrain.intro"
            detailKey="about.gutBrain.detail"
            image="/images/%D8%A7%D9%84%D8%B5%D9%84%D8%A9%20%D8%A8%D9%8A%D9%86%20%D8%A7%D9%84%D8%A3%D9%85%D8%B9%D8%A7%D8%A1%20%D9%88%D8%A7%D9%84%D8%AF%D9%85%D8%A7%D8%BA.jpg"
          />

          {/* 5. Weather sensitivity & temperature changes */}
          <WeatherSensitivitySection
            titleKey="about.weatherSensitivity.title"
            eyebrowKey="about.weatherSensitivity.eyebrow"
            introKey="about.weatherSensitivity.intro"
            image="/images/الطقسs.jpg"
          />

          {/* 6. Long-form clinical detail with foggy-mode + citations */}
          <ContentPageLayout
            titleKey="about.overview"
            subtitleKey="about.subtitle"
            icon={Activity01Icon}
            sections={sections}
            takeaway={takeaway}
          />
        </main>
      </div>
    </RouteTransition>
  );
}
