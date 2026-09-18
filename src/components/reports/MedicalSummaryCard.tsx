"use client";

/**
 * MedicalSummaryCard — the doctor-ready one-pager.
 *
 * Combats brain-fog memory loss at appointments: one clean, bulleted,
 * single-page summary of the last 30 days (pain stats, cycle days,
 * symptom severity, medication notes, logging adherence) that the user
 * can print or save as PDF with one tap (`window.print()`; the app's
 * print stylesheet already produces clean, ink-friendly output).
 *
 * Data comes from the session+PIN-guarded `getMedicalSummary` action and
 * fails soft (empty state, never an error) when locked or empty.
 */

import React, { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading01Icon, PrinterIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { getMedicalSummary, type MedicalSummaryData } from "@/app/actions";

export function MedicalSummaryCard() {
  const { t, locale } = useLanguage();
  const [data, setData] = useState<MedicalSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void getMedicalSummary().then((d) => {
      if (alive) {
        setData(d);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const fmt = (v: number | null, digits = 1) =>
    v === null ? t("summary.none") : v.toFixed(digits);

  return (
    <Card className="w-full border-primary/20 bg-card/60 backdrop-blur-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold">{t("summary.title")}</CardTitle>
        </div>
        <CardDescription>{t("summary.subtitle")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" aria-hidden="true" />
            {t("summary.loading")}
          </p>
        ) : !data ? (
          <p className="rounded-xl bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
            {t("summary.unavailable")}
          </p>
        ) : (
          <>
            {/* Print-friendly bulleted summary */}
            <div
              dir={locale === "ar" ? "rtl" : "ltr"}
              className="rounded-xl border border-border/60 bg-background/60 p-4 text-sm leading-relaxed"
            >
              <p className="mb-2 text-base font-bold text-foreground">
                {t("summary.heading", { name: data.userName })}
              </p>
              <ul className="list-disc space-y-1.5 ps-5">
                <li>
                  {t("summary.line.period", {
                    days: data.periodDays,
                    count: data.logCount,
                  })}
                </li>
                <li>
                  {t("summary.line.avgPain", { value: fmt(data.avgPain) })}
                  {data.peakPain !== null &&
                    ` · ${t("summary.line.peakPain", { value: data.peakPain })}`}
                </li>
                <li>{t("summary.line.flareDays", { count: data.flareDays })}</li>
                {data.cycleDays !== null && data.cycleDays > 0 && (
                  <li>{t("summary.line.cycleDays", { count: data.cycleDays })}</li>
                )}
                {data.avgSleepQuality !== null && (
                  <li>
                    {t("summary.line.symptomAvg", { value: fmt(data.avgSleepQuality) })}
                  </li>
                )}
                <li>{t("summary.line.adherence", { count: data.loggingDays })}</li>
                {data.medications.length > 0 ? (
                  <li>{t("summary.line.meds", { meds: data.medications.join(", ") })}</li>
                ) : (
                  <li>{t("summary.line.medsNone")}</li>
                )}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                {t("summary.generated", {
                  date: new Date(data.generatedAt).toLocaleDateString(
                    locale === "ar" ? "ar-EG" : locale
                  ),
                })}
              </p>
            </div>

            <Button
              type="button"
              onClick={() => window.print()}
              className="w-full rounded-xl"
            >
              <HugeiconsIcon icon={PrinterIcon} className="me-2 h-4 w-4" aria-hidden="true" />
              {t("summary.print")}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
