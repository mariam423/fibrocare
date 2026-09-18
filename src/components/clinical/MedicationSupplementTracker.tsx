"use client";

/**
 * MedicationSupplementTracker — doses + adherence for the Clinical Centre.
 *
 * A personal schedule built from common fibromyalgia medications and
 * supplements (informational only — no dosing advice). A live "due now"
 * panel uses the pure `dueAt` helper against the current hour, and a
 * 7-day adherence bar shows how many scheduled doses were marked taken.
 * Persisted client-side via `useLocalStorage`; the periodic report engine
 * reads the same snapshot shape.
 */

import React, { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Delete01Icon,
  Medicine01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/translations";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  COMMON_MEDICATIONS,
  dueAt,
  hourKey,
  type MedicationDose,
} from "@/lib/clinical/trackers";

const FREQUENCY_KEYS: Record<MedicationDose["frequency"], TranslationKey> = {
  once: "clinical.meds.frequency.once",
  twice: "clinical.meds.frequency.twice",
  threeTimes: "clinical.meds.frequency.threeTimes",
  asNeeded: "clinical.meds.frequency.asNeeded",
};

interface ScheduleState {
  schedule: MedicationDose[];
  /** "medId|YYYY-MM-DD|HH" markers for adherence. */
  takenKeys: string[];
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function MedicationSupplementTracker() {
  const { t } = useLanguage();
  const [state, setState] = useLocalStorage<ScheduleState>("fibrocare:clinical:meds", {
    schedule: [],
    takenKeys: [],
  });

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const timeLabel = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
  const today = dayKey(now);

  const dueNow = useMemo(() => dueAt(state.schedule, timeLabel), [state.schedule, timeLabel]);

  const addedIds = useMemo(() => new Set(state.schedule.map((m) => m.id)), [state.schedule]);

  const adherence7d = useMemo(() => {
    let expected = 0;
    let takenCount = 0;
    for (let offset = 0; offset < 7; offset += 1) {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      const key = dayKey(d);
      for (const med of state.schedule) {
        if (med.frequency === "asNeeded") continue;
        for (const time of med.times) {
          expected += 1;
          if (state.takenKeys.includes(`${med.id}|${key}|${hourKey(time)}`)) {
            takenCount += 1;
          }
        }
      }
    }
    return expected === 0 ? null : Math.round((takenCount / expected) * 100);
  }, [state.schedule, state.takenKeys]);

  const addMed = (med: MedicationDose) => {
    if (addedIds.has(med.id)) return;
    setState({ schedule: [...state.schedule, med], takenKeys: state.takenKeys });
  };

  const removeMed = (id: string) => {
    setState({
      schedule: state.schedule.filter((m) => m.id !== id),
      takenKeys: state.takenKeys,
    });
  };

  const markTaken = (med: MedicationDose) => {
    const marker = `${med.id}|${today}|${hourKey(timeLabel)}`;
    if (state.takenKeys.includes(marker)) return;
    setState({ schedule: state.schedule, takenKeys: [...state.takenKeys, marker] });
  };

  const isTakenNow = (med: MedicationDose) =>
    state.takenKeys.includes(`${med.id}|${today}|${hourKey(timeLabel)}`);

  return (
    <section
      aria-label={t("clinical.meds.title")}
      className="w-full break-inside-avoid rounded-2xl border border-emerald-500/20 bg-white/70 p-5 shadow-lg shadow-emerald-950/10 backdrop-blur-xl dark:bg-slate-900/60"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
          <HugeiconsIcon icon={Medicine01Icon} className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("clinical.meds.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("clinical.meds.subtitle")}</p>
        </div>
      </div>

      {/* Due now */}
      <div className="mt-5 rounded-xl border border-border/60 bg-muted/30 p-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
          <bdi>{timeLabel}</bdi> · {t("clinical.meds.due")}
        </p>
        {dueNow.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">{t("clinical.meds.dueEmpty")}</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {dueNow.map((med) => {
              const taken = isTakenNow(med);
              return (
                <li
                  key={`${med.id}-${timeLabel}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/60 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{med.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {med.dose} {med.unit}
                    </p>
                  </div>
                  <Button
                    variant={taken ? "outline" : "default"}
                    size="sm"
                    disabled={taken}
                    onClick={() => markTaken(med)}
                    className="rounded-lg text-xs transition-all duration-200 active:scale-[0.95]"
                  >
                    <HugeiconsIcon
                      icon={taken ? CheckmarkCircle01Icon : CheckmarkCircle01Icon}
                      className="me-1 h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                    {taken
                      ? t("clinical.meds.taken")
                      : t("clinical.meds.markTaken")}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Adherence */}
      {adherence7d !== null && (
        <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">{t("clinical.meds.adherence")}</p>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              <bdi>{adherence7d}%</bdi>
            </p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" role="presentation">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${adherence7d}%` }}
            />
          </div>
        </div>
      )}

      {/* My schedule */}
      <h3 className="mt-5 text-sm font-semibold text-foreground">{t("clinical.meds.mySchedule")}</h3>
      {state.schedule.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">{t("clinical.meds.empty")}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {state.schedule.map((med) => (
            <li
              key={med.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/60 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{med.name}</p>
                <p className="text-xs text-muted-foreground">
                  {med.dose} {med.unit} · {t(FREQUENCY_KEYS[med.frequency])}
                  {med.times.length > 0 && ` · ${med.times.join(", ")}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMed(med.id)}
                aria-label={t("clinical.meds.remove", { name: med.name })}
                className="rounded-lg text-muted-foreground transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-600 active:scale-[0.95] dark:hover:text-rose-300"
              >
                <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Add from common list */}
      <h3 className="mt-5 text-sm font-semibold text-foreground">{t("clinical.meds.addTitle")}</h3>
      <div className="mt-2 flex flex-col gap-2">
        {COMMON_MEDICATIONS.filter((m) => !addedIds.has(m.id)).map((med) => (
          <div
            key={med.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border/60 px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{med.name}</p>
              <p className="text-xs text-muted-foreground">
                {med.dose} {med.unit} · {t(FREQUENCY_KEYS[med.frequency])}
                {med.times.length > 0 && ` · ${med.times.join(", ")}`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addMed(med)}
              aria-label={t("clinical.meds.addAria", { name: med.name })}
              className={cn(
                "rounded-lg text-emerald-700 dark:text-emerald-300 transition-all duration-200 hover:scale-[1.02] hover:border-emerald-500/50 hover:bg-emerald-500/10 active:scale-[0.95]"
              )}
            >
              <HugeiconsIcon icon={Add01Icon} className="me-1 h-3.5 w-3.5" aria-hidden="true" />
              {t("clinical.meds.add")}
            </Button>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">{t("clinical.meds.disclaimer")}</p>
    </section>
  );
}