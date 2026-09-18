"use client";

/**
 * FogShieldView — the `/fog-shield` page body.
 *
 * Owns the shared `calm` state (0→1: how far the current fog has cleared).
 * As the patient works any grounding tool, the module reports a calm gain
 * and the hero's FogClearingSphere3D visibly condenses from a chaotic grey
 * cloud into a serene teal shell with a gold core. Stats (episode count +
 * average intensities) load through the locked-safe server action.
 */

import React, { useCallback, useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Shield01Icon, CloudIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/context/LanguageContext";
import { FogClearingSphere3D } from "@/components/ui/FogClearingSphere3D";
import { FogBreathReset } from "./FogBreathReset";
import { FogBrainDump } from "./FogBrainDump";
import { FogMicroTask } from "./FogMicroTask";
import { FogSosMode } from "./FogSosMode";
import { getFogStats, type FogStats } from "@/app/fog-shield/actions";

export function FogShieldView() {
  const { t, locale } = useLanguage();
  const [calm, setCalm] = useState(0);
  const [stats, setStats] = useState<FogStats | null>(null);

  useEffect(() => {
    let alive = true;
    void getFogStats().then((res) => {
      if (alive && res.success && res.data) setStats(res.data.stats);
    });
    return () => {
      alive = false;
    };
  }, []);

  const bump = useCallback((delta: number) => {
    setCalm((c) => Math.min(1, c + delta));
  }, []);

  const avgFmt = (v: number | null) => (v == null ? t("fog.hero.statNone") : v.toFixed(1));

  return (
    <>
      {/* ── Hero: the clearing sphere answers to every tool on the page. ── */}
      <ScrollReveal as="section" className="space-y-2">
        <DepthCard tilt={2}>
          <Card className="overflow-hidden border border-teal-500/15 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl">
            <CardContent className="grid grid-cols-1 items-center gap-4 p-5 sm:p-8 lg:grid-cols-[1fr_auto]">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
                  <HugeiconsIcon icon={Shield01Icon} className="h-4 w-4" aria-hidden="true" />
                  {t("fog.hero.kicker")}
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                  {t("fog.title")}
                </h1>
                <p className="max-w-prose text-muted-foreground">{t("fog.hero.subtitle")}</p>

                <p
                  className="text-sm font-medium text-teal-700 dark:text-teal-300"
                  aria-live="polite"
                >
                  {calm >= 1 ? t("fog.hero.clearGuide") : t("fog.hero.fogGuide")}
                </p>

                <dl className="flex flex-wrap gap-4 pt-1">
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("fog.hero.statEpisodes")}</dt>
                    <dd className="text-2xl font-bold tabular-nums">{stats?.count ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("fog.hero.statAvg")}</dt>
                    <dd className="text-2xl font-bold tabular-nums">
                      {stats ? avgFmt(stats.averageIntensity) : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("fog.hero.statRecent")}</dt>
                    <dd className="text-2xl font-bold tabular-nums">
                      {stats ? avgFmt(stats.recentAverage) : "—"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* The hero fog that actually lifts as you use the tools. */}
              <div className="mx-auto w-full max-w-[340px]">
                <FogClearingSphere3D calm={calm} className="h-[240px] sm:h-[280px]" />
              </div>
            </CardContent>
          </Card>
        </DepthCard>
      </ScrollReveal>

      {/* ── Grounding tools ── */}
      <section aria-label={t("fog.title")} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ScrollReveal delay={0.05}>
          <FogBreathReset onSettled={bump} />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <FogBrainDump onSettled={bump} />
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <FogMicroTask onSettled={bump} />
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <FogSosMode onSettled={bump} />
        </ScrollReveal>
      </section>

      {/* Privacy note */}
      <p className="flex items-center justify-center gap-2 pb-2 text-center text-xs text-muted-foreground">
        <HugeiconsIcon icon={CloudIcon} className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{t("fog.hero.privacy")}</span>
        <span dir={locale === "ar" ? "rtl" : "ltr"}>{t("fog.hero.privacyDetail")}</span>
      </p>
    </>
  );
}