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
    },
    {
      title: t("about.symptoms"),
      icon: Activity01Icon,
      content: t("about.symptomsDetail"),
      plainContent: t("about.symptomsPlain"),
    },
  ];

  return (
    <RouteTransition>
      <div className="min-h-[100dvh]">
        <AppHeader backHref="/resources" backLabel={t("nav.backToDashboard")} />
        <main className="container mx-auto max-w-4xl space-y-8 p-4 pb-48 sm:p-6 lg:p-8 mb-20">
          {/* 1. Immersive definition hero with medical illustration */}
          <DefinitionHeroCard
            titleKey="about.title"
            subtitleKey="about.subtitle"
            contentKey="about.overviewContent"
            illustration="/images/medical/brain-body.svg"
            illustrationAlt={t("about.visual.eyebrow")}
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
          />

          {/* 4. Gut–brain axis visual (IBS correlation) */}
          <GutBrainAxisSection
            titleKey="about.gutBrain.title"
            introKey="about.gutBrain.intro"
            detailKey="about.gutBrain.detail"
          />

          {/* 5. Long-form clinical detail with foggy-mode + citations */}
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
