"use client";

/**
 * LabResultsTracker — Thyroid / Vitamin D / ESR / CRP biomarker tracker.
 *
 * Fibromyalgia is a diagnosis of exclusion, so thyroid, vitamin D and
 * inflammatory markers (ESR, CRP) are the classic "rule out overlap"
 * bloodwork. This module records each result with its date and compares it
 * against an informational reference range — low / in-range / high — using
 * the pure helpers in `src/lib/clinical/trackers.ts`. Informational only;
 * always follow your clinician's guidance.
 */

import React, { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Delete01Icon, TestTube01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/translations";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  LAB_FIELDS,
  labVerdict,
  latestPerTest,
  type LabResult,
  type LabTestId,
} from "@/lib/clinical/trackers";

const VERDICT_STYLES = {
  low: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  inRange: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  high: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
} as const;

const VERDICT_KEYS = {
  low: "clinical.lab.verdict.low",
  inRange: "clinical.lab.verdict.inRange",
  high: "clinical.lab.verdict.high",
} as const satisfies Record<string, TranslationKey>;

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function LabResultsTracker() {
  const { t } = useLanguage();
  const [results, setResults] = useLocalStorage<LabResult[]>("fibrocare:clinical:labs", []);
  const [testId, setTestId] = useState<LabTestId>("tsh");
  const [date, setDate] = useState(todayKey());
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const field = LAB_FIELDS.find((f) => f.id === testId)!;

  const addResult = () => {
    const parsed = Number(value);
    if (value.trim() === "" || Number.isNaN(parsed)) {
      setError(t("clinical.lab.valueRequired"));
      return;
    }
    setError("");
    const row: LabResult = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      testId,
      date,
      value: parsed,
      note: note.trim(),
    };
    setResults([...results, row]);
    setValue("");
    setNote("");
  };

  const removeResult = (id: string) => {
    setResults(results.filter((r) => r.id !== id));
  };

  const sorted = useMemo(
    () => [...results].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [results]
  );

  const latest = useMemo(() => latestPerTest(results), [results]);

  return (
    <section
      aria-label={t("clinical.lab.title")}
      className="w-full break-inside-avoid rounded-2xl border border-emerald-500/20 bg-white/70 p-5 shadow-lg shadow-emerald-950/10 backdrop-blur-xl dark:bg-slate-900/60"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
          <HugeiconsIcon icon={TestTube01Icon} className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("clinical.lab.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("clinical.lab.subtitle")}</p>
        </div>
      </div>

      {/* Latest per test */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {LAB_FIELDS.map((f) => {
          const row = latest.get(f.id);
          const verdict = row ? labVerdict(row.value, f) : null;
          return (
            <div key={f.id} className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t(f.labelTKey as TranslationKey)}
              </p>
              {row ? (
                <>
                  <p className="mt-1 text-base font-bold text-foreground">
                    <bdi>{row.value}</bdi>{" "}
                    <span className="text-xs font-normal text-muted-foreground">{f.unit}</span>
                  </p>
                  <span
                    className={cn(
                      "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      verdict && VERDICT_STYLES[verdict]
                    )}
                  >
                    {verdict && t(VERDICT_KEYS[verdict])}
                  </span>
                </>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">{t("clinical.lab.latestNone")}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add a result */}
      <div className="mt-4 space-y-3 rounded-xl border border-border/60 bg-muted/30 p-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-40 flex-1">
            <label htmlFor="lab-test" className="text-xs font-medium text-muted-foreground">
              {t("clinical.lab.test")}
            </label>
            <select
              id="lab-test"
              value={testId}
              onChange={(e) => setTestId(e.target.value as LabTestId)}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {LAB_FIELDS.map((f) => (
                <option key={f.id} value={f.id}>
                  {t(f.labelTKey as TranslationKey)}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-muted-foreground">
              <bdi>{t("clinical.lab.hint", { hint: t(field.hintTKey as TranslationKey) })}</bdi>
            </p>
            <p className="text-[11px] text-muted-foreground">
              <bdi>
                {t("clinical.lab.reference", {
                  low: field.referenceLow,
                  high: field.referenceHigh,
                  unit: field.unit,
                })}
              </bdi>
            </p>
          </div>
          <div className="min-w-28">
            <label htmlFor="lab-date" className="text-xs font-medium text-muted-foreground">
              {t("clinical.lab.date")}
            </label>
            <input
              id="lab-date"
              type="date"
              value={date}
              max={todayKey()}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="min-w-24">
            <label htmlFor="lab-value" className="text-xs font-medium text-muted-foreground">
              {t("clinical.lab.value")}
            </label>
            <input
              id="lab-value"
              type="number"
              step="any"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Button
            onClick={addResult}
            className="rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <HugeiconsIcon icon={Add01Icon} className="me-1 h-4 w-4" aria-hidden="true" />
            {t("clinical.lab.add")}
          </Button>
        </div>
        {error && <p className="text-xs text-rose-600 dark:text-rose-300">{error}</p>}
        <div>
          <label htmlFor="lab-note" className="text-xs font-medium text-muted-foreground">
            {t("clinical.lab.note")}
          </label>
          <input
            id="lab-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("clinical.lab.notePlaceholder")}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* History */}
      <h3 className="mt-5 text-sm font-semibold text-foreground">{t("clinical.lab.history")}</h3>
      {sorted.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">{t("clinical.lab.empty")}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {sorted.map((row) => {
            const f = LAB_FIELDS.find((x) => x.id === row.testId)!;
            const verdict = labVerdict(row.value, f);
            return (
              <li
                key={row.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border/50 bg-card/60 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {t(f.labelTKey as TranslationKey)} · <bdi>{row.date}</bdi>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <bdi>
                      {row.value} {f.unit}
                    </bdi>{" "}
                    · {t(VERDICT_KEYS[verdict])}
                  </p>
                  {row.note && <p className="mt-1 text-xs text-muted-foreground">{row.note}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      VERDICT_STYLES[verdict]
                    )}
                  >
                    {t(VERDICT_KEYS[verdict])}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeResult(row.id)}
                    aria-label={t("clinical.lab.delete")}
                    className="rounded-lg text-muted-foreground transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-600 active:scale-[0.95] dark:hover:text-rose-300"
                  >
                    <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-xs text-muted-foreground">{t("clinical.lab.disclaimer")}</p>
    </section>
  );
}