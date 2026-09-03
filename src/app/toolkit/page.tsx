"use client";

/**
 * Advanced Care Toolkit — the home of the five advanced modules.
 * A separate route so no existing dashboard layout or state is touched.
 */

import React from "react";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import AppHeader from "@/components/layout/AppHeader";
import { MedicationSafetyCard } from "@/components/medications/MedicationSafetyCard";
import { SomaticToolkitCard } from "@/components/somatic/SomaticToolkitCard";
import { SleepHrvCard } from "@/components/sleep/SleepHrvCard";
import { CommunityInsightsCard } from "@/components/community/CommunityInsightsCard";
import { AiRescueCard } from "@/components/toolkit/AiRescueCard";
import { useLanguage } from "@/context/LanguageContext";

export default function ToolkitPage() {
  const { t } = useLanguage();

  return (
    <RouteTransition>
      <div className="min-h-[100dvh] bg-background text-foreground transition-colors duration-500">
        <AppHeader backHref="/dashboard" backLabel={t("nav.backToDashboard")} />

        <main className="max-w-4xl mx-auto px-4 lg:px-8 pt-[calc(env(safe-area-inset-top)+5rem)] pb-10 space-y-6">
          <ScrollReveal as="section" className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t("toolkit.title")}</h1>
            <p className="text-lg text-muted-foreground">{t("toolkit.subtitle")}</p>
          </ScrollReveal>

          {/* Equal-width vertical stack: every card renders at 100% of the
              container width in the same single-column layout. No column
              spans — component state/props/logic are untouched. */}
          <div className="grid grid-cols-1 gap-6">
            <ScrollReveal delay={0.05}>
              <AiRescueCard />
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <SomaticToolkitCard />
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <SleepHrvCard />
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <MedicationSafetyCard />
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <CommunityInsightsCard />
            </ScrollReveal>
          </div>
        </main>
      </div>
    </RouteTransition>
  );
}
