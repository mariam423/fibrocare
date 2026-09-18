"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { DocumentAttachmentIcon, PrinterIcon, Loading01Icon } from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import { generateClinicalReport, type ClinicalReportData } from "@/app/actions";
import type { TranslationKey } from "@/lib/translations";

const PHASE_KEYS: Record<string, TranslationKey> = {
  MENSTRUAL: "health.phase.menstrual",
  FOLLICULAR: "health.phase.follicular",
  OVULATORY: "health.phase.ovulatory",
  LUTEAL: "health.phase.luteal",
};

/**
 * Clinical Report (Point 12) — doctor-ready summary built server-side from
 * cycle + daily-log history. Generate is explicit (deterministic pure
 * computation, no AI call), then printable via the browser's print dialog.
 */
export function ClinicalReportCard() {
  const { t } = useLanguage();
  const [report, setReport] = useState<ClinicalReportData | null>(null);
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const result = await generateClinicalReport();
      setReport(result);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Card className="w-full h-full overflow-hidden border-teal-200 dark:border-teal-900/30 bg-teal-50/20 dark:bg-teal-950/10">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={DocumentAttachmentIcon} className="h-5 w-5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
          <CardTitle className="text-lg font-semibold">{t("health.clinicalReport.title")}</CardTitle>
        </div>
        <CardDescription className="text-sm">{t("health.clinicalReport.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGenerate} disabled={generating} variant="outline" className="w-full">
          {generating ? (
            <>
              <HugeiconsIcon icon={Loading01Icon} className="me-2 h-4 w-4 animate-spin" aria-hidden="true" />
              {t("health.clinicalReport.generating")}
            </>
          ) : (
            t("health.clinicalReport.generate")
          )}
        </Button>

        {report?.empty ? (
          <p className="text-sm text-muted-foreground">{t("health.clinicalReport.emptyState")}</p>
        ) : report ? (
          <div className="space-y-3 rounded-xl border border-border bg-background/60 p-4 print:shadow-none">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("health.clinicalReport.periodRange")}</p>
                <p className="mt-0.5 font-semibold tabular-nums">
                  {report.periodRange?.earliest} → {report.periodRange?.latest}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("health.clinicalReport.peakPain")}</p>
                <p className="mt-0.5 font-semibold tabular-nums">{report.peakPainLevel}/30</p>
              </div>
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("health.clinicalReport.avgEnergy")}</p>
                <p className="mt-0.5 font-semibold tabular-nums">{report.avgEnergyLevel}</p>
              </div>
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("health.clinicalReport.avgMood")}</p>
                <p className="mt-0.5 font-semibold tabular-nums">{report.avgMoodScore}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{t("health.clinicalReport.symptomSummary")}</p>
              {report.topCorrelations.length === 0 ? (
                <p className="text-xs text-muted-foreground">—</p>
              ) : (
                <ul className="space-y-1.5">
                  {report.topCorrelations.map((c) => (
                    <li key={`${c.symptom}-${c.phase}`} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-foreground/90">
                        {c.symptom} <span className="text-xs text-muted-foreground">({t(PHASE_KEYS[c.phase])})</span>
                      </span>
                      <span className="tabular-nums text-muted-foreground">{c.occurrences}×</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button variant="outline" size="sm" className="w-full" onClick={() => window.print()}>
              <HugeiconsIcon icon={PrinterIcon} className="me-2 h-4 w-4" aria-hidden="true" />
              {t("health.clinicalReport.printCta")}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}