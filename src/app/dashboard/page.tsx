"use client";
import { ChartAreaIcon } from "@hugeicons/core-free-icons";
import React, { useState, useMemo, useRef, useEffect, useSyncExternalStore } from "react";
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
  PlaySquareIcon,
  Stethoscope02Icon,
  Chatting01Icon,
  AiMagicIcon,
  ArrowRight01Icon,
  FlashIcon,
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
import Link from "next/link";
import { AiCareInsightCard } from "@/components/dashboard/AiCareInsightCard";
import { AiCompanion } from "@/components/ai/AiCompanion";
import { AiNarration } from "@/components/ai/AiNarration";
import { AiReflection } from "@/components/ai/AiReflection";
import { MedicalSummaryCard } from "@/components/dashboard/MedicalSummaryCard";
import { TodayContextWidget } from "@/components/dashboard/TodayContextWidget";
import { DailyQuoteWidget } from "@/components/dashboard/DailyQuoteWidget";
import { MotivationWidget } from "@/components/dashboard/MotivationWidget";
import { RecentLogsWidget } from "@/components/dashboard/RecentLogsWidget";
import { SpoonTrackerBento } from "@/components/dashboard/SpoonTrackerBento";
import { BodyMapBento } from "@/components/dashboard/BodyMapBento";
import { MedicationTrackerCard } from "@/components/dashboard/MedicationTrackerCard";
import { PostMealFatigueSection } from "@/components/dashboard/PostMealFatigueSection";
import { SymptomTracker } from "@/components/logging/SymptomTracker";
import { DoctorContentFeed } from "@/components/pro/DoctorContentFeed";
import { PatientAssistant } from "@/components/pro/PatientAssistant";
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
import { AiStatusBadge } from "@/components/ai/AiStatusBadge";
import { useDashboard } from "@/hooks/useDashboard";
import { useProFeature } from "@/hooks/useProFeature";
import { useMotionEnabled } from "@/hooks/useMotionEnabled";
import type { PainTrendPoint } from "@/lib/types";
import { cn } from "@/lib/utils";

function getTimeGreeting(t: (key: TranslationKey, params?: Record<string, string | number>) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return t("dashboard.greeting.morning");
  if (hour < 17) return t("dashboard.greeting.afternoon");
  return t("dashboard.greeting.evening");
}

/**
 * WordReveal lays each word out as its own inline-block, so under an RTL
 * page a Latin-script name ("Mariam Mahmoud") would read "Mahmoud Mariam".
 * Rendering the name as its own reveal with a script-aware base direction
 * keeps both "Mariam Mahmoud" and "مريم محمود" in natural order.
 */
const RTL_SCRIPT_RE = /[\u0590-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

function nameDirection(userName: string): "rtl" | "ltr" {
  return RTL_SCRIPT_RE.test(userName) ? "rtl" : "ltr";
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

  const { isPro } = useProFeature();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [loggingPreset, setLoggingPreset] = useState<string | null>(null);
  const [doctorPosts, setDoctorPosts] = useState<
    { id: string; title: string; content: string; tags: string; verifiedStatus: string; createdAt: Date | string; author: { id: string; name: string | null } }[]
  >([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    import("@/app/pro/actions").then(({ getDoctorPosts }) => {
      getDoctorPosts({ status: "verified", limit: 3 }).then((r) => {
        setDoctorPosts(r.success ? (r.data ?? []) : []);
        setLoadingPosts(false);
      });
    });
  }, []);

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
    <div className="min-h-[100dvh] overflow-x-hidden bg-background text-foreground transition-colors duration-500">
      <AppHeader />
      <main className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-12 pt-[calc(env(safe-area-inset-top)+5rem)] pb-28 sm:pt-[calc(env(safe-area-inset-top)+6rem)] sm:pb-32 lg:pt-32 space-y-8 lg:space-y-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Welcome Section */}
        <motion.div ref={welcomeRef} style={{ y: welcomeYSpring, opacity: welcomeOpacity }}>
        <ScrollReveal as="section" className="space-y-1">
          <div className="flex flex-col gap-x-6 gap-y-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                <WordReveal
                  as="span"
                  text={mounted ? `${getTimeGreeting(t)},` : `${t("dashboard.greeting.morning")},`}
                  amount={0.6}
                />{" "}
                <WordReveal
                  as="span"
                  dir={nameDirection(userName)}
                  text={userName}
                  className="inline-block [unicode-bidi:isolate]"
                  amount={0.6}
                  delay={0.1}
                />
              </h1>
              <WordReveal
                as="p"
                text={mounted ? `${getTodayLabel(locale)}. ${t("dashboard.todayMessage")}` : `${t("dashboard.todayMessage")}`}
                className="mt-1 text-lg text-slate-500 dark:text-emerald-200/70"
                delay={0.08}
                amount={0.6}
              />
            </div>
            {streak > 0 && (
              <div
                className="flex shrink-0 items-center gap-2 self-start rounded-full border border-emerald-600/20 dark:border-emerald-400/25 bg-emerald-600/10 dark:bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 backdrop-blur-sm sm:self-auto"
                aria-label={t("dashboard.streakAria", { count: streak })}
              >
                <HugeiconsIcon icon={FireIcon} className="h-4 w-4" aria-hidden="true" />
                <span>
                  <CountUp value={streak} duration={800} inView={false} />{" "}
                  {t("dashboard.streakDays")}
                </span>
              </div>
            )}
            <div className="shrink-0 self-start sm:self-auto">
              <AiStatusBadge />
            </div>
          </div>
        </ScrollReveal>
        </motion.div>

        {/* ── Today ──────────────────────────────────── */}
        <ScrollReveal as="section" className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-emerald-300/80">
            {t("dashboard.section.today")}
          </h2>
        </ScrollReveal>

        {/* Quick Actions */}
        <QuickActions />


        {/* Dynamic AI Care Insight */}
        <AiCareInsightCard
          painLevel={painLevel[0] ?? 3}
          weeklyTrend={weeklyTrend}
        />




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
                                  : "text-muted-foreground border border-border bg-muted/60 backdrop-blur-md hover:bg-muted hover:text-foreground hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
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
                      className="w-full p-4 rounded-xl border border-border bg-muted/60 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 backdrop-blur-md"
                      rows={3}
                    />

                    {/* AI journal reflection on the note */}
                    <AiReflection note={notes} />
                  </section>

                  {/* Post-Meal Fatigue Tracking */}
                  <PostMealFatigueSection />

                  {/* Comprehensive Symptom Checklist */}
                  <SymptomTracker patientName={userName} />

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

            {/* Dynamic bilingual spiritual motivation */}
            <MotivationWidget />

            {/* Recent Logs Summary */}
            <RecentLogsWidget logs={recentLogs.slice(0, 2)} />

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
                              "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-200",
                            insight.severity === "warning" &&
                              "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200",
                            insight.severity === "info" &&
                              "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-200"
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
        </div>

        {/* ── Core Tools ─────────────────────────────── */}
        <ScrollReveal as="section" className="space-y-5 pt-2">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-emerald-300/80">
            {t("dashboard.section.core")}
          </h2>
        </ScrollReveal>

          <Link
            href="/toolkit"
            className="group block rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-5 transition-all hover:border-primary/50 hover:shadow-[0_0_28px_rgba(45,212,191,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15">
                  <HugeiconsIcon icon={PlaySquareIcon} className="h-5 w-5 text-primary" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">
                    {t("dashboard.toolkitCard.title")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("dashboard.toolkitCard.desc")}
                  </p>
                </div>
              </div>
              <span className="rounded-xl bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-sm font-bold text-white dark:text-slate-950 shadow-md dark:shadow-lg shadow-emerald-900/10 dark:shadow-emerald-500/20 transition-transform group-hover:-translate-y-0.5">
                {t("dashboard.toolkitCard.cta")}
              </span>
            </div>
          </Link>

        {/* Middle Row: Daily Energy, Pain Map, Medications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch w-full">
          <div className="min-h-0">
            <DepthCard className="h-full" delay={0} animateIn hover={false}>
              <Card className="h-full">
                <CardContent className="flex flex-1 flex-col p-0">
                  <SpoonTrackerBento />
                </CardContent>
              </Card>
            </DepthCard>
          </div>
          <div className="min-h-0">
            <DepthCard className="h-full" delay={0.05} animateIn hover={false}>
              <Card className="h-full">
                <CardContent className="flex flex-1 flex-col p-0">
                  <BodyMapBento />
                </CardContent>
              </Card>
            </DepthCard>
          </div>
          <div className="min-h-0">
            <DepthCard className="h-full" delay={0.1} animateIn hover={false}>
              <Card className="h-full">
                <CardContent className="flex flex-1 flex-col p-0">
                  <MedicationTrackerCard />
                </CardContent>
              </Card>
            </DepthCard>
          </div>
        </div>

        {/* ── Pro: Doctors & Consultations ─────────────── */}
        <ScrollReveal as="section" className="space-y-5 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-emerald-300/80">
                {t("dashboard.pro.title")}
              </h2>
              {!isPro && (
                <Link
                  href="/pro"
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-600/30 dark:border-emerald-400/40 bg-emerald-600/10 dark:bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 transition-colors hover:bg-emerald-600/20 dark:hover:bg-emerald-500/25"
                >
                  <HugeiconsIcon icon={FlashIcon} className="h-2.5 w-2.5" aria-hidden="true" />
                  {t("dashboard.pro.badgeText")}
                </Link>
              )}
            </div>
            <Link
              href="/pro"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline"
            >
              {t("dashboard.pro.viewAll")}
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        </ScrollReveal>

        {/* Quick-action buttons */}
        <ScrollReveal delay={0.05}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/pro/doctor" className="group block">
              <Card className="h-full transition-colors group-hover:bg-muted/50">
                <CardContent className="flex items-center gap-4 py-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-950/10">
                    <img
                      src="/images/الطبيب.jpg"
                      alt="Doctor Hub"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight">{t("dashboard.pro.browseDoctors")}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-emerald-200/70 line-clamp-1">{t("dashboard.pro.subtitle")}</p>
                  </div>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 shrink-0 text-slate-400 dark:text-emerald-200/50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" aria-hidden="true" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/pro/consultations" className="group block">
              <Card className="h-full transition-colors group-hover:bg-muted/50">
                <CardContent className="flex items-center gap-4 py-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-950/10">
                    <img
                      src="/images/الاستشارات .jpg"
                      alt="Consultations"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight">{t("dashboard.pro.startConsultation")}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-emerald-200/70 line-clamp-1">{t("consultation.symptomHelperDescription")}</p>
                  </div>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 shrink-0 text-slate-400 dark:text-emerald-200/50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" aria-hidden="true" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Doctor Feed preview */}
          <ScrollReveal delay={0.05}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    <HugeiconsIcon icon={Stethoscope02Icon} className="h-5 w-5 text-primary" aria-hidden="true" />
                    <CardTitle className="text-base">{t("dashboard.pro.doctorFeed")}</CardTitle>
                  </div>
                  <Link
                    href="/pro/doctor"
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline"
                  >
                    {t("dashboard.pro.viewAll")}
                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
                <CardDescription className="text-xs">
                  {t("dashboard.pro.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPosts ? (
                  <div className="flex items-center justify-center py-8">
                    <HugeiconsIcon icon={Loading01Icon} className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : doctorPosts.length > 0 ? (
                  <div className="space-y-3">
                    {doctorPosts.map((post) => (
                      <Link key={post.id} href="/pro/doctor" className="block group">
                        <div className="rounded-xl border border-border p-3 transition-colors group-hover:bg-muted/50">
                          <p className="text-sm font-medium line-clamp-1">{post.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{post.content}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground">{post.author.name ?? "Doctor"}</span>
                            {post.tags && (
                              <span className="text-[10px] rounded-full bg-primary/10 px-1.5 py-0.5 text-primary font-medium">
                                {post.tags.split(",")[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">{t("doctor.noPosts")}</p>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* AI Symptom Helper preview */}
          <ScrollReveal delay={0.1}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    <HugeiconsIcon icon={AiMagicIcon} className="h-5 w-5 text-primary" aria-hidden="true" />
                    <CardTitle className="text-base">{t("dashboard.pro.symptomHelper")}</CardTitle>
                  </div>
                  <Link
                    href="/pro/consultations"
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline"
                  >
                    {t("dashboard.pro.viewAll")}
                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
                <CardDescription className="text-xs">
                  {t("consultation.symptomHelperDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PatientAssistant
                  consultationId=""
                  onStructured={() => {
                    router.push("/pro/consultations/new");
                  }}
                />
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Gentle Support - full-width recovery tools */}
        <ScrollReveal as="section" className="space-y-4 overflow-visible" delay={0.05}>
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

        {/* ── Insights & Gentle Support ─────────────── */}
        <ScrollReveal as="section" className="space-y-5 pt-2">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-emerald-300/80">
            {t("dashboard.section.insights")}
          </h2>
        </ScrollReveal>

        {/* AI narration: your patterns, in plain words */}
        <AiNarration />
        {/* Smart AI Medical Summary */}
        <MedicalSummaryCard />

        {/* Weekly Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <DepthCard tilt={3} delay={0.05} className="lg:col-span-3">
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
                  <div className="rounded-2xl border border-border bg-muted/60 p-3 backdrop-blur-md">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {t("dashboard.weekly.avgPain")}
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                      <bdi><CountUp value={weeklyAvg} decimals={1} duration={1000} /></bdi>
                      <span className="ms-0.5 text-xs font-normal text-muted-foreground">{t("dashboard.weekly.scale")}</span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/60 p-3 backdrop-blur-md">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {t("dashboard.weekly.daysLogged")}
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                      <bdi><CountUp value={loggedDays} duration={800} /></bdi>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/60 p-3 backdrop-blur-md">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {t("dashboard.weekly.highest")}
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                      <bdi><CountUp value={highestPain} duration={900} /></bdi>
                      <span className="ms-0.5 text-xs font-normal text-muted-foreground">{t("dashboard.weekly.scale")}</span>
                    </p>
                  </div>
                </div>
                <WeeklyProgressChart data={weeklyTrend} />
              </CardContent>
            </Card>
          </DepthCard>
        </div>

        {/* Recent Logs - full activity list */}
        <RecentLogsWidget logs={recentLogs} columns={3} />
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
