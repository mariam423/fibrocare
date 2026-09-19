"use client";

/**
 * Clinical Hub — the unified clinical dashboard (Midnight Emerald edition).
 *
 * Page anatomy, in the order a patient actually uses it:
 *  1. Glass hero — the headings on a Midnight Emerald shell with the clinic
 *     artwork shown cleanly in a framed, responsive card beside the text.
 *  2. Quick-nav — a responsive 3-card grid (trackers / guidance / report)
 *     that deep-links to the anchored sections below.
 *  3. Anchored sections — Assessments & Trackers (the appointment kit),
 *     Therapeutic & Lifestyle, and the Weekly / Monthly Report.
 *  4. Print-only report — a hidden-in-screen, visible-on-paper layout that
 *     carries the report heading so `window.print()` (button inside
 *     WeeklyMonthlyReport) produces a doctor-ready document without the
 *     app chrome. The component itself marks its interactive bits
 *     `print:hidden`; here we hide the surrounding app shell from print.
 *
 * Fully localized (EN/AR-RTL) via `useLanguage`.
 */

import React from "react";
import Image from "next/image";
import {
  ChartColumnIcon,
  ClipboardListIcon,
  LeafIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
import type { TranslationKey } from "@/lib/translations";

const HUB_CARDS = [
  { anchor: "hub-trackers", icon: ChartColumnIcon, titleKey: "clinical.hub.card.trackersTitle", subKey: "clinical.hub.trackersSubtitle" },
  { anchor: "hub-guidance", icon: LeafIcon, titleKey: "clinical.hub.card.guidanceTitle", subKey: "clinical.hub.lifestyleSubtitle" },
  { anchor: "hub-report", icon: ClipboardListIcon, titleKey: "clinical.hub.card.reportTitle", subKey: "clinical.hub.reportSubtitle" },
] as const satisfies ReadonlyArray<{
  anchor: string;
  icon: typeof ChartColumnIcon | typeof LeafIcon | typeof ClipboardListIcon;
  titleKey: TranslationKey;
  subKey: TranslationKey;
}>;

export default function ClinicalHubPage() {
  const { t } = useLanguage();

  return (
    <RouteTransition>
      <div className="min-h-[100dvh] bg-background text-foreground transition-colors duration-500">
        {/* App chrome never prints — only the report surfaces do. */}
        <div className="print:hidden">
          <GlobalNavHeader />
        </div>

        {/* pb-32 sm:pb-40 keeps the last report card clear of the floating
          bottom chrome (SOS FAB + PWA install prompt). */}
        <main className="print:hidden mx-auto max-w-4xl px-4 lg:px-8 pt-[calc(env(safe-area-inset-top)+5rem)] pb-32 sm:pb-40 space-y-8">
          {/* 1 — Midnight Emerald hero with the clinic artwork framed beside it */}
          <ScrollReveal as="section">
            <div className="overflow-hidden rounded-2xl border border-emerald-500/15 bg-white/50 shadow-xl backdrop-blur-md dark:bg-zinc-900/40">
              <div className="grid grid-cols-1 items-center gap-6 p-5 sm:p-8 lg:grid-cols-[1fr_minmax(0,380px)]">
                <div className="space-y-3">
                  <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                    {t("clinical.hub.title")}
                  </h1>
                  <p className="max-w-prose text-sm text-muted-foreground sm:text-base">
                    {t("clinical.hub.subtitle")}
                  </p>
                </div>
                <figure className="rounded-2xl border border-emerald-500/15 bg-white/60 p-3 shadow-sm dark:bg-zinc-900/40">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl">
                    <Image
                      src="/images/clinic.png"
                      alt={t("clinical.hub.bannerAlt")}
                      fill
                      sizes="(max-width: 640px) 100vw, 420px"
                      className="object-cover"
                    />
                  </div>
                </figure>
              </div>
            </div>
          </ScrollReveal>

          {/* 2 — Quick-nav: responsive 3-card grid */}
          <nav aria-label={t("clinical.hub.title")}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {HUB_CARDS.map((card, i) => (
                <ScrollReveal key={card.anchor} delay={0.05 * (i + 1)}>
                  <a
                    href={`#${card.anchor}`}
                    className="group flex h-full flex-col gap-2 rounded-2xl border border-emerald-500/15 bg-white/60 p-4 shadow-sm backdrop-blur-md transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/5 dark:bg-zinc-900/40"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      <HugeiconsIcon icon={card.icon} className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {t(card.titleKey)}
                    </span>
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {t(card.subKey)}
                    </span>
                  </a>
                </ScrollReveal>
              ))}
            </div>
          </nav>

          {/* 3a — Assessments & Trackers (the appointment kit) */}
          <ScrollReveal
            as="section"
            id="hub-trackers"
            className="scroll-mt-[calc(env(safe-area-inset-top)+6rem)] space-y-2"
            delay={0.05}
          >
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

          {/* 3b — Therapeutic & Lifestyle (Phase 3) */}
          <ScrollReveal
            as="section"
            id="hub-guidance"
            className="scroll-mt-[calc(env(safe-area-inset-top)+6rem)] space-y-2"
            delay={0.05}
          >
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

          {/* 3c — Weekly / Monthly Report (Phase 4) */}
          <ScrollReveal
            as="section"
            id="hub-report"
            className="scroll-mt-[calc(env(safe-area-inset-top)+6rem)] space-y-2"
            delay={0.05}
          >
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

        {/* 4 — Print-only surface: the visible-on-paper document that
            `window.print()` produces. Hidden on screen, revealed on print.
            WeeklyMonthlyReport already marks its interactive controls
            `print:hidden`, so printing reveals the aggregate report itself. */}
        <section id="clinical-print-report" className="hidden print:block" aria-label={t("clinical.hub.reportTitle")}>
          <h1 className="text-xl font-bold">{t("clinical.hub.reportTitle")}</h1>
          <p className="mt-1 text-sm">{t("clinical.hub.reportSubtitle")}</p>
        </section>
      </div>
    </RouteTransition>
  );
}
