"use client";

import React, { useMemo } from "react";
import {
  PillIcon,
  TreatmentIcon,
  RunningShoesIcon,
  Brain01Icon,
  Moon01Icon,
  HeartIcon,
} from "@hugeicons/core-free-icons";
import AppHeader from "@/components/layout/AppHeader";
import { RouteTransition } from "@/components/ui/RouteTransition";
import {
  ContentPageLayout,
  type ContentSection,
} from "@/components/resources/ContentPageLayout";
import { QuickAddToTracker } from "@/components/resources/QuickAddToTracker";
import { useLanguage } from "@/context/LanguageContext";
import {
  PAGE_TAKEAWAYS,
  groundingChunk,
  groundingTakeaway,
} from "@/lib/resources/engine";

export default function TreatmentPage() {
  const { t } = useLanguage();

  const takeaway = useMemo(
    () => ({
      bullets: PAGE_TAKEAWAYS.treatment.bullets,
      chunk: groundingTakeaway("treatment"),
    }),
    []
  );

  // Verified-source citations for each treatment area — retrieved through
  // the local RAG pipeline, null → unverified (safe offline fallback).
  const medicationChunk = useMemo(
    () => groundingChunk("medication-overview"),
    []
  );
  const exerciseChunk = useMemo(() => groundingChunk("exercise-protocols"), []);
  const stressChunk = useMemo(
    () => groundingChunk("complementary-approaches"),
    []
  );
  const sleepChunk = useMemo(() => groundingChunk("sleep-hygiene"), []);
  const pacingChunk = useMemo(() => groundingChunk("pacing-spoon-theory"), []);

  const sections: ContentSection[] = [
    {
      title: t("treatment.medications"),
      icon: PillIcon,
      content: t("treatment.medicationsContent"),
      plainContent: t("treatment.medicationsPlain"),
      chunk: medicationChunk,
      tags: ["treatment.tag.meds.1", "treatment.tag.meds.2"],
    },
    {
      title: t("treatment.therapy"),
      icon: TreatmentIcon,
      content: t("treatment.therapyContent"),
      plainContent: t("treatment.therapyPlain"),
      chunk: exerciseChunk,
      tags: ["treatment.tag.therapy.1", "treatment.tag.therapy.2"],
    },
    {
      title: t("treatment.exercise"),
      icon: RunningShoesIcon,
      content: t("treatment.exerciseContent"),
      plainContent: t("treatment.exercisePlain"),
      chunk: exerciseChunk,
      tags: ["treatment.tag.exercise.1", "treatment.tag.exercise.2"],
    },
    {
      title: t("treatment.stress"),
      icon: Brain01Icon,
      content: t("treatment.stressContent"),
      plainContent: t("treatment.stressPlain"),
      chunk: stressChunk,
      tags: ["treatment.tag.stress.1", "treatment.tag.stress.2"],
    },
    {
      title: t("treatment.sleep"),
      icon: Moon01Icon,
      content: t("treatment.sleepContent"),
      plainContent: t("treatment.sleepPlain"),
      chunk: sleepChunk,
      tags: ["treatment.tag.sleep.1", "treatment.tag.sleep.2"],
    },
    {
      title: t("treatment.selfCare"),
      icon: HeartIcon,
      content: t("treatment.selfCareContent"),
      plainContent: t("treatment.selfCarePlain"),
      chunk: pacingChunk,
      tags: ["treatment.tag.selfCare.1", "treatment.tag.selfCare.2"],
      action: <QuickAddToTracker />,
    },
  ];

  return (
    <RouteTransition>
    <div className="min-h-[100dvh]">
      <AppHeader backHref="/resources" backLabel={t("nav.backToDashboard")} />
      <main className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 pb-48 mb-20">
        <ContentPageLayout
          titleKey="treatment.title"
          subtitleKey="treatment.subtitle"
          icon={PillIcon}
          sections={sections}
          takeaway={takeaway}
        />
      </main>
    </div>
    </RouteTransition>
  );
}
