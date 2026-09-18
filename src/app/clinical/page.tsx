"use client";

/**
 * Clinical Hub — the unified clinical dashboard.
 *
 * Mounts every clinical module on one responsive page, in the order a
 * patient uses them:
 *  1. Assessments & Trackers — ACR 2010/2016 self-assessment, medication
 *     schedule, flare triggers, lab results (the appointment kit).
 *  2. Therapeutic & Lifestyle (Phase 3) — low-impact exercise library,
 *     sleep-hygiene checklist, and the flare coping toolkit with the
 *     guided 4-7-8 breathing exercise.
 *  3. Weekly / Monthly Report (Phase 4) — aggregates the logs above into
 *     a doctor-ready summary.
 *
 * Layout mirrors the Advanced Care Toolkit page: a single max-w-4xl
 * column of full-width cards, so nothing fights the existing responsive
 * rules. Fully localized (EN/AR-RTL) via `useLanguage`.
 */

import React from "react";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import GlobalNavHeader from "@/components/layout/GlobalNavHeader";
import { AcrAssessment } from "@/components/clinical/AcrAssessment";
import { MedicationSupplementTracker } from "@/components/clinical/MedicationSupplementTracker";
import { FlareTriggersLog } from "@/components/clinical/FlareTriggersLog";
import { LabResultsTracker } from "@/components/clinical/LabResultsTracker";
import { ExerciseLibrary } from "@/components/clinical/ExerciseLibrary";
import { SleepHygieneGuide } from "@/components/clinical/SleepHygieneGuide";
import { FlareCopingToolkit } from "@/components/clinical/FlareCopingToolkit";
import { WeeklyMonthlyReport } from "@/components/clinical/WeeklyMonthlyReport";
import { useLanguage } from "@/context/LanguageContext";

export default function ClinicalHubPage() {
  const { t } = useLanguage();

  return (
    <RouteTransition>
      <div className="min-h-[100dvh] bg-background text-foreground transition-colors duration-500">
        <GlobalNavHeader />

        {/* pb-32 sm:pb-40 keeps the last report card clear of the floating
          bottom chrome (SOS FAB + PWA install prompt). */}
        <main className="max-w-4xl mx-auto px-4 lg:px-8 pt-[calc(env(safe-area-inset-top)+5rem)] pb-32 sm:pb-40 space-y-8">
          <ScrollReveal as="section" className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {t("clinical.hub.title")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("clinical.hub.subtitle")}
            </p>
          </ScrollReveal>

          {/* 1 — Assessments & Trackers (the appointment kit) */}
          <ScrollReveal as="section" className="space-y-2" delay={0.05}>
            <h2 className="text-2xl font-bold tracking-tight">
              {t("clinical.hub.trackersTitle")}
            </h2>
            <p className="text-muted-foreground">
              {t("clinical.hub.trackersSubtitle")}
            </p>
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

          {/* 2 — Therapeutic & Lifestyle (Phase 3) */}
          <ScrollReveal as="section" className="space-y-2" delay={0.05}>
            <h2 className="text-2xl font-bold tracking-tight">
              {t("clinical.hub.lifestyleTitle")}
            </h2>
            <p className="text-muted-foreground">
              {t("clinical.hub.lifestyleSubtitle")}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-6">
            <ScrollReveal delay={0.05}>
              <ExerciseLibrary />
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <SleepHygieneGuide />
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <FlareCopingToolkit />
            </ScrollReveal>
          </div>

          {/* 3 — Weekly / Monthly Report (Phase 4) */}
          <ScrollReveal as="section" className="space-y-2" delay={0.05}>
            <h2 className="text-2xl font-bold tracking-tight">
              {t("clinical.hub.reportTitle")}
            </h2>
            <p className="text-muted-foreground">
              {t("clinical.hub.reportSubtitle")}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <WeeklyMonthlyReport />
          </ScrollReveal>
        </main>
      </div>
    </RouteTransition>
  );
}
