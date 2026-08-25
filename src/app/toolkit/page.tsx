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

        <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-24 pb-10 space-y-8">
          <ScrollReveal as="section" className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t("toolkit.title")}</h1>
            <p className="text-lg text-muted-foreground">{t("toolkit.subtitle")}</p>
          </ScrollReveal>

          {/* Balanced Bento grid: the AI rescue banner spans the full row,
              then the video/controls-heavy Somatic card pairs with the
              compact Sleep card (2+1), and Medication pairs with the
              Community insights card (1+2) — every row fills all three
              columns with no squishing or trailing empty cells. */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ScrollReveal delay={0.05} className="col-span-full">
              <AiRescueCard />
            </ScrollReveal>
            <ScrollReveal delay={0.1} className="lg:col-span-2">
              <SomaticToolkitCard />
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <SleepHrvCard />
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <MedicationSafetyCard />
            </ScrollReveal>
            <ScrollReveal delay={0.25} className="lg:col-span-2">
              <CommunityInsightsCard />
            </ScrollReveal>
          </div>
        </main>
      </div>
    </RouteTransition>
  );
}
