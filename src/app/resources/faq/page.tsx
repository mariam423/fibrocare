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
    <div>
      <AppHeader backHref="/resources" backLabel={t("nav.backToDashboard")} />
      {/* pb-20 keeps the last accordion item clear of the fixed PWA
          install banner on mobile viewports. */}
      <main className="container mx-auto max-w-4xl p-4 pt-[calc(env(safe-area-inset-top)+5rem)] sm:p-6 sm:pt-[calc(env(safe-area-inset-top)+6rem)] lg:p-8 pb-20">
        <FAQAccordion />
      </main>
    </div>
    </RouteTransition>
  );
}
