"use client";

import React from "react";
import AppHeader from "@/components/layout/AppHeader";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { FAQAccordion } from "@/components/resources/FAQAccordion";
import { useLanguage } from "@/context/LanguageContext";

export default function FAQPage() {
  const { t } = useLanguage();

  return (
    <RouteTransition>
    <div className="min-h-[100dvh]">
      <AppHeader backHref="/resources" backLabel={t("nav.backToDashboard")} />
      <main id="main-content" className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <FAQAccordion />
      </main>
    </div>
    </RouteTransition>
  );
}
