"use client";

import React, { useMemo } from "react";
import {
  Search01Icon,
  StethoscopeIcon,
  ClipboardIcon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import AppHeader from "@/components/layout/AppHeader";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { ContentPageLayout } from "@/components/resources/ContentPageLayout";
import { DiagnosticReadinessChecker } from "@/components/resources/DiagnosticReadinessChecker";
import { useLanguage } from "@/context/LanguageContext";
import {
  PAGE_TAKEAWAYS,
  groundingChunk,
  groundingTakeaway,
} from "@/lib/resources/engine";

export default function DiagnosisPage() {
  const { t } = useLanguage();

  const takeaway = useMemo(
    () => ({
      bullets: PAGE_TAKEAWAYS.diagnosis.bullets,
      chunk: groundingTakeaway("diagnosis"),
    }),
    []
  );

  // Verified-source citations for the criteria (WPI/SSS) and blood-test
  // sections — retrieved through the local RAG pipeline, null → unverified.
  const criteriaChunk = useMemo(() => groundingChunk("acr-criteria-2010"), []);
  const testsChunk = useMemo(() => groundingChunk("diagnostic-blood-tests"), []);

  const sections = [
    {
      title: t("diagnosis.howDiagnosed"),
      icon: StethoscopeIcon,
      content: t("diagnosis.criteria"),
      plainContent: t("diagnosis.criteriaPlain"),
      chunk: criteriaChunk,
      highlights: [
        {
          label: t("diagnosis.criteria.wpi.label"),
          value: t("diagnosis.criteria.wpi.value"),
        },
        {
          label: t("diagnosis.criteria.sss.label"),
          value: t("diagnosis.criteria.sss.value"),
        },
        {
          label: t("diagnosis.criteria.duration.label"),
          value: t("diagnosis.criteria.duration.value"),
        },
        {
          label: t("diagnosis.criteria.exclusion.label"),
          value: t("diagnosis.criteria.exclusion.value"),
        },
      ],
    },
    {
      title: t("diagnosis.tests"),
      icon: ClipboardIcon,
      content: t("diagnosis.exams"),
      plainContent: t("diagnosis.examsPlain"),
      chunk: testsChunk,
      highlights: [
        {
          label: t("diagnosis.exam.cbc.label"),
          value: t("diagnosis.exam.cbc.value"),
        },
        {
          label: t("diagnosis.exam.esr.label"),
          value: t("diagnosis.exam.esr.value"),
        },
        {
          label: t("diagnosis.exam.thyroid.label"),
          value: t("diagnosis.exam.thyroid.value"),
        },
        {
          label: t("diagnosis.exam.vitaminD.label"),
          value: t("diagnosis.exam.vitaminD.value"),
        },
        {
          label: t("diagnosis.exam.rheumatoid.label"),
          value: t("diagnosis.exam.rheumatoid.value"),
        },
        {
          label: t("diagnosis.exam.sleep.label"),
          value: t("diagnosis.exam.sleep.value"),
        },
      ],
    },
    {
      title: t("diagnosis.specialist"),
      icon: UserMultipleIcon,
      content: t("diagnosis.specialistDetail"),
      plainContent: t("diagnosis.specialistPlain"),
      highlights: [
        t("diagnosis.specialistHighlight.1"),
        t("diagnosis.specialistHighlight.2"),
        t("diagnosis.specialistHighlight.3"),
      ],
    },
  ];

  return (
    <RouteTransition>
    <div className="min-h-[100dvh]">
      <AppHeader backHref="/resources" backLabel={t("nav.backToDashboard")} />
      <main className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 pb-48 mb-20 print:pb-0 print:mb-0">
        <ContentPageLayout
          titleKey="diagnosis.title"
          subtitleKey="diagnosis.subtitle"
          icon={Search01Icon}
          sections={sections}
          takeaway={takeaway}
        />
        <div className="mt-6">
          <DiagnosticReadinessChecker />
        </div>
      </main>
    </div>
    </RouteTransition>
  );
}
