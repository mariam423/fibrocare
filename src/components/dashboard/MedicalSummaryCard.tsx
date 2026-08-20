"use client";

import { useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SparklesIcon,
  Loading01Icon,
  Alert01Icon,
  ChatQuestion01Icon,
  Chart01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateMedicalSummary } from "@/app/actions";
import type { MedicalSummary } from "@/lib/medicalSummary";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

const SEVERITY_STYLE: Record<
  MedicalSummary["keyInsights"][number]["severity"],
  string
> = {
  critical: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900",
  warning: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900",
  info: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900",
};

interface AiQuestion {
  question: string;
  reason: string;
}

export function MedicalSummaryCard() {
  const { t, locale } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState<MedicalSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiQuestions, setAiQuestions] = useState<AiQuestion[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const loadAiQuestions = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/questions", { method: "POST" });
      if (!res.ok) {
        setAiQuestions(null);
        return;
      }
      const data = (await res.json()) as {
        offline?: boolean;
        questions?: AiQuestion[];
      };
      setAiQuestions(data.offline || !data.questions ? null : data.questions);
    } catch {
      setAiQuestions(null);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      const result = await generateMedicalSummary();
      if (result.success) {
        setSummary(result.data);
        setAiQuestions(null);
        void loadAiQuestions();
      } else {
        setError(result.error || t("medical.error"));
      }
    });
  };

  return (
    <div className="backdrop-blur-md bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-violet-500/5 ring-1 ring-violet-500/25">
            <HugeiconsIcon
              icon={SparklesIcon}
              className="h-5 w-5 text-violet-500 dark:text-violet-300 animate-pulse [filter:drop-shadow(0_0_6px_rgba(139,92,246,0.6))]"
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">
              {t("medical.title")}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t("medical.subtitle")}
            </p>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isPending}
          className="relative min-h-11 rounded-xl px-5 text-sm font-medium bg-violet-600 text-white hover:bg-violet-500 shadow-[0_0_20px_-4px_rgba(139,92,246,0.55)] hover:shadow-[0_0_28px_-4px_rgba(139,92,246,0.7)]"
        >
          {isPending ? (
            <>
              <HugeiconsIcon
                icon={Loading01Icon}
                className="ms-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
              {t("medical.analyzing")}
            </>
          ) : (
            <>
              <HugeiconsIcon
                icon={SparklesIcon}
                className="ms-2 h-4 w-4 animate-pulse"
                aria-hidden="true"
              />
              {t("medical.generate")}
            </>
          )}
        </Button>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <Dialog
        open={summary !== null}
        onOpenChange={(open) => {
          if (!open) setSummary(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-foreground">
              <HugeiconsIcon
                icon={SparklesIcon}
                className="h-5 w-5 text-violet-500"
                aria-hidden="true"
              />
              {t("medical.summaryFor", { name: summary?.patientName ?? "" })}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {summary
                ? t("medical.generated", {
                    date: new Date(summary.generatedAt).toLocaleString(locale),
                  })
                : ""}
            </DialogDescription>
          </DialogHeader>

          {summary && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-center backdrop-blur-md">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                    {t("medical.avgPain")}
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {summary.stats.avgPain.toFixed(1)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-center backdrop-blur-md">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                    {t("medical.flareDays")}
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {summary.stats.flareUpDays}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-center backdrop-blur-md">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                    {t("medical.logs")}
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {summary.stats.totalLogs}
                  </p>
                </div>
              </div>

              {/* Pain trend bars */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <HugeiconsIcon
                    icon={Chart01Icon}
                    className="h-4 w-4 text-primary"
                    aria-hidden="true"
                  />
                  {t("medical.painTrend")}
                </h3>
                <div className="mt-3 flex h-20 items-end gap-2">
                  {summary.painTrends.map((point) => (
                    <div
                      key={point.date}
                      className="flex flex-1 flex-col items-center gap-1"
                    >
                      <div className="w-full rounded-md bg-primary/15 dark:bg-primary/20" style={{ height: `${Math.max(point.level * 8, 2)}px` }} />
                      <span className="text-[9px] text-muted-foreground">
                        {new Date(point.date + "T00:00:00").toLocaleDateString(locale, { weekday: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key insights */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <HugeiconsIcon
                    icon={Alert01Icon}
                    className="h-4 w-4 text-primary"
                    aria-hidden="true"
                  />
                  {t("medical.keyInsights")}
                </h3>
                <div className="mt-3 space-y-2">
                  {summary.keyInsights.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("medical.insightsEmpty")}
                    </p>
                  ) : (
                    summary.keyInsights.map((insight) => (
                      <div
                        key={insight.title}
                        className={cn("rounded-xl border p-3", SEVERITY_STYLE[insight.severity])}
                      >
                        <p className="text-sm font-semibold">{insight.title}</p>
                        <p className="mt-0.5 text-xs opacity-80">{insight.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recommended questions for the doctor */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <HugeiconsIcon
                    icon={ChatQuestion01Icon}
                    className="h-4 w-4 text-primary"
                    aria-hidden="true"
                  />
                  {t("medical.questions")}
                </h3>
                <ul className="mt-3 space-y-2">
                  {summary.recommendedQuestions.map((question) => (
                    <li
                      key={question}
                      className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-sm text-white backdrop-blur-md"
                    >
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                        aria-hidden="true"
                      />
                      <span dir="ltr" className="text-left [unicode-bidi:isolate]">{question}</span>
                    </li>
                  ))}
                </ul>

                {aiLoading && (
                  <div className="mt-3 space-y-2" role="status" aria-label={t("medical.generatingAria")}>
                    <div className="h-10 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-700/50" />
                    <div className="h-10 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-700/50" />
                  </div>
                )}

                {!aiLoading && aiQuestions && aiQuestions.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {aiQuestions.map((item) => (
                      <li
                        key={item.question}
                        className="rounded-xl border border-violet-300/40 bg-gradient-to-br from-violet-500/[0.07] to-transparent p-3 dark:border-violet-400/20"
                      >
                        <div className="flex items-start gap-2 text-sm text-foreground">
                          <HugeiconsIcon
                            icon={SparklesIcon}
                            className="mt-0.5 h-4 w-4 shrink-0 text-violet-500 dark:text-violet-300"
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <span dir="ltr" className="block text-left [unicode-bidi:isolate]">
                              {item.question}
                            </span>
                            <p dir="ltr" className="mt-1 text-left text-xs text-muted-foreground [unicode-bidi:isolate]">
                              {item.reason}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </div>
  );
}
