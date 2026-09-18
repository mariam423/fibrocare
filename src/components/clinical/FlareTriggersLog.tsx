"use client";

/**
 * FlareTriggersLog — personal flare trigger journal for the Clinical Centre.
 *
 * Log each flare with its strength (0–10), the factors you suspect
 * (weather, stress, sleep, diet, activity, hormonal…) and a note. The pure
 * aggregations in `src/lib/clinical/trackers.ts` surface which factors
 * appear most often and which correlate with the strongest flares, and
 * entries feed the weekly/monthly report engine.
 */

import React, { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  BulbIcon,
  Delete01Icon,
  FlameIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/translations";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  FLARE_FACTORS,
  TRIGGER_GROUPS,
  factorAvgSeverity,
  factorFrequency,
  type FlareFactorId,
  type FlareTriggerEntry,
  type TriggerGroup,
} from "@/lib/clinical/trackers";

const GROUP_KEYS: Record<TriggerGroup, TranslationKey> = {
  weather: "clinical.trigger.group.weather",
  stress: "clinical.trigger.group.stress",
  sleep: "clinical.trigger.group.sleep",
  diet: "clinical.trigger.group.diet",
  activity: "clinical.trigger.group.activity",
  other: "clinical.trigger.group.other",
};

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function FlareTriggersLog() {
  const { t } = useLanguage();
  const [entries, setEntries] = useLocalStorage<FlareTriggerEntry[]>(
    "fibrocare:clinical:triggers",
    []
  );
  const [date, setDate] = useState(todayKey());
  const [severity, setSeverity] = useState(5);
  const [factors, setFactors] = useState<FlareFactorId[]>([]);
  const [note, setNote] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  const toggleFactor = (id: FlareFactorId) => {
    setFactors((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const addEntry = () => {
    const entry: FlareTriggerEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date,
      severity,
      factors,
      note: note.trim(),
    };
    setEntries([entry, ...entries]);
    setSeverity(5);
    setFactors([]);
    setNote("");
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const sorted = useMemo(
    () => [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [entries]
  );

  const insightRows = useMemo(
    () =>
      FLARE_FACTORS.map((factor) => {
        const count = factorFrequency(entries, factor.id);
        const avg = factorAvgSeverity(entries, factor.id);
        return { factor, count, avg };
      })
        .filter((row) => row.count > 0)
        .sort((a, b) => b.count - a.count || (b.avg ?? 0) - (a.avg ?? 0)),
    [entries]
  );

  return (
    <section
      aria-label={t("clinical.trigger.title")}
      className="w-full break-inside-avoid rounded-2xl border border-emerald-500/20 bg-white/70 p-5 shadow-lg shadow-emerald-950/10 backdrop-blur-xl dark:bg-slate-900/60"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
          <HugeiconsIcon icon={FlameIcon} className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("clinical.trigger.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("clinical.trigger.subtitle")}</p>
        </div>
      </div>

      {/* New entry */}
      <div className="mt-5 space-y-3 rounded-xl border border-border/60 bg-muted/30 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="flare-date" className="text-xs font-medium text-muted-foreground">
            {t("clinical.trigger.date")}
          </label>
          <input
            id="flare-date"
            type="date"
            value={date}
            max={todayKey()}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="flare-severity" className="text-xs font-medium text-muted-foreground">
              {t("clinical.trigger.severity")}
            </label>
            <span className="text-sm font-bold text-foreground">
              <bdi>{severity}</bdi>/10
            </span>
          </div>
          <Slider
            id="flare-severity"
            min={0}
            max={10}
            step={1}
            value={[severity]}
            onValueChange={(v) => setSeverity(typeof v === "number" ? v : (v[0] as number))}
            className="mt-2"
            indicatorClassName="bg-emerald-500"
            aria-label={t("clinical.trigger.severity")}
          />
          <p className="mt-1 text-[11px] text-muted-foreground">{t("clinical.trigger.severityHint")}</p>
        </div>

        <fieldset>
          <legend className="text-xs font-medium text-muted-foreground">
            {t("clinical.trigger.factors")}
          </legend>
          <div className="mt-2 space-y-2">
            {TRIGGER_GROUPS.map((group) => (
              <div key={group}>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {t(GROUP_KEYS[group])}
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {FLARE_FACTORS.filter((f) => f.group === group).map((factor) => {
                    const active = factors.includes(factor.id);
                    return (
                      <button
                        key={factor.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleFactor(factor.id)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-200 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "border-border bg-card/60 text-muted-foreground hover:border-emerald-400/30 hover:text-foreground"
                        )}
                      >
                        <span aria-hidden="true">{factor.emoji}</span>{" "}
                        {t(factor.labelTKey as TranslationKey)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="flare-note" className="text-xs font-medium text-muted-foreground">
            {t("clinical.trigger.note")}
          </label>
          <input
            id="flare-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("clinical.trigger.notePlaceholder")}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <Button
          onClick={addEntry}
          className="rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <HugeiconsIcon icon={Add01Icon} className="me-1 h-4 w-4" aria-hidden="true" />
          {justAdded ? t("clinical.trigger.added") : t("clinical.trigger.addEntry")}
        </Button>
      </div>

      {/* Insights */}
      {insightRows.length > 0 && (
        <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <HugeiconsIcon icon={BulbIcon} className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
            {t("clinical.trigger.insights")}
          </p>
          <ul className="mt-2 space-y-1">
            {insightRows.map(({ factor, count, avg }) => (
              <li
                key={factor.id}
                className="flex items-center justify-between gap-2 text-xs text-muted-foreground"
              >
                <span className="text-foreground/90">
                  <span aria-hidden="true">{factor.emoji}</span>{" "}
                  {t(factor.labelTKey as TranslationKey)}
                </span>
                <span className="shrink-0">
                  {t("clinical.trigger.frequencyLabel", { count })}
                  {avg !== null && ` · ${t("clinical.trigger.avgSeverity", { avg })}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* History */}
      <h3 className="mt-5 text-sm font-semibold text-foreground">{t("clinical.trigger.history")}</h3>
      {sorted.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">{t("clinical.trigger.empty")}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {sorted.map((entry) => (
            <li
              key={entry.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-border/50 bg-card/60 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  <bdi>{entry.date}</bdi> · <bdi>{entry.severity}</bdi>/10
                </p>
                {entry.factors.length > 0 && (
                  <p className="mt-0.5 flex flex-wrap gap-1">
                    {entry.factors.map((id) => {
                      const factor = FLARE_FACTORS.find((f) => f.id === id);
                      if (!factor) return null;
                      return (
                        <span
                          key={id}
                          className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                        >
                          <span aria-hidden="true">{factor.emoji}</span>{" "}
                          {t(factor.labelTKey as TranslationKey)}
                        </span>
                      );
                    })}
                  </p>
                )}
                {entry.note && (
                  <p className="mt-1 text-xs text-muted-foreground">{entry.note}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeEntry(entry.id)}
                aria-label={t("clinical.trigger.delete")}
                className="shrink-0 rounded-lg text-muted-foreground transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-600 active:scale-[0.95] dark:hover:text-rose-300"
              >
                <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}