"use client";

/**
 * WeeklyMonthlyReport — Phase 4: comprehensive period summary generator.
 *
 * Aggregates, for the chosen week/month window:
 *  - Pain logs (server action `getLatestLogs`) → avg / peak pain, flare
 *    days (≥7/10), logging adherence.
 *  - Flare triggers, lab results and the medication schedule (the
 *    Clinical Centre's local trackers) → top trigger by avg severity,
 *    out-of-range lab flags, scheduled meds.
 *  - The saved ACR 2010/2016 snapshot (`getClinicalAssessment`).
 *  - Cycle context (hormonal amplification share, from
 *    `getCycleDashboardData` — server-guarded).
 *
 * All aggregation runs through the unit-tested pure engine in
 * `src/lib/clinical/periodicReport.ts` (`buildPeriodStats`); this
 * component only fetches inputs and renders. Output is doctor-ready:
 * a stats strip, structured sections, and a one-tap "copy for my
 * doctor" text block.
 *
 * Security: every server action is session/PIN-guarded server-side and
 * fails soft (empty data) when locked or signed out — no raw log
 * contents are exposed beyond the aggregate view.
 */

import React, { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  ChartAverageIcon,
  CheckmarkCircle02Icon,
  ClipboardListIcon,
  Copy01Icon,
  PrinterIcon,
  FlameIcon,
  HealthIcon,
  Loading01Icon,
  Moon02Icon,
  PillIcon,
  TestTube01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/translations";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getLatestLogs, getClinicalAssessment, getCycleDashboardData } from "@/app/actions";
import {
  buildPeriodStats,
  type PeriodStats,
  type ReportPeriod,
} from "@/lib/clinical/periodicReport";
import {
  FLARE_FACTORS,
  LAB_FIELDS,
  type FlareTriggerEntry,
  type LabResult,
  type MedicationDose,
  type LabTestId,
} from "@/lib/clinical/trackers";
import type { AcrClinicalSummary } from "@/lib/clinical/acr";
import type { CycleDashboardData } from "@/app/actions";

const VERDICT_TONE: Record<"low" | "inRange" | "high", string> = {
  low: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  inRange: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  high: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

const VERDICT_KEYS: Record<"low" | "inRange" | "high", TranslationKey> = {
  low: "clinical.lab.verdict.low",
  inRange: "clinical.lab.verdict.inRange",
  high: "clinical.lab.verdict.high",
};

/** Local trigger factor id → localized label. */
function factorLabel(id: string, t: (k: TranslationKey) => string): string {
  const factor = FLARE_FACTORS.find((f) => f.id === id);
  return factor ? t(factor.labelTKey as TranslationKey) : id;
}

function labLabel(id: string, t: (k: TranslationKey) => string): string {
  const field = LAB_FIELDS.find((f) => f.id === (id as LabTestId));
  return field ? t(field.labelTKey as TranslationKey) : id;
}

export function WeeklyMonthlyReport() {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<ReportPeriod>("week");
  const [logs, setLogs] = useState<Array<{ loggedAt: string | Date; painLevel: number; moodTag: string }>>([]);
  const [acr, setAcr] = useState<AcrClinicalSummary | null>(null);
  const [cycle, setCycle] = useState<CycleDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Clinical Centre trackers persisted client-side.
  const [triggers] = useLocalStorage<FlareTriggerEntry[]>("fibrocare:clinical:triggers", []);
  const [labs] = useLocalStorage<LabResult[]>("fibrocare:clinical:labs", []);
  const [medsState] = useLocalStorage<{ schedule: MedicationDose[]; takenKeys: string[] }>(
    "fibrocare:clinical:meds",
    { schedule: [], takenKeys: [] }
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getLatestLogs().catch(() => []),
      getClinicalAssessment().catch(() => null),
      getCycleDashboardData().catch(() => null),
    ]).then(([logRows, assessment, cycleData]) => {
      if (cancelled) return;
      setLogs(
        (logRows ?? []).map((l) => ({
          loggedAt: l.loggedAt,
          painLevel: l.painLevel,
          moodTag: l.moodTag,
        }))
      );
      if (assessment?.success && assessment.summary) setAcr(assessment.summary);
      if (cycleData) setCycle(cycleData);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats: PeriodStats | null = useMemo(() => {
    if (loading) return null;
    return buildPeriodStats(
      {
        // HealthLog rows carry `moodTag`; the report engine's contract is
        // `mood` — adapt at the boundary so the engine stays pure.
        logs: logs.map((log) => ({
          loggedAt: log.loggedAt,
          painLevel: log.painLevel,
          mood: log.moodTag,
        })),
        triggers,
        labs,
        meds: medsState.schedule,
        acr,
      },
      period
    );
  }, [loading, logs, triggers, labs, medsState.schedule, acr, period]);

  const summaryText = useMemo(() => {
    if (!stats) return "";
    const lines: string[] = [];
    lines.push(
      `${t("clinical.report.title")} — ${t(period === "week" ? "clinical.report.period.week" : "clinical.report.period.month")}`
    );
    if (stats.avgPain === null) {
      lines.push(t("clinical.report.empty"));
      return lines.join("\n");
    }
    lines.push(
      `- ${t("clinical.report.stat.avgPain")}: ${stats.avgPain}/10`,
      `- ${t("clinical.report.stat.peakPain")}: ${stats.peakPain}/10`,
      `- ${t("clinical.report.stat.flareDays")}: ${stats.flareDays}`,
      `- ${t("clinical.report.stat.adherence")}: ${stats.loggingAdherence}%`
    );
    if (stats.triggerTop) {
      lines.push(
        `- ${t("clinical.report.trigger.top", {
          factor: factorLabel(stats.triggerTop.factor, t),
          avg: stats.triggerTop.avgSeverity,
          count: stats.triggerTop.count,
        })}`
      );
    }
    const flagged = stats.labHighlights.filter((l) => l.verdict !== "inRange");
    if (flagged.length > 0) {
      lines.push(
        `- ${t("clinical.report.lab.title")}: ${flagged
          .map((l) => `${labLabel(l.testId, t)} ${l.value} (${t(VERDICT_KEYS[l.verdict])})`)
          .join("; ")}`
      );
    }
    if (stats.dueMedications.length > 0) {
      lines.push(`- ${t("clinical.report.meds.title")}: ${stats.dueMedications.join(", ")}`);
    }
    if (stats.acrMet !== null && acr) {
      lines.push(
        `- ${t("clinical.report.acr.title")}: ${t(
          stats.acrMet ? "clinical.report.acr.met" : "clinical.report.acr.notMet",
          { wpi: acr.wpi, ss: acr.ss }
        )}`
      );
    }
    return lines.join("\n");
  }, [stats, period, acr, t]);

  const [copied, setCopied] = useState(false);
  const copySummary = async () => {
    if (!summaryText) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.getElementById("clinical-period-report-summary");
      if (el instanceof HTMLTextAreaElement) {
        el.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const periods: Array<{ id: ReportPeriod; label: string }> = [
    { id: "week", label: t("clinical.report.period.week") },
    { id: "month", label: t("clinical.report.period.month") },
  ];

  return (
    <section
      aria-label={t("clinical.report.title")}
      className="w-full break-inside-avoid rounded-2xl border border-teal-500/20 bg-white/70 p-5 shadow-lg shadow-teal-950/10 backdrop-blur-xl dark:bg-slate-900/60 print:bg-white print:shadow-none print:backdrop-blur-none dark:print:bg-white"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-300">
            <HugeiconsIcon icon={ClipboardListIcon} className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {t("clinical.report.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("clinical.report.subtitle")}</p>
          </div>
        </div>

        {/* Period toggle */}
        <div
          className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-card/60 p-1 print:hidden"
          role="group"
          aria-label={t("clinical.report.title")}
        >
          {periods.map((p) => {
            const active = period === p.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                onClick={() => setPeriod(p.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-teal-600 text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading || !stats ? (
        <div className="mt-6 flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" aria-hidden="true" />
        </div>
      ) : stats.avgPain === null ? (
        <p className="mt-6 rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
          {t("clinical.report.empty")}
        </p>
      ) : (
        <>
          {/* Stats strip */}
          <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-center">
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {t("clinical.report.stat.avgPain")}
              </dt>
              <dd className="mt-1 text-lg font-bold text-foreground">
                <bdi>{stats.avgPain}</bdi>/10
              </dd>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-center">
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {t("clinical.report.stat.peakPain")}
              </dt>
              <dd className="mt-1 text-lg font-bold text-foreground">
                <bdi>{stats.peakPain}</bdi>/10
              </dd>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-center">
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {t("clinical.report.stat.flareDays")}
              </dt>
              <dd className="mt-1 text-lg font-bold text-foreground">{stats.flareDays}</dd>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-center">
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {t("clinical.report.stat.adherence")}
              </dt>
              <dd className="mt-1 text-lg font-bold text-foreground">
                <bdi>{stats.loggingAdherence}%</bdi>
              </dd>
            </div>
          </dl>

          {/* Triggers */}
          <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <HugeiconsIcon icon={FlameIcon} className="h-4 w-4 text-rose-600 dark:text-rose-300" aria-hidden="true" />
              {t("clinical.report.trigger.title")}
            </p>
            {stats.triggerCounts.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {t("clinical.report.trigger.none")}
              </p>
            ) : (
              <>
                {stats.triggerTop && (
                  <p className="mt-2 text-xs font-medium text-foreground/90">
                    {t("clinical.report.trigger.top", {
                      factor: factorLabel(stats.triggerTop.factor, t),
                      avg: stats.triggerTop.avgSeverity,
                      count: stats.triggerTop.count,
                    })}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {stats.triggerCounts.slice(0, 8).map(({ factor, count }) => (
                    <span
                      key={factor}
                      className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {factorLabel(factor, t)} · <bdi>{count}</bdi>
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Labs */}
          <div className="mt-3 rounded-xl border border-border/60 bg-muted/30 p-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <HugeiconsIcon icon={TestTube01Icon} className="h-4 w-4 text-sky-600 dark:text-sky-300" aria-hidden="true" />
              {t("clinical.report.lab.title")}
            </p>
            {stats.labHighlights.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">{t("clinical.report.lab.none")}</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {stats.labHighlights.map((lab) => (
                  <li key={`${lab.testId}-${lab.date}`} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-foreground/90">
                      {labLabel(lab.testId, t)} · <bdi>{lab.date}</bdi>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <bdi className="font-semibold text-foreground">{lab.value}</bdi>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", VERDICT_TONE[lab.verdict])}>
                        {t(VERDICT_KEYS[lab.verdict])}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Meds + ACR + cycle context */}
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <HugeiconsIcon icon={PillIcon} className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                {t("clinical.report.meds.title")}
              </p>
              {stats.dueMedications.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">{t("clinical.report.meds.none")}</p>
              ) : (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {stats.dueMedications.map((name) => (
                    <li key={name} className="text-foreground/90">
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <HugeiconsIcon icon={HealthIcon} className="h-4 w-4 text-teal-600 dark:text-teal-300" aria-hidden="true" />
                {t("clinical.report.acr.title")}
              </p>
              {stats.acrMet === null || !acr ? (
                <p className="mt-2 text-xs text-muted-foreground">{t("clinical.report.acr.none")}</p>
              ) : (
                <p
                  className={cn(
                    "mt-2 flex items-start gap-1.5 text-xs font-medium",
                    stats.acrMet
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-amber-700 dark:text-amber-300"
                  )}
                >
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  {t(stats.acrMet ? "clinical.report.acr.met" : "clinical.report.acr.notMet", {
                    wpi: acr.wpi,
                    ss: acr.ss,
                  })}
                </p>
              )}
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <HugeiconsIcon icon={Moon02Icon} className="h-4 w-4 text-purple-600 dark:text-purple-300" aria-hidden="true" />
                {t("clinical.report.cycle.title")}
              </p>
              {cycle && !cycle.overlap.noData ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  <bdi>{cycle.overlap.hormonalAmplification}%</bdi>
                </p>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">{t("clinical.report.cycle.none")}</p>
              )}
            </div>
          </div>

          {/* Doctor-ready copyable summary */}
          <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-3 print:hidden">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <HugeiconsIcon icon={Calendar03Icon} className="h-4 w-4" aria-hidden="true" />
                {t("clinical.report.copy")}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  aria-label={t("clinical.report.printAria")}
                  className="rounded-lg border-border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <HugeiconsIcon icon={PrinterIcon} className="me-1 h-3.5 w-3.5" aria-hidden="true" />
                  {t("clinical.report.print")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copySummary}
                  className="rounded-lg border-border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <HugeiconsIcon icon={Copy01Icon} className="me-1 h-3.5 w-3.5" aria-hidden="true" />
                  {copied ? t("clinical.report.copied") : t("clinical.report.copy")}
                </Button>
              </div>
            </div>
            <textarea
              id="clinical-period-report-summary"
              readOnly
              value={summaryText}
              rows={8}
              className="mt-2 w-full resize-none rounded-lg border border-border/50 bg-card/60 p-3 text-xs leading-relaxed text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <HugeiconsIcon icon={ChartAverageIcon} className="h-3.5 w-3.5" aria-hidden="true" />
              {t("clinical.report.shareHint")}
            </p>
          </div>
        </>
      )}
    </section>
  );
}
