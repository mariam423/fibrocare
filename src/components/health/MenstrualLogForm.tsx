"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon, Loading01Icon } from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import { getActiveCycle } from "@/app/actions";
import { cn } from "@/lib/utils";

interface ActiveCycle {
  id: string;
  phase: "MENSTRUAL" | "FOLLICULAR" | "OVULATORY" | "LUTEAL";
  startDate: string;
  endDate: string | null;
}

const FLOW_OPTIONS = ["SPOTTING", "LIGHT", "MEDIUM", "HEAVY"] as const;
const MUCUS_OPTIONS = ["DRY", "STICKY", "CREAMY", "WATERY", "EGG_WHITE"] as const;
const OPK_OPTIONS = ["NEGATIVE", "POSITIVE", "NOT_USED"] as const;
const SENSITIVITY_OPTIONS = ["NONE", "MILD", "MODERATE", "SEVERE"] as const;

/** 0-10 severity scale with bilingual label; native range input keeps the
 *  interaction accessible and avoids dragging jank in RTL/Safari. */
function SeverityRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground/90">{label}</span>
        <span
          className="rounded-md px-2 py-0.5 text-xs font-bold tabular-nums text-primary bg-primary/10"
          aria-hidden="true"
        >
          {value}/10
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full accent-primary"
      />
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-foreground/90 select-none cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-primary"
      />
      {label}
    </label>
  );
}

function PillSelect({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: string | null;
  options: readonly string[];
  labels: Record<string, string>;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium text-foreground/90">{label}</span>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={value === opt}
            onClick={() => onChange(value === opt ? null : opt)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              value === opt
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {labels[opt]}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Daily Menstrual Log form (Points 1–8 + 14).
 *
 * Loads the active cycle via a server action (session + PIN guarded), then
 * upserts the day's entry to /api/health/cycle-log. No active cycle → shows
 * the existing NoCycleCard guidance (the CycleStatusWidget owns the cycle
 * creation flow). Fields map 1:1 to the MenstrualLog model.
 */
export function MenstrualLogForm() {
  const { t } = useLanguage();
  const [cycle, setCycle] = useState<ActiveCycle | null>(null);
  const [loadingCycle, setLoadingCycle] = useState(true);

  const [logDate, setLogDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [flowIntensity, setFlowIntensity] = useState<string | null>(null);
  const [hasClots, setHasClots] = useState(false);
  const [flowColor, setFlowColor] = useState("");
  const [crampsSeverity, setCrampsSeverity] = useState(0);
  const [headacheSeverity, setHeadacheSeverity] = useState(0);
  const [breastTenderness, setBreastTenderness] = useState(0);
  const [bloatingSeverity, setBloatingSeverity] = useState(0);
  const [giDiarrhea, setGiDiarrhea] = useState(false);
  const [giConstipation, setGiConstipation] = useState(false);
  const [hormonalAcne, setHormonalAcne] = useState(false);
  const [cervicalMucus, setCervicalMucus] = useState<string | null>(null);
  const [opkResult, setOpkResult] = useState<string | null>(null);
  const [tearfulness, setTearfulness] = useState(0);
  const [anxietyLevel, setAnxietyLevel] = useState(0);
  const [moodVolatility, setMoodVolatility] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [libidoLevel, setLibidoLevel] = useState(5);
  const [lightSensitivity, setLightSensitivity] = useState<string>("NONE");
  const [soundSensitivity, setSoundSensitivity] = useState<string>("NONE");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getActiveCycle()
      .then((c) => setCycle(c))
      .finally(() => setLoadingCycle(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cycle) return;
    setSaving(true);
    setError(null);
    setSavedOk(false);
    try {
      const res = await fetch("/api/health/cycle-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cycleId: cycle.id,
          logDate,
          flowIntensity: flowIntensity as never,
          hasClots,
          flowColor: flowColor.trim() || null,
          crampsSeverity,
          headacheSeverity,
          breastTenderness,
          bloatingSeverity,
          giDiarrhea,
          giConstipation,
          hormonalAcne,
          cervicalMucus: cervicalMucus as never,
          opkResult: opkResult as never,
          tearfulness,
          anxietyLevel,
          moodVolatility,
          energyLevel,
          libidoLevel,
          lightSensitivity: lightSensitivity as never,
          soundSensitivity: soundSensitivity as never,
          notes: notes.trim() || null,
        }),
      });
      if (!res.ok) {
        setError(t("health.menstrualLog.saveError"));
        return;
      }
      setSavedOk(true);
    } catch {
      setError(t("health.menstrualLog.saveError"));
    } finally {
      setSaving(false);
    }
  }

  if (loadingCycle) {
    return (
      <Card className="w-full h-full min-h-[220px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">{t("dashboard.loading")}</div>
      </Card>
    );
  }

  if (!cycle) {
    return (
      <Card className="w-full h-full min-h-[220px] flex flex-col items-center justify-center text-center gap-3 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/40">
          <HugeiconsIcon icon={Calendar01Icon} className="h-6 w-6 text-purple-700 dark:text-purple-300" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold">{t("health.menstrualLog.noActiveCycle")}</p>
        <p className="text-sm text-muted-foreground max-w-[38ch]">
          {t("health.menstrualLog.createCycleFirst")}
        </p>
      </Card>
    );
  }

  const flowLabels: Record<string, string> = {
    SPOTTING: t("health.menstrualLog.flow.spotting"),
    LIGHT: t("health.menstrualLog.flow.light"),
    MEDIUM: t("health.menstrualLog.flow.medium"),
    HEAVY: t("health.menstrualLog.flow.heavy"),
  };
  const mucusLabels: Record<string, string> = {
    DRY: t("health.menstrualLog.mucus.dry"),
    STICKY: t("health.menstrualLog.mucus.sticky"),
    CREAMY: t("health.menstrualLog.mucus.creamy"),
    WATERY: t("health.menstrualLog.mucus.watery"),
    EGG_WHITE: t("health.menstrualLog.mucus.eggWhite"),
  };
  const phaseLabels: Record<string, string> = {
    MENSTRUAL: t("health.phase.menstrual"),
    FOLLICULAR: t("health.phase.follicular"),
    OVULATORY: t("health.phase.ovulatory"),
    LUTEAL: t("health.phase.luteal"),
  };
  const opkLabels: Record<string, string> = {
    NEGATIVE: t("health.menstrualLog.opk.negative"),
    POSITIVE: t("health.menstrualLog.opk.positive"),
    NOT_USED: t("health.menstrualLog.opk.notUsed"),
  };
  const sensitivityLabels: Record<string, string> = {
    NONE: t("health.menstrualLog.sensory.none"),
    MILD: t("health.menstrualLog.sensory.mild"),
    MODERATE: t("health.menstrualLog.sensory.moderate"),
    SEVERE: t("health.menstrualLog.sensory.severe"),
  };

  return (
    <Card className="w-full h-full overflow-hidden border-purple-200 dark:border-purple-900/30 bg-purple-50/20 dark:bg-purple-950/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
          {t("health.menstrualLog.title")}
        </CardTitle>
        <CardDescription className="text-sm">
          {new Date(cycle.startDate).toLocaleDateString()} · {t("health.carePlan.currentPhase")}: {phaseLabels[cycle.phase] ?? cycle.phase}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="menstrual-log-date" className="text-sm font-medium text-foreground/90">
              {t("health.cycle.startDateAria")}
            </label>
            <Input
              id="menstrual-log-date"
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="h-9 w-44 text-base"
              max={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          {/* Point 2 — Flow */}
          <section className="space-y-3 border-t border-border pt-4">
            <PillSelect
              label={t("health.menstrualLog.flow.title")}
              value={flowIntensity}
              options={FLOW_OPTIONS}
              labels={flowLabels}
              onChange={(v) => setFlowIntensity(v)}
            />
            <div className="flex flex-wrap items-end gap-4">
              <ToggleField label={t("health.menstrualLog.flow.hasClots")} checked={hasClots} onChange={setHasClots} />
              <div className="flex items-center gap-2">
                <label htmlFor="flow-color" className="text-sm text-foreground/90">
                  {t("health.menstrualLog.flow.color")}
                </label>
                <Input
                  id="flow-color"
                  value={flowColor}
                  onChange={(e) => setFlowColor(e.target.value)}
                  className="h-9 w-32 text-base"
                />
              </div>
            </div>
          </section>

          {/* Point 3 — Somatic */}
          <section className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground">{t("health.menstrualLog.somatic.title")}</p>
            <SeverityRow label={t("health.menstrualLog.somatic.cramps")} value={crampsSeverity} onChange={setCrampsSeverity} />
            <SeverityRow label={t("health.menstrualLog.somatic.headache")} value={headacheSeverity} onChange={setHeadacheSeverity} />
            <SeverityRow label={t("health.menstrualLog.somatic.breastTenderness")} value={breastTenderness} onChange={setBreastTenderness} />
            <SeverityRow label={t("health.menstrualLog.somatic.bloating")} value={bloatingSeverity} onChange={setBloatingSeverity} />
          </section>

          {/* Point 4 — GI / inflammation */}
          <section className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground">{t("health.menstrualLog.gi.title")}</p>
            <div className="flex flex-wrap gap-4">
              <ToggleField label={t("health.menstrualLog.gi.diarrhea")} checked={giDiarrhea} onChange={setGiDiarrhea} />
              <ToggleField label={t("health.menstrualLog.gi.constipation")} checked={giConstipation} onChange={setGiConstipation} />
              <ToggleField label={t("health.menstrualLog.gi.acne")} checked={hormonalAcne} onChange={setHormonalAcne} />
            </div>
          </section>

          {/* Point 5 — Fertility */}
          <section className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground">{t("health.menstrualLog.fertility.title")}</p>
            <PillSelect
              label={t("health.menstrualLog.fertility.cervicalMucus")}
              value={cervicalMucus}
              options={MUCUS_OPTIONS}
              labels={mucusLabels}
              onChange={(v) => setCervicalMucus(v)}
            />
            <PillSelect
              label={t("health.menstrualLog.fertility.opk")}
              value={opkResult}
              options={OPK_OPTIONS}
              labels={opkLabels}
              onChange={(v) => setOpkResult(v)}
            />
          </section>

          {/* Point 6 — Mood */}
          <section className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground">{t("health.menstrualLog.mood.title")}</p>
            <SeverityRow label={t("health.menstrualLog.mood.tearfulness")} value={tearfulness} onChange={setTearfulness} />
            <SeverityRow label={t("health.menstrualLog.mood.anxiety")} value={anxietyLevel} onChange={setAnxietyLevel} />
            <SeverityRow label={t("health.menstrualLog.mood.volatility")} value={moodVolatility} onChange={setMoodVolatility} />
          </section>

          {/* Points 7-8 — Energy + Libido */}
          <section className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground/90">{t("health.menstrualLog.energy.title")}</span>
                <span className="rounded-md px-2 py-0.5 text-xs font-bold tabular-nums text-primary bg-primary/10" aria-hidden="true">
                  {energyLevel}/10
                </span>
              </div>
              <input type="range" min={1} max={10} step={1} value={energyLevel}
                onChange={(e) => setEnergyLevel(Number(e.target.value))}
                aria-label={t("health.menstrualLog.energy.title")} className="w-full accent-primary" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground/90">{t("health.menstrualLog.libido.title")}</span>
                <span className="rounded-md px-2 py-0.5 text-xs font-bold tabular-nums text-primary bg-primary/10" aria-hidden="true">
                  {libidoLevel}/10
                </span>
              </div>
              <input type="range" min={1} max={10} step={1} value={libidoLevel}
                onChange={(e) => setLibidoLevel(Number(e.target.value))}
                aria-label={t("health.menstrualLog.libido.title")} className="w-full accent-primary" />
            </div>
          </section>

          {/* Point 14 — Sensory overload */}
          <section className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground">{t("health.menstrualLog.sensory.title")}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <PillSelect label={t("health.menstrualLog.sensory.light")} value={lightSensitivity}
                options={SENSITIVITY_OPTIONS} labels={sensitivityLabels}
                onChange={(v) => setLightSensitivity(v ?? "NONE")} />
              <PillSelect label={t("health.menstrualLog.sensory.sound")} value={soundSensitivity}
                options={SENSITIVITY_OPTIONS} labels={sensitivityLabels}
                onChange={(v) => setSoundSensitivity(v ?? "NONE")} />
            </div>
          </section>

          {/* Notes */}
          <div className="border-t border-border pt-4">
            <label htmlFor="menstrual-log-notes" className="text-sm font-medium text-foreground/90">
              {t("health.menstrualLog.notesLabel")}
            </label>
            <textarea
              id="menstrual-log-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("dashboard.symptoms.placeholder")}
              maxLength={2000}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          {savedOk && <p className="text-sm text-emerald-600 dark:text-emerald-400" role="status">{t("health.menstrualLog.savedOk")}</p>}

          <Button type="submit" disabled={saving} className="w-full min-h-12 text-base">
            {saving ? (
              <>
                <HugeiconsIcon icon={Loading01Icon} className="me-2 h-5 w-5 animate-spin" aria-hidden="true" />
                {t("dashboard.save.saving")}
              </>
            ) : (
              t("health.menstrualLog.saveCta")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}