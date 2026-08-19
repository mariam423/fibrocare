"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  File01Icon,
  Download01Icon,
  Loading01Icon,
  Chart01Icon,
  FlameIcon,
  ClipboardListIcon,
  Alert01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { generateMedicalReport } from "@/lib/pdfGenerator";
import { getReportData } from "@/app/actions";
import type { Insight } from "@/lib/insightEngine";
import AppHeader from "@/components/layout/AppHeader";
import { SegmentedFilter, type SegmentedFilterOption } from "@/components/ui/SegmentedFilter";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { localizeInsight } from "@/lib/insightLocalization";
import { cn } from "@/lib/utils";

interface ReportSnapshot {
  userName: string;
  logs: { id: string; painLevel: number; moodTag: string; notes: string | null; loggedAt: string | Date }[];
  insights: Insight[];
  topSymptoms: string[];
  avgPain: number;
  flareUpDays: number;
}

const severityStyle: Record<Insight["severity"], string> = {
  critical: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900",
  warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900",
  info: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900",
};

const severityLabelKey: Record<Insight["severity"], TranslationKey> = {
  critical: "reports.severity.critical",
  warning: "reports.severity.warning",
  info: "reports.severity.info",
};

export default function ReportsPage() {
  const { t, locale } = useLanguage();
  const [snapshot, setSnapshot] = useState<ReportSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [insightFilter, setInsightFilter] = useState<string>("all");

  const insightFilters = useMemo<SegmentedFilterOption[]>(
    () => [
      { value: "all", label: t("reports.filter.all"), tone: "neutral" },
      { value: "critical", label: t("reports.severity.critical"), tone: "rose" },
      { value: "warning", label: t("reports.severity.warning"), tone: "amber" },
      { value: "info", label: t("reports.severity.info"), tone: "emerald" },
    ],
    [t]
  );

  const visibleInsights =
    insightFilter === "all"
      ? snapshot?.insights ?? []
      : (snapshot?.insights ?? []).filter(
          (insight) => insight.severity === insightFilter
        );

  useEffect(() => {
    let cancelled = false;
    getReportData()
      .then((data) => {
        if (cancelled || !data) return;
        setSnapshot({
          userName: data.user.name,
          logs: data.logs,
          insights: data.insights,
          topSymptoms: data.topSymptoms,
          avgPain: data.avgPain,
          flareUpDays: data.flareUpDays,
        });
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setHasError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleExport = async () => {
    if (!snapshot) return;
    setIsGenerating(true);
    try {
      const blob = await generateMedicalReport({
        userName: snapshot.userName,
        avgPain: snapshot.avgPain,
        flareUpDays: snapshot.flareUpDays,
        topSymptoms: snapshot.topSymptoms,
        insights: snapshot.insights,
        logs: snapshot.logs,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FibroCare-Report-${snapshot.userName}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert(t("reports.exportError"));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <RouteTransition>
    <div className="min-h-[100dvh] bg-background text-foreground transition-colors duration-500">
      <AppHeader backHref="/dashboard" backLabel={t("nav.backToDashboard")} />

      <main className="container mx-auto px-5 sm:px-8 lg:px-10 pt-24 pb-8 lg:pb-10 space-y-8 max-w-4xl">
        <ScrollReveal as="section" className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t("reports.pageTitle")}</h1>
          <p className="text-lg text-muted-foreground">
            {t("reports.pageSubtitle")}
          </p>
        </ScrollReveal>

        {isLoading && (
          <DepthCard animateIn delay={0}>
            <Card className="border-none shadow-depth-sm ring-1 ring-border">
              <CardContent className="flex items-center justify-center py-16 gap-3">
                <HugeiconsIcon icon={Loading01Icon} className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
                <p className="text-muted-foreground">{t("reports.loading")}</p>
              </CardContent>
            </Card>
          </DepthCard>
        )}

        {hasError && !isLoading && (
          <p role="alert" className="text-center text-red-600 font-medium">
            {t("reports.loadError")}
          </p>
        )}

        {!isLoading && snapshot && (
          <>
            {/* Preview stats */}
            <ScrollReveal as="section" delay={0.1} className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label={t("reports.snapshotAria")}>
              <DepthCard tilt={4} animateIn={false}>
              <Card className="border-none shadow-depth-sm ring-1 ring-border h-full">
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                    <HugeiconsIcon icon={Chart01Icon} className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{t("reports.stat.avgPain")}</p>
                    <p className="text-2xl font-bold">
                      {snapshot.avgPain.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">/ 10</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
              </DepthCard>
              <DepthCard tilt={4} animateIn={false}>
              <Card className="border-none shadow-depth-sm ring-1 ring-border h-full">
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                    <HugeiconsIcon icon={FlameIcon} className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{t("reports.stat.flareDays")}</p>
                    <p className="text-2xl font-bold">{snapshot.flareUpDays}</p>
                  </div>
                </CardContent>
              </Card>
              </DepthCard>
              <DepthCard tilt={4} animateIn={false}>
              <Card className="border-none shadow-depth-sm ring-1 ring-border h-full">
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                    <HugeiconsIcon icon={ClipboardListIcon} className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{t("reports.stat.topSymptoms")}</p>
                    <p className="text-sm font-semibold leading-snug">
                      {snapshot.topSymptoms.length > 0
                        ? snapshot.topSymptoms.join(locale === "ar" ? "، " : ", ")
                        : t("reports.stat.noneRecorded")}
                    </p>
                  </div>
                </CardContent>
              </Card>
              </DepthCard>
            </ScrollReveal>

            {/* Insights preview */}
            <ScrollReveal delay={0.2}>
            <DepthCard tilt={3} delay={0.05}>
            <Card className="border-none shadow-depth-sm ring-1 ring-border">
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <HugeiconsIcon icon={Alert01Icon} className="h-5 w-5 text-primary" aria-hidden="true" />
                    {t("medical.keyInsights")}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {snapshot.insights.length > 0
                      ? t("reports.insights.subtitle")
                      : t("reports.insights.empty")}
                  </CardDescription>
                </div>
                {snapshot.insights.length > 0 && (
                  <SegmentedFilter
                    options={insightFilters}
                    value={insightFilter}
                    onChange={setInsightFilter}
                    label={t("reports.insights.filterLabel")}
                    className="sm:max-w-md"
                  />
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {snapshot.insights.length === 0 ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{t("reports.insights.none")}</span>
                  </div>
                ) : visibleInsights.length === 0 ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      {t("reports.insights.noneFor", {
                        filter: t(severityLabelKey[insightFilter as Insight["severity"]]),
                      })}
                    </span>
                  </div>
                ) : (
                  visibleInsights.map((insight) => {
                    const copy = localizeInsight(insight, locale, t);
                    return (
                    <div
                      key={insight.id}
                      className={cn("rounded-xl border p-4", severityStyle[insight.severity])}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">{copy.title}</p>
                        <span className="shrink-0 text-[11px] font-medium">
                          {t(severityLabelKey[insight.severity])}
                        </span>
                      </div>
                      <p className="mt-1 text-sm opacity-80">{copy.message}</p>
                    </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
            </DepthCard>
            </ScrollReveal>

            {/* Download */}
            <ScrollReveal delay={0.3}>
            <DepthCard tilt={3} delay={0.1}>
            <Card className="border-none shadow-depth-sm ring-1 ring-border">
              <CardHeader className="text-center space-y-4">
                <div className="flex mx-auto h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                  <HugeiconsIcon icon={File01Icon} className="h-9 w-9 text-primary" aria-hidden="true" />
                </div>
                <CardTitle className="text-2xl">{t("reports.download.title")}</CardTitle>
                <CardDescription className="text-base">
                  {t("reports.download.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-8">
                <Button
                  onClick={handleExport}
                  disabled={isGenerating || snapshot.logs.length === 0}
                  className="px-8 min-h-16 text-lg bg-primary hover:bg-primary/90 rounded-xl"
                >
                  {isGenerating ? (
                    <>
                      <HugeiconsIcon icon={Loading01Icon} className="me-2 h-5 w-5 animate-spin" aria-hidden="true" />
                      {t("reports.download.generating")}
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={Download01Icon} className="me-2 h-5 w-5" aria-hidden="true" />
                      {t("reports.download.button")}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            </DepthCard>
            </ScrollReveal>
          </>
        )}
      </main>
    </div>
    </RouteTransition>
  );
}
