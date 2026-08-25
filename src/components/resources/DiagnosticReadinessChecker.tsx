"use client";

/**
 * Interactive "AI Diagnostic Readiness Checker" for the Diagnosis page.
 *
 * Walks the user through 4 yes/no questions mirroring the ACR 2010 criteria
 * (widespread pain index, symptom severity, duration ≥ 3 months, exclusion of
 * other causes), evaluates the answers with the pure engine in
 * `src/lib/resources/diagnosticCheck.ts`, and produces a localized verdict
 * plus a plain-text summary that can be copied for a doctor visit.
 * Screening aid only — never a diagnosis.
 */

import React, { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Copy01Icon,
  Download01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import {
  evaluateDiagnosticReadiness,
  type DiagnosticCheckAnswers,
  type DiagnosticCheckQuestionId,
} from "@/lib/resources/diagnosticCheck";

const QUESTIONS: Array<{
  id: DiagnosticCheckQuestionId;
  labelKey: "diagnosis.check.q.widespread" | "diagnosis.check.q.severity" | "diagnosis.check.q.duration" | "diagnosis.check.q.exclusion";
}> = [
  { id: "widespread", labelKey: "diagnosis.check.q.widespread" },
  { id: "severity", labelKey: "diagnosis.check.q.severity" },
  { id: "duration", labelKey: "diagnosis.check.q.duration" },
  { id: "exclusion", labelKey: "diagnosis.check.q.exclusion" },
];

const VERDICT_STYLES: Record<string, string> = {
  likely: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  possible: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  unlikely: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",
};

export function DiagnosticReadinessChecker() {
  const { t, locale } = useLanguage();
  const [answers, setAnswers] = useState<Partial<DiagnosticCheckAnswers>>({});
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const allAnswered = QUESTIONS.every((q) => typeof answers[q.id] === "boolean");

  const result = useMemo(() => {
    if (!submitted) return null;
    return evaluateDiagnosticReadiness({
      widespread: answers.widespread ?? false,
      severity: answers.severity ?? false,
      duration: answers.duration ?? false,
      exclusion: answers.exclusion ?? false,
    });
  }, [submitted, answers]);

  const verdictKey =
    result?.verdict === "likely"
      ? "diagnosis.check.verdict.likely"
      : result?.verdict === "possible"
        ? "diagnosis.check.verdict.possible"
        : "diagnosis.check.verdict.unlikely";

  const summaryText = useMemo(() => {
    if (!result) return "";
    const yesNo = (met: boolean) => t(met ? "diagnosis.check.yes" : "diagnosis.check.no");
    return [
      t("diagnosis.check.summaryTitle"),
      `- ${t("diagnosis.check.summary.line1", { answer: yesNo(result.lines[0].met) })}`,
      `- ${t("diagnosis.check.summary.line2", { answer: yesNo(result.lines[1].met) })}`,
      `- ${t("diagnosis.check.summary.line3", { answer: yesNo(result.lines[2].met) })}`,
      `- ${t("diagnosis.check.summary.line4", { answer: yesNo(result.lines[3].met) })}`,
      t("diagnosis.check.disclaimer"),
    ].join("\n");
  }, [result, t]);

  const downloadPdf = async () => {
    if (!result || downloading) return;
    setDownloading(true);
    try {
      // Lazy-load jsPDF only when the user actually exports — keeps it out
      // of the initial client bundle for the diagnosis page.
      const { generateDiagnosticCheckPdf } = await import("@/lib/pdfGenerator");
      const blob = await generateDiagnosticCheckPdf(
        {
          verdict: result.verdict,
          metCount: result.metCount,
          total: result.total,
          lines: result.lines,
        },
        locale
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fibrocare-diagnosis-summary-${locale}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Font fetch can fail offline — the copy summary stays available.
    } finally {
      setDownloading(false);
    }
  };

  const copySummary = async () => {
    if (!summaryText) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked in embedded contexts — select the textarea.
      const el = document.getElementById("diagnosis-check-summary");
      if (el instanceof HTMLTextAreaElement) {
        el.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <section
      className="w-full break-inside-avoid rounded-2xl border border-emerald-500/20 bg-white/70 p-5 shadow-lg shadow-emerald-950/20 backdrop-blur-xl transition-all duration-200 hover:scale-[1.01] hover:border-emerald-400/40 dark:bg-slate-900/60"
      aria-label={t("diagnosis.check.title")}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {t("diagnosis.check.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("diagnosis.check.subtitle")}
          </p>
        </div>
      </div>

      {/* Questions — interactive, so they're hidden when printing */}
      <div className="mt-5 space-y-3 print:hidden" role="group" aria-label={t("diagnosis.check.title")}>
        {QUESTIONS.map((q, idx) => {
          const value = answers[q.id];
          return (
            <div
              key={q.id}
              className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="flex items-start gap-2 text-sm text-foreground/90">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                  <bdi>{idx + 1}</bdi>
                </span>
                {t(q.labelKey)}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                {(["yes", "no"] as const).map((opt) => {
                  const met = opt === "yes";
                  const active = value === met;
                  return (
                    <button
                      key={opt}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setAnswers((a) => ({ ...a, [q.id]: met }));
                        setSubmitted(false);
                        setCopied(false);
                      }}
                      className={cn(
                        "min-w-16 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "border-border bg-card/60 text-muted-foreground hover:border-emerald-400/30 hover:text-foreground"
                      )}
                    >
                      {t(met ? "diagnosis.check.yes" : "diagnosis.check.no")}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <Button
          onClick={() => setSubmitted(true)}
          disabled={!allAnswered}
          className="rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="me-1 h-4 w-4" aria-hidden="true" />
          {t("diagnosis.check.assess")}
        </Button>
      </div>

      {/* Print-only hint when no verdict exists yet — the summary sheet
          needs a completed check. */}
      {!result && (
        <p className="mt-4 hidden text-xs text-muted-foreground print:block">
          {t("diagnosis.check.printHint")}
        </p>
      )}

      {/* Verdict + exportable summary */}
      {result && (
        <div className="mt-5 space-y-3" aria-live="polite">
          <div
            className={cn(
              "rounded-xl border px-4 py-3 text-sm font-medium",
              VERDICT_STYLES[result.verdict]
            )}
          >
            <p className="flex items-center gap-2">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4" aria-hidden="true" />
              {t(verdictKey)}
            </p>
            <p className="mt-1 text-xs font-normal opacity-90">
              <bdi>
                {result.metCount}/{result.total}
              </bdi>{" "}
              {t("diagnosis.check.criteriaLabel")}
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-foreground">
                {t("diagnosis.check.summaryTitle")}
              </p>
              <div className="flex flex-wrap items-center gap-2 print:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copySummary}
                  className="rounded-lg border-border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <HugeiconsIcon icon={Copy01Icon} className="me-1 h-3.5 w-3.5" aria-hidden="true" />
                  {copied ? t("diagnosis.check.copied") : t("diagnosis.check.copy")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadPdf}
                  disabled={downloading}
                  className="rounded-lg border-emerald-500/30 text-emerald-700 transition-all duration-200 hover:scale-[1.02] hover:border-emerald-500/50 hover:bg-emerald-500/10 active:scale-[0.98] dark:text-emerald-300"
                >
                  <HugeiconsIcon icon={Download01Icon} className="me-1 h-3.5 w-3.5" aria-hidden="true" />
                  {t("diagnosis.check.downloadPdf")}
                </Button>
              </div>
            </div>
            <textarea
              id="diagnosis-check-summary"
              readOnly
              value={summaryText}
              rows={7}
              className="mt-2 w-full resize-none rounded-lg border border-border/50 bg-card/60 p-3 text-xs leading-relaxed text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring print:hidden"
            />
            {/* Print-only rendering of the same summary — the textarea clips
                at rows=7, and its chrome is useless on paper. Rendered as a
                wrapping <pre> so every line prints in full. */}
            <pre className="mt-2 hidden whitespace-pre-wrap font-sans text-xs leading-relaxed text-foreground/90 print:block">
              {summaryText}
            </pre>
          </div>

          <p className="text-xs text-muted-foreground">{t("diagnosis.check.disclaimer")}</p>
        </div>
      )}
    </section>
  );
}
