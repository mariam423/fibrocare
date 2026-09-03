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
      image: "/images/%D9%83%D9%8A%D9%81%20%D9%8A%D8%AA%D9%85%20%D8%AA%D8%B4%D8%AE%D9%8A%D8%B5%20%D8%A7%D9%84%D8%AA%D9%87%D8%A7%D8%A8%20%D8%A7%D9%84%D8%B9%D8%B6%D9%84%D8%A7%D8%AA%20%D8%A7%D9%84%D9%84%D9%8A%D9%81%D9%8A%D8%A9%D8%9F.jpg",
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
      image: "/images/%D8%A7%D9%84%D8%A7%D8%AE%D8%AA%D8%A8%D8%A7%D8%B1%D8%A7%D8%AA%20%D9%88%D8%A7%D9%84%D8%AA%D9%82%D9%8A%D9%8A%D9%85%D8%A7%D8%AA.jpg",
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
      image: "/images/متي تري اخصائي؟.webp",
      imageFit: "contain" as const,
      standaloneImage: true,
      highlights: [
        t("diagnosis.specialistHighlight.1"),
        t("diagnosis.specialistHighlight.2"),
        t("diagnosis.specialistHighlight.3"),
      ],
    },
  ];

  return (
    <RouteTransition>
    <div>
      <AppHeader backHref="/resources" backLabel={t("nav.backToDashboard")} />
      <main className="container mx-auto max-w-4xl p-4 pt-[calc(env(safe-area-inset-top)+5rem)] sm:p-6 sm:pt-[calc(env(safe-area-inset-top)+6rem)] lg:p-8 pb-24 mb-10 print:pb-0 print:mb-0">
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
