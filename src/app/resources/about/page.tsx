"use client";

import React, { useMemo } from "react";
import {
  Activity01Icon,
  BrainIcon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import AppHeader from "@/components/layout/AppHeader";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { ContentPageLayout } from "@/components/resources/ContentPageLayout";
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

  const sections = [
    {
      title: t("about.overview"),
      icon: Activity01Icon,
      content: t("about.overviewContent"),
      plainContent: t("about.overviewPlain"),
      highlights: [
        {
          label: t("about.highlight.prevalence.label"),
          value: t("about.highlight.prevalence.value"),
        },
        {
          label: t("about.highlight.pain.label"),
          value: t("about.highlight.pain.value"),
        },
        {
          label: t("about.highlight.management.label"),
          value: t("about.highlight.management.value"),
        },
      ],
    },
    {
      title: t("about.causes"),
      icon: AlertCircleIcon,
      content: t("about.causesDetail"),
      plainContent: t("about.causesPlain"),
    },
    {
      title: t("about.symptoms"),
      icon: BrainIcon,
      content: t("about.symptomsDetail"),
      plainContent: t("about.symptomsPlain"),
      highlights: [
        {
          label: t("about.symptom.pain.label"),
          value: t("about.symptom.pain.value"),
        },
        {
          label: t("about.symptom.fatigue.label"),
          value: t("about.symptom.fatigue.value"),
        },
        {
          label: t("about.symptom.fog.label"),
          value: t("about.symptom.fog.value"),
        },
        {
          label: t("about.symptom.sleep.label"),
          value: t("about.symptom.sleep.value"),
        },
      ],
    },
  ];

  return (
    <RouteTransition>
    <div className="min-h-[100dvh]">
      <AppHeader backHref="/resources" backLabel={t("nav.backToDashboard")} />
      <main className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 pb-48 mb-20">
        <ContentPageLayout
          titleKey="about.title"
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
