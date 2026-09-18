"use client";

/**
 * Dietary & Personal Flare Trigger Tracker.
 *
 *  · MealLogger   — log meals with real-time smart warnings + timing nudge.
 *  · PersonalTriggerList — the patient's own trigger foods (severity + note).
 *  · FlareCorrelationPanel — evening meals vs. next-morning symptom patterns.
 */

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { HeartIcon, SaladIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { useLanguage } from "@/context/LanguageContext";
import GlobalNavHeader from "@/components/layout/GlobalNavHeader";
import { MealLogger } from "@/components/diet/MealLogger";
import { PersonalTriggerList } from "@/components/diet/PersonalTriggerList";
import { FlareCorrelationPanel } from "@/components/diet/FlareCorrelationPanel";
import { PantryMealHelper } from "@/components/diet/PantryMealHelper";

export default function DietPage() {
  const { t } = useLanguage();

  return (
    <RouteTransition>
      <div className="min-h-[100dvh] bg-background text-foreground transition-colors duration-500">
        <GlobalNavHeader />

        {/* pb-32 sm:pb-40 keeps the last section clear of the floating
            bottom chrome (SOS FAB + PWA install prompt) on every viewport
            height, including iOS safe-area insets. */}
        <main className="pb-32 sm:pb-40 pt-[calc(env(safe-area-inset-top)+5rem)] px-4 sm:px-6 sm:pt-[calc(env(safe-area-inset-top)+6rem)] lg:px-8 max-w-5xl mx-auto space-y-8">
          {/* Page header */}
          <ScrollReveal as="section" className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="icon-badge h-11 w-11 rounded-xl">
                <HugeiconsIcon icon={HeartIcon} className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  {t("diet.title")}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("diet.subtitle")}</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Logger + trigger list */}
          <section aria-label={t("diet.logger.title")} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DepthCard delay={0.05} className="lg:col-span-2">
              <Card className="h-full border border-zinc-200/80 dark:border-white/5 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl">
                <CardHeader className="border-b border-zinc-200/80 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 backdrop-blur-sm">
                      <HugeiconsIcon icon={SaladIcon} className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-zinc-900 dark:text-white font-semibold">
                        {t("diet.logger.title")}
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm text-muted-foreground">
                        {t("diet.logger.subtitle")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 p-5 sm:p-6">
                  <MealLogger />
                </CardContent>
              </Card>
            </DepthCard>

            <DepthCard delay={0.1}>
              <Card className="h-full border border-zinc-200/80 dark:border-white/5 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl">
                <CardHeader className="border-b border-zinc-200/80 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 backdrop-blur-sm">
                      <HugeiconsIcon icon={HeartIcon} className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-zinc-900 dark:text-white font-semibold">
                        {t("diet.triggers.title")}
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm text-muted-foreground">
                        {t("diet.triggers.subtitle")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 sm:p-6">
                  <PersonalTriggerList />
                </CardContent>
              </Card>
            </DepthCard>
          </section>

          {/* Flare correlation */}
          <section aria-label={t("diet.correlation.title")}>
            <DepthCard delay={0.15}>
              <Card className="h-full border border-zinc-200/80 dark:border-white/5 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl">
                <CardContent className="p-5 sm:p-6">
                  <FlareCorrelationPanel />
                </CardContent>
              </Card>
            </DepthCard>
          </section>

          {/* One-click pantry meals — anti-inflammatory, 5-minute ideas */}
          <section aria-label={t("pantry.title")}>
            <DepthCard delay={0.2}>
              <Card className="h-full border border-zinc-200/80 dark:border-white/5 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl">
                <CardContent className="p-5 sm:p-6">
                  <PantryMealHelper />
                </CardContent>
              </Card>
            </DepthCard>
          </section>
        </main>
      </div>
    </RouteTransition>
  );
}