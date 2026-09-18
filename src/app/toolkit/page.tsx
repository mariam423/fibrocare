"use client";

/**
 * Advanced Care Toolkit — the home of the five advanced modules.
 * A separate route so no existing dashboard layout or state is touched.
 */

import React from "react";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import GlobalNavHeader from "@/components/layout/GlobalNavHeader";
import { MedicationSafetyCard } from "@/components/medications/MedicationSafetyCard";
import { SomaticToolkitCard } from "@/components/somatic/SomaticToolkitCard";
import { SleepHrvCard } from "@/components/sleep/SleepHrvCard";
import { CommunityInsightsCard } from "@/components/community/CommunityInsightsCard";
import { AiRescueCard } from "@/components/toolkit/AiRescueCard";
import { AcrAssessment } from "@/components/clinical/AcrAssessment";
import { MedicationSupplementTracker } from "@/components/clinical/MedicationSupplementTracker";
import { FlareTriggersLog } from "@/components/clinical/FlareTriggersLog";
import { LabResultsTracker } from "@/components/clinical/LabResultsTracker";
import { FamilySupportCards } from "@/components/support/FamilySupportCards";
import { MovementReminder } from "@/components/support/MovementReminder";
import { FogToolkitCard } from "@/components/fog/FogToolkitCard";
import { useLanguage } from "@/context/LanguageContext";

export default function ToolkitPage() {
  const { t } = useLanguage();

  return (
    <RouteTransition>
      <div className="min-h-[100dvh] bg-background text-foreground transition-colors duration-500">
        <GlobalNavHeader />

        {/* pb-32 sm:pb-40 keeps the last toolkit card clear of the floating
          bottom chrome (SOS FAB + movement reminder + PWA install prompt). */}
        <main className="max-w-4xl mx-auto px-4 lg:px-8 pt-[calc(env(safe-area-inset-top)+5rem)] pb-32 sm:pb-40 space-y-6">
          <ScrollReveal as="section" className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t("toolkit.title")}</h1>
            <p className="text-lg text-muted-foreground">{t("toolkit.subtitle")}</p>
          </ScrollReveal>

          {/* Equal-width vertical stack: every card renders at 100% of the
              container width in the same single-column layout. No column
              spans — component state/props/logic are untouched. */}
          <div className="grid grid-cols-1 gap-6">
            <ScrollReveal delay={0.05}>
              <FogToolkitCard />
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <AiRescueCard />
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <SomaticToolkitCard />
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <SleepHrvCard />
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <MedicationSafetyCard />
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <CommunityInsightsCard />
            </ScrollReveal>
          </div>

          {/* Clinical Centre — self-assessments and trackers for the
              appointment kit: ACR screening, doses, flare triggers,
              and the classic "rule out overlap" bloodwork. */}
          <ScrollReveal as="section" className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">{t("toolkit.clinicalTitle")}</h2>
            <p className="text-muted-foreground">{t("toolkit.clinicalSubtitle")}</p>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-6">
            <ScrollReveal delay={0.05}>
              <AcrAssessment />
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <MedicationSupplementTracker />
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <FlareTriggersLog />
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <LabResultsTracker />
            </ScrollReveal>
          </div>

          {/* Daily-life support: pre-written family explainers + gentle
              micro-stretch reminders for long sessions. */}
          <ScrollReveal as="section" className="space-y-2" delay={0.25}>
            <h2 className="text-2xl font-bold tracking-tight">{t("support.title")}</h2>
            <p className="text-muted-foreground">{t("support.subtitle")}</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-6">
            <ScrollReveal delay={0.05}>
              <FamilySupportCards />
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <MovementReminder />
            </ScrollReveal>
          </div>
        </main>
      </div>
    </RouteTransition>
  );
}
