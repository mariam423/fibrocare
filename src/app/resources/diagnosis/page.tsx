"use client";

import React from "react";
import {
  Search01Icon,
  StethoscopeIcon,
  ClipboardIcon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import AppHeader from "@/components/layout/AppHeader";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { ContentPageLayout } from "@/components/resources/ContentPageLayout";
import { useLanguage } from "@/context/LanguageContext";

export default function DiagnosisPage() {
  const { t, locale } = useLanguage();

  const sections = [
    {
      title: t("diagnosis.howDiagnosed"),
      icon: StethoscopeIcon,
      content: t("diagnosis.criteria"),
    },
    {
      title: t("diagnosis.tests"),
      icon: ClipboardIcon,
      content: t("diagnosis.exams"),
    },
    {
      title: t("diagnosis.specialist"),
      icon: UserMultipleIcon,
      content: t("diagnosis.specialist"),
      highlights: locale === "ar"
        ? ["استشر طبيب الروماتيزم إذا استمرت الأعراض", "احتفظ بسجل للأعراض", "اطلب تقييمًا من متخصص"]
        : ["See a rheumatologist if symptoms persist", "Keep a symptom diary", "Seek specialist evaluation"],
    },
  ];

  return (
    <RouteTransition>
    <div className="min-h-[100dvh]">
      <AppHeader backHref="/resources" backLabel={t("nav.backToDashboard")} />
      <main className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 pb-48 mb-20">
        <ContentPageLayout
          titleKey="diagnosis.title"
          subtitleKey="diagnosis.subtitle"
          icon={Search01Icon}
          sections={sections}
        />
      </main>
    </div>
    </RouteTransition>
  );
}
