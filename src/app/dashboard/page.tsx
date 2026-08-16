"use client";
import { ChartAreaIcon } from "@hugeicons/core-free-icons";
import React, { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SmileIcon,
  FrownIcon,
  ZapIcon,
  Loading01Icon,
  FireIcon,
  HandHelpingIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/Magnetic";
import { WordReveal } from "@/components/ui/WordReveal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { WeeklyProgressChart } from "@/components/charts/WeeklyProgressChart";
import { CountUp } from "@/components/ui/CountUp";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { AiCareInsightCard } from "@/components/dashboard/AiCareInsightCard";
import { AiCompanion } from "@/components/ai/AiCompanion";
import { AiNarration } from "@/components/ai/AiNarration";
import { AiReflection } from "@/components/ai/AiReflection";
import { MedicalSummaryCard } from "@/components/dashboard/MedicalSummaryCard";
import { TodayContextWidget } from "@/components/dashboard/TodayContextWidget";
import { DailyQuoteWidget } from "@/components/dashboard/DailyQuoteWidget";
import { RecentLogsWidget } from "@/components/dashboard/RecentLogsWidget";
import { useHealth } from "@/context/HealthContext";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { localizeInsight } from "@/lib/insightLocalization";
import { QuickPresets, type Preset } from "@/components/logging/QuickPresets";
import { EmojiGrid } from "@/components/logging/EmojiGrid";
import { FluidSlider } from "@/components/logging/FluidSlider";
import { EmpatheticToast } from "@/components/ui/EmpatheticToast";
import { RecoveryPanel } from "@/components/support/RecoveryCards";
import FlareEmergencyMode from "@/components/dashboard/FlareEmergencyMode";
import AppHeader from "@/components/layout/AppHeader";
import { useDashboard } from "@/hooks/useDashboard";
import { useMotionEnabled } from "@/hooks/useMotionEnabled";
import type { PainTrendPoint } from "@/lib/types";
import { cn } from "@/lib/utils";

function getTimeGreeting(t: (key: TranslationKey, params?: Record<string, string | number>) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return t("dashboard.greeting.morning");
  if (hour < 17) return t("dashboard.greeting.afternoon");
  return t("dashboard.greeting.evening");
}

function getTodayLabel(locale: string): string {
  return new Date().toLocaleDateString(locale === "ar" ? "ar" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

const ENERGY_OPTIONS: Array<{
  label: string;
  tKey: TranslationKey;
  icon: React.ReactNode;
  active: string;
  dot: string;
}> = [
  {
    label: "Good Day",
    tKey: "dashboard.energy.goodDay",
    icon: <HugeiconsIcon icon={SmileIcon} className="w-5 h-5" aria-hidden="true" />,
    active:
      "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/25 shadow-[0_6px_16px_-6px_rgba(16,185,129,0.35)] dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/30",
    dot: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] dark:bg-emerald-400",
  },
  {
    label: "Low Energy",
    tKey: "dashboard.energy.lowEnergy",
    icon: <HugeiconsIcon icon={ZapIcon} className="w-5 h-5" aria-hidden="true" />,
    active:
      "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/25 shadow-[0_6px_16px_-6px_rgba(245,158,11,0.35)] dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/30",
    dot: "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.7)] dark:bg-amber-400",
  },
  {
    label: "Flare-up",
    tKey: "dashboard.energy.flareUp",
    icon: <HugeiconsIcon icon={FrownIcon} className="w-5 h-5" aria-hidden="true" />,
    active:
      "bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/25 shadow-[0_6px_16px_-6px_rgba(244,63,94,0.35)] dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/30",
    dot: "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.7)] dark:bg-rose-400",
  },
];

export default function Home() {
  const router = useRouter();
  const { setPainLevel, setTheme } = useHealth();
  const { t, locale } = useLanguage();
  const {
    userName,
    streak,
    weeklyTrend,
    insights,
    symptoms,
    painLevel,
    setPainLevel: setLocalPainLevel,
    mood,
    setMood,
    notes,
    setNotes,
    isSaving,
    showSuccess,
    showToast,
    setShowToast,
    logEntry,
    toggleSymptom,
    recentLogs,
  } = useDashboard();

  const [loggingPreset, setLoggingPreset] = useState<string | null>(null);

  const handlePresetSelect = async (preset: Preset) => {
    setLocalPainLevel([preset.painLevel]);
    setPainLevel(preset.painLevel);
    setMood(preset.label);
    setLoggingPreset(preset.label);
    try {
      await logEntry({
        painLevel: preset.painLevel,
        mood: preset.label,
        symptoms: preset.symptoms,
        notes: "",
      });
    } finally {
      setLoggingPreset(null);
    }
  };

  const handleSliderChange = (value: number[]) => {
    setLocalPainLevel(value);
    setPainLevel(value[0]);
  };

  // Gentle scroll parallax on the welcome header: the greeting drifts up
  // and softens as it leaves the viewport. Outputs are 0 at rest (SSR,
  // hydration and reduced-motion all render the origin).
  const motionEnabled = useMotionEnabled();
  const welcomeRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: welcomeRef,
    offset: ["start start", "end start"],
  });
  const welcomeY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, motionEnabled ? -36 : 0]
  );
  const welcomeOpacity = useTransform(
    scrollYProgress,
    [0, 0.75],
    [1, motionEnabled ? 0.45 : 1]
  );
  const welcomeYSpring = useSpring(welcomeY, { stiffness: 80, damping: 24 });

  // Weekly stats derived from the trend (used by the CountUp tiles).
  const { weeklyAvg, loggedDays, highestPain } = useMemo(() => {
    const filled = weeklyTrend.filter(
      (d): d is PainTrendPoint & { level: number } => d.level !== null
    );
    if (filled.length === 0) {
      return { weeklyAvg: 0, loggedDays: 0, highestPain: 0 };
    }
    const total = filled.reduce((sum, d) => sum + (d.level as number), 0);
    const max = Math.max(...filled.map((d) => d.level as number));
    return {
      weeklyAvg: Math.round((total / filled.length) * 10) / 10,
      loggedDays: filled.length,
      highestPain: max,
    };
  }, [weeklyTrend]);

  return (
    <RouteTransition>
    <div className="min-h-[100dvh] bg-background text-foreground transition-colors duration-500">
<AppHeader />
      <main id="main-content" className="container mx-auto max-w-6xl px-6 py-10 lg:px-12 lg:py-12 space-y-10 lg:space-y-12 sm:px-8 pt-20 pb-48 mb-20">
        {/* Welcome Section */}
        <motion.div ref={welcomeRef} style={{ y: welcomeYSpring, opacity: welcomeOpacity }}>
        <ScrollReveal as="section" className="space-y-1">
          <div className="flex flex-col gap-x-6 gap-y-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="min-w-0 flex-1">
              <WordReveal
                as="h1"
                text={`${getTimeGreeting(t)}, ${userName}`}
                className="text-3xl sm:text-4xl font-bold tracking-tight"
                amount={0.6}
              />
              <WordReveal
                as="p"
                text={`${getTodayLabel(locale)}. ${t("dashboard.todayMessage")}`}
                className="mt-1 text-lg text-muted-foreground"
                delay={0.08}
                amount={0.6}
              />
            </div>
            {streak > 0 && (
              <div
                className="flex shrink-0 items-center gap-2 self-start rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm sm:self-auto"
                aria-label={t("dashboard.streakAria", { count: streak })}
              >
                <HugeiconsIcon icon={FireIcon} className="h-4 w-4" aria-hidden="true" />
                <span>
                  <CountUp value={streak} duration={800} inView={false} />{" "}
                  {t("dashboard.streakDays")}
                </span>
              </div>
            )}
          </div>
        </ScrollReveal>
        </motion.div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Dynamic AI Care Insight */}
        <AiCareInsightCard
          painLevel={painLevel[0] ?? 3}
          weeklyTrend={weeklyTrend}
        />

        {/* AI narration: your patterns, in plain words */}
        <AiNarration />

        {/* Smart AI Medical Summary */}
        <MedicalSummaryCard />

        {/* Daily Check-in + right rail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full mb-8">
          <div id="daily-checkin" className="lg:col-span-2 scroll-mt-24">
            <DepthCard className="h-full" animateIn delay={0} hover={false}>
<Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {t("dashboard.checkin.title")}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {t("dashboard.checkin.subtitle")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Quick Presets */}
                  <div>
                    <QuickPresets
                      onSelect={handlePresetSelect}
                      isLogging={isSaving}
                      loggingPreset={loggingPreset}
                    />
                  </div>

                  {/* Pain Level */}
                  <section className="border-t border-border pt-8">
                    <FluidSlider
                      value={painLevel}
                      onValueChange={handleSliderChange}
                    />
                  </section>

                  {/* Energy & Mood */}
                  <div className="border-t border-border pt-8">
                    <fieldset className="border-0 p-0 m-0">
                      <legend className="text-lg font-medium mb-4">
                        {t("dashboard.energy.title")}
                      </legend>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {ENERGY_OPTIONS.map((item) => (
                          <Magnetic key={item.label} strength={0.14} tapScale={0.97} className="w-full">
                            <Button
                              variant="ghost"
                              onClick={() => setMood(item.label)}
                              aria-pressed={mood === item.label}
                              className={cn(
                                "relative w-full flex items-center justify-center gap-2.5 min-h-16 rounded-xl text-base transition-all duration-300 ease-out",
                                "active:scale-[0.97]",
                                mood === item.label
                                  ? cn(item.active, "font-semibold")
                                  : "text-muted-foreground border border-border bg-card/70 backdrop-blur-md hover:bg-card/90 hover:text-foreground hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-background/40 dark:backdrop-blur-xl dark:hover:border-emerald-400/30 dark:hover:bg-white/5 dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                              )}
                            >
                              {item.icon}
                              {t(item.tKey)}
                              {mood === item.label && (
                                <span
                                  className={cn(
                                    "absolute end-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full animate-pulse",
                                    item.dot
                                  )}
                                  aria-hidden="true"
                                />
                              )}
                            </Button>
                          </Magnetic>
                        ))}
                      </div>
                    </fieldset>
                  </div>

                  {/* Symptoms & Notes */}
                  <section className="border-t border-border pt-8 space-y-4">
                    <label htmlFor="notes" className="text-lg font-medium block">
                      {t("dashboard.symptoms.label")}
                    </label>
                    <EmojiGrid
                      selectedSymptoms={symptoms}
                      onToggle={toggleSymptom}
                    />
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t("dashboard.symptoms.placeholder")}
                      className="w-full p-4 rounded-xl border border-border bg-card/60 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary outline-none transition-all duration-300 dark:border-white/10 dark:bg-background/40 dark:backdrop-blur-xl dark:focus-visible:border-emerald-400/40"
                      rows={3}
                    />

                    {/* AI journal reflection on the note */}
                    <AiReflection note={notes} />
                  </section>

                  {/* Save */}
                  <div className="border-t border-border pt-8 space-y-4">
                    <Magnetic strength={0.12} tapScale={0.97}>
                      <Button
                        onClick={() => logEntry()}
                        disabled={isSaving}
                        className="w-full min-h-16 text-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98]"
                      >
                        {isSaving ? (
                          <>
                            <HugeiconsIcon icon={Loading01Icon} className="me-2 h-5 w-5 animate-spin" aria-hidden="true" />
                            {t("dashboard.save.saving")}
                          </>
                        ) : (
                          t("dashboard.save.submit")
                        )}
                      </Button>
                    </Magnetic>
                    {showSuccess && (
                      <p
                        role="status"
                        aria-live="polite"
                        className="text-center text-primary font-medium animate-in fade-in slide-in-from-top-2 duration-300"
                      >
                        &#10003; {t("dashboard.save.success")}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </DepthCard>
          </div>

          {/* Right rail */}
          <div className="lg:col-span-1 space-y-6">
            {/* Flare Emergency Mode toggle */}
            <FlareEmergencyMode />

            {/* Today's Context & Weather */}
            <TodayContextWidget />

            {/* Daily Quote / Affirmation */}
            <DailyQuoteWidget />

            {/* Recent Logs Summary */}
            <RecentLogsWidget logs={recentLogs.slice(0, 2)} />
          </div>
        </div>

        {/* Gentle Support - full-width recovery tools */}
        <ScrollReveal as="section" className="space-y-4" delay={0.05}>
          <div className="flex items-center gap-3">
            <div className="icon-badge h-9 w-9 rounded-xl">
              <HugeiconsIcon
                icon={HandHelpingIcon}
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>
            <div>
              <WordReveal
                as="h2"
                text={t("dashboard.support.title")}
                className="text-xl font-semibold tracking-tight"
                amount={0.5}
              />
              <WordReveal
                as="p"
                text={t("dashboard.support.subtitle")}
                className="text-sm text-muted-foreground"
                delay={0.05}
                amount={0.5}
              />
            </div>
          </div>
          <RecoveryPanel onZen={() => router.push("/zen")} />
        </ScrollReveal>

        {/* Weekly Progress + Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <DepthCard tilt={3} delay={0.05} className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 font-semibold">
                  <HugeiconsIcon icon={ChartAreaIcon} className="h-6 w-6 text-chart-1" aria-hidden="true" />
                  <CardTitle className="text-base">{t("dashboard.weekly.title")}</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  {t("dashboard.weekly.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Weekly stats: animated averages computed from the trend */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-border/60 bg-card/70 p-3 backdrop-blur-sm dark:border-white/10 dark:bg-background/40 dark:backdrop-blur-xl">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {t("dashboard.weekly.avgPain")}
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                      <CountUp value={weeklyAvg} decimals={1} duration={1000} />
                      <span className="ms-0.5 text-xs font-normal text-muted-foreground">{t("dashboard.weekly.scale")}</span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-card/70 p-3 backdrop-blur-sm dark:border-white/10 dark:bg-background/40 dark:backdrop-blur-xl">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {t("dashboard.weekly.daysLogged")}
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                      <CountUp value={loggedDays} duration={800} />
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-card/70 p-3 backdrop-blur-sm dark:border-white/10 dark:bg-background/40 dark:backdrop-blur-xl">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {t("dashboard.weekly.highest")}
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                      <CountUp value={highestPain} duration={900} />
                      <span className="ms-0.5 text-xs font-normal text-muted-foreground">{t("dashboard.weekly.scale")}</span>
                    </p>
                  </div>
                </div>
                <WeeklyProgressChart data={weeklyTrend} />
              </CardContent>
            </Card>
          </DepthCard>

          {/* AI Insights */}
          <DepthCard tilt={4} delay={0.1}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 font-semibold">
                  <HugeiconsIcon icon={ZapIcon} className="h-6 w-6" aria-hidden="true" />
                  <CardTitle className="text-base">{t("dashboard.insights.title")}</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  {t("dashboard.insights.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("dashboard.insights.empty")}
                  </p>
                ) : (
                  insights.slice(0, 3).map((insight) => {
                    const copy = localizeInsight(insight, locale, t);
                    return (
                      <div
                        key={insight.id}
                        className={cn(
                          "rounded-xl border p-3",
                          insight.severity === "critical" &&
                            "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900",
                          insight.severity === "warning" &&
                            "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900",
                          insight.severity === "info" &&
                            "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900"
                        )}
                      >
                        <p className="text-sm font-semibold">{copy.title}</p>
                        <p className="mt-1 text-xs opacity-80">{copy.message}</p>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </DepthCard>
        </div>
      </main>

      <AnimatePresence>
        {showToast && (
          <EmpatheticToast
            message={t("dashboard.toast.message")}
            onClose={() => setShowToast(false)}
            actions={[
              {
                label: t("dashboard.toast.calming"),
                onClick: () => {
                  setTheme("Sensitive");
                  setShowToast(false);
                },
              },
              {
                label: t("dashboard.toast.zen"),
                onClick: () => {
                  router.push("/zen");
                  setShowToast(false);
                },
              },
            ]}
          />
        )}
      </AnimatePresence>

      {/* Floating AI Care Companion */}
      <AiCompanion />
    </div>
    </RouteTransition>
  );
}
