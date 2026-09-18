"use client";

/**
 * AcrAssessment — ACR 2010/2016 self-assessment (WPI calculator + SS scale).
 *
 * Walks the user through the three ACR 2010/2016 dimensions:
 *  1. WPI — tap the 19 body areas painful in the last week.
 *  2. SS scale — fatigue / waking-unrefreshed / cognitive (0–3 each) plus a
 *     curated 18-symptom somatic checklist.
 *  3. Duration — symptoms at this level for ≥ 3 months.
 *
 * The pure engine in `src/lib/clinical/acr.ts` computes WPI, SS 0–12,
 * generalized-pain regions and the 2016 decision rule. The verdict is
 * rendered with a structural "why", a copyable doctor-visit summary, and a
 * "save to my profile" action that persists the snapshot for clinician
 * sharing. Screening aid only — never a diagnosis.
 */

import React, { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Activity03Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Link01Icon,
  LockKeyIcon,
  Loading01Icon,
  TestTube01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/translations";
import {
  WPI_REGIONS,
  SOMATIC_SYMPTOMS,
  somaticBandFromCount,
  evaluateAcr,
  acrProfileSnapshot,
  type AcrInput,
  type AcrResult,
  type SeverityBand,
  type WpiRegionId,
} from "@/lib/clinical/acr";
import {
  getClinicalAssessment,
  saveClinicalAssessment,
} from "@/app/actions";

const BAND_LABEL_KEYS: Record<number, TranslationKey> = {
  0: "clinical.acr.ss.level.0",
  1: "clinical.acr.ss.level.1",
  2: "clinical.acr.ss.level.2",
  3: "clinical.acr.ss.level.3",
};

function SeverityPicker({
  value,
  onChange,
  label,
}: {
  value: SeverityBand;
  onChange: (v: SeverityBand) => void;
  label: string;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
      <span className="text-sm text-foreground/90">{label}</span>
      <div className="flex shrink-0 items-center gap-1" role="group" aria-label={label}>
        {([0, 1, 2, 3] as const).map((level) => {
          const active = value === level;
          return (
            <button
              key={level}
              type="button"
              aria-pressed={active}
              title={t(BAND_LABEL_KEYS[level])}
              aria-label={`${label} · ${t(BAND_LABEL_KEYS[level])}`}
              onClick={() => onChange(level)}
              className={cn(
                "h-8 w-8 rounded-lg border text-xs font-semibold transition-all duration-200 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "border-border bg-card/60 text-muted-foreground hover:border-emerald-400/30 hover:text-foreground"
              )}
            >
              {level}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const CRITERIA_ITEMS = [
  { key: "generalizedMet", tKey: "clinical.acr.result.generalized" as TranslationKey },
  { key: "scoreRuleMet", tKey: "clinical.acr.result.scoreRule" as TranslationKey },
  { key: "durationMet", tKey: "clinical.acr.result.duration" as TranslationKey },
] as const;

export function AcrAssessment() {
  const { t } = useLanguage();

  const [wpiAreas, setWpiAreas] = useState<WpiRegionId[]>([]);
  const [fatigue, setFatigue] = useState<SeverityBand>(0);
  const [wakingUnrefreshed, setWakingUnrefreshed] = useState<SeverityBand>(0);
  const [cognitive, setCognitive] = useState<SeverityBand>(0);
  const [somatic, setSomatic] = useState<string[]>([]);
  const [durationMet, setDurationMet] = useState(false);
  const [evaluated, setEvaluated] = useState<AcrResult | null>(null);

  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedState, setSavedState] = useState<"idle" | "saved" | "signedOut" | "error">("idle");

  const somaticBand = somaticBandFromCount(somatic.length);

  // Preload an existing profile snapshot (also tells us sign-in state).
  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => getClinicalAssessment())
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.summary) {
          setWpiAreas(res.summary.wpiAreas ?? []);
          setSavedState("saved");
        }
        if (!res.success && res.error === "You must be signed in.") {
          setSavedState("signedOut");
        }
      })
      .catch(() => {
        /* offline — the tracker still works locally */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleArea = (id: WpiRegionId) => {
    setWpiAreas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setEvaluated(null);
    setSavedState((s) => (s === "saved" ? "idle" : s));
  };

  const toggleSomatic = (id: string) => {
    setSomatic((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setEvaluated(null);
  };

  const runEvaluation = () => {
    const input: AcrInput = {
      wpiAreas,
      fatigue,
      wakingUnrefreshed,
      cognitive,
      somaticBand,
      durationAtLeast3Months: durationMet,
    };
    setEvaluated(evaluateAcr(input));
  };

  const summaryText = useMemo(() => {
    if (!evaluated) return "";
    const yesNo = (met: boolean) => t(met ? "diagnosis.check.yes" : "diagnosis.check.no");
    const somaticCount = somaticBandFromCount(somatic.length);
    return [
      t("clinical.acr.summaryTitle"),
      `- WPI: ${evaluated.wpi}/19 ${t("clinical.acr.summary.wpi")}`,
      `- ${t("clinical.acr.summary.ss")}: ${evaluated.symptomSeverityScore}/9 + ${somaticCount} = ${evaluated.ss}/12`,
      `- ${t("clinical.acr.summary.generalized")}: ${evaluated.generalizedRegions}/5 · ${yesNo(evaluated.generalizedMet)}`,
      `- ${t("clinical.acr.summary.scoreRule")}: ${yesNo(evaluated.scoreRuleMet)}`,
      `- ${t("clinical.acr.summary.duration")}: ${yesNo(evaluated.durationMet)}`,
      `- ${t("clinical.acr.summary.criteria")}: ${yesNo(evaluated.criteriaMet)}`,
      t("clinical.acr.disclaimer"),
    ].join("\n");
  }, [evaluated, somatic.length, t]);

  const saveToProfile = async () => {
    if (!evaluated) return;
    setSaving(true);
    try {
      const summary = acrProfileSnapshot(evaluated, {
        wpiAreas,
        fatigue,
        wakingUnrefreshed,
        cognitive,
        somaticBand,
        durationAtLeast3Months: durationMet,
      });
      const res = await saveClinicalAssessment(summary);
      if (res.success) {
        setSavedState("saved");
      } else if (res.error === "You must be signed in.") {
        setSavedState("signedOut");
      } else {
        setSavedState("error");
      }
    } catch {
      setSavedState("error");
    } finally {
      setSaving(false);
    }
  };

  const copySummary = async () => {
    if (!summaryText) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.getElementById("acr-assessment-summary");
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
      aria-label={t("clinical.acr.title")}
      className="w-full break-inside-avoid rounded-2xl border border-emerald-500/20 bg-white/70 p-5 shadow-lg shadow-emerald-950/10 backdrop-blur-xl dark:bg-slate-900/60"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
          <HugeiconsIcon icon={Activity03Icon} className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("clinical.acr.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("clinical.acr.subtitle")}</p>
        </div>
      </div>

      {/* 1 — WPI */}
      <div className="mt-5">
        <h3 className="text-sm font-semibold text-foreground">{t("clinical.acr.wpi.title")}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("clinical.acr.wpi.subtitle")}</p>
        <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          {t("clinical.acr.wpi.count", { count: wpiAreas.length })}
        </p>
        <div
          className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
          role="group"
          aria-label={t("clinical.acr.wpi.title")}
        >
          {WPI_REGIONS.map((region) => {
            const active = wpiAreas.includes(region.id);
            return (
              <button
                key={region.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleArea(region.id)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
                    : "border-border bg-card/60 text-muted-foreground hover:border-emerald-400/30 hover:text-foreground"
                )}
              >
                <span>{t(`clinical.wpi.${region.id}` as TranslationKey)}</span>
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] leading-none transition-all",
                    active
                      ? "border-emerald-500/50 bg-emerald-500 text-white"
                      : "border-border text-transparent"
                  )}
                  aria-hidden="true"
                >
                  ✓
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2 — SS severity */}
      <div className="mt-5">
        <h3 className="text-sm font-semibold text-foreground">{t("clinical.acr.ss.title")}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("clinical.acr.ss.hint")}</p>
        <div className="mt-2 space-y-2">
          <SeverityPicker label={t("clinical.acr.ss.fatigue")} value={fatigue} onChange={setFatigue} />
          <SeverityPicker label={t("clinical.acr.ss.unrefreshed")} value={wakingUnrefreshed} onChange={setWakingUnrefreshed} />
          <SeverityPicker label={t("clinical.acr.ss.cognitive")} value={cognitive} onChange={setCognitive} />
        </div>
      </div>

      {/* 2b — Somatic checklist */}
      <div className="mt-5">
        <h3 className="text-sm font-semibold text-foreground">{t("clinical.acr.somatic.title")}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("clinical.acr.somatic.subtitle")}</p>
        <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
          {t("clinical.acr.somatic.bandHint", {
            count: somatic.length,
            band: t(BAND_LABEL_KEYS[somaticBand]),
          })}
        </p>
        <div
          className="mt-2 grid grid-cols-2 gap-2"
          role="group"
          aria-label={t("clinical.acr.somatic.title")}
        >
          {SOMATIC_SYMPTOMS.map((symptom) => {
            const active = somatic.includes(symptom.id);
            return (
              <button
                key={symptom.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleSomatic(symptom.id)}
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-teal-500/40 bg-teal-500/15 text-teal-800 dark:text-teal-200"
                    : "border-border bg-card/60 text-muted-foreground hover:border-teal-400/30 hover:text-foreground"
                )}
              >
                {t(symptom.tKey as TranslationKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 — Duration */}
      <div className="mt-5">
        <h3 className="text-sm font-semibold text-foreground">{t("clinical.acr.duration.title")}</h3>
        <button
          type="button"
          role="checkbox"
          aria-checked={durationMet}
          onClick={() => {
            setDurationMet((v) => !v);
            setEvaluated(null);
          }}
          className={cn(
            "mt-2 flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            durationMet
              ? "border-emerald-500/40 bg-emerald-500/10 text-foreground"
              : "border-border bg-card/60 text-muted-foreground hover:border-emerald-400/30"
          )}
        >
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] leading-none transition-all",
              durationMet ? "border-emerald-500/60 bg-emerald-500 text-white" : "border-border text-transparent"
            )}
            aria-hidden="true"
          >
            ✓
          </span>
          {t("clinical.acr.duration.label")}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 print:hidden">
        <Button onClick={runEvaluation} className="rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <HugeiconsIcon icon={TestTube01Icon} className="me-1 h-4 w-4" aria-hidden="true" />
          {t("clinical.acr.evaluate")}
        </Button>
      </div>

      {/* Result */}
      {evaluated && (
        <div className="mt-5 space-y-3" aria-live="polite">
          <div
            className={cn(
              "rounded-xl border px-4 py-3",
              evaluated.criteriaMet
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300"
            )}
          >
            <p className="flex items-center gap-2 text-sm font-semibold">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4" aria-hidden="true" />
              {t(
                evaluated.criteriaMet
                  ? "clinical.acr.result.criteriaMet"
                  : "clinical.acr.result.criteriaNotMet"
              )}
            </p>
            <p className="mt-1 text-xs opacity-90">{t("clinical.acr.result.interpretation")}</p>
          </div>

          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-center">
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {t("clinical.acr.result.wpi")}
              </dt>
              <dd className="mt-1 text-lg font-bold text-foreground">{evaluated.wpi}/19</dd>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-center">
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {t("clinical.acr.result.ss")}
              </dt>
              <dd className="mt-1 text-lg font-bold text-foreground">{evaluated.ss}/12</dd>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-center">
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {t("clinical.acr.result.generalized")}
              </dt>
              <dd className="mt-1 text-lg font-bold text-foreground">
                {evaluated.generalizedRegions}/5
              </dd>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-center">
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {t("clinical.acr.result.scoreRule")}
              </dt>
              <dd
                className={cn(
                  "mt-1 text-lg font-bold",
                  evaluated.scoreRuleMet ? "text-emerald-600 dark:text-emerald-300" : "text-foreground"
                )}
              >
                {t(evaluated.scoreRuleMet ? "clinical.acr.result.met" : "clinical.acr.result.notMet")}
              </dd>
            </div>
          </dl>

          {/* Structural why */}
          <ul className="space-y-1 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
            {CRITERIA_ITEMS.map((item) => {
              const met = evaluated[item.key];
              return (
                <li key={item.key} className="flex items-center justify-between gap-2">
                  <span>{t(item.tKey)}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      met
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    )}
                  >
                    {t(met ? "clinical.acr.result.met" : "clinical.acr.result.notMet")}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Share with a doctor: copy + save to profile */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 print:hidden">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-foreground">{t("clinical.acr.summaryTitle")}</p>
              <div className="flex flex-wrap items-center gap-2">
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
                  onClick={saveToProfile}
                  disabled={saving}
                  className="rounded-lg border-emerald-500/30 text-emerald-700 transition-all duration-200 hover:scale-[1.02] hover:border-emerald-500/50 hover:bg-emerald-500/10 active:scale-[0.98] dark:text-emerald-300"
                >
                  <HugeiconsIcon
                    icon={
                      savedState === "saved" ? Link01Icon : savedState === "signedOut" ? LockKeyIcon : Loading01Icon
                    }
                    className={cn("me-1 h-3.5 w-3.5", saving && "animate-spin")}
                    aria-hidden="true"
                  />
                  {savedState === "saved"
                    ? t("clinical.acr.savedToProfile")
                    : savedState === "signedOut"
                      ? t("clinical.acr.signInHint")
                      : t("clinical.acr.saveToProfile")}
                </Button>
              </div>
            </div>
            <textarea
              id="acr-assessment-summary"
              readOnly
              value={summaryText}
              rows={7}
              className="mt-2 w-full resize-none rounded-lg border border-border/50 bg-card/60 p-3 text-xs leading-relaxed text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {savedState === "saved" && (
              <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
                {t("clinical.acr.savedToProfileHint")}
              </p>
            )}
            {savedState === "signedOut" && (
              <p className="mt-2 text-xs text-muted-foreground">{t("clinical.acr.signInHintBody")}</p>
            )}
            {savedState === "error" && (
              <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">{t("clinical.acr.shareError")}</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">{t("clinical.acr.disclaimer")}</p>
        </div>
      )}
    </section>
  );
}