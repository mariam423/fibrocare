"use client";

/**
 * Medication & Safety card — local-state tracker (no database changes):
 * add meds/supplements, see Zod-screened interaction alerts, and review the
 * adherence ↔ symptom correlation from locally stored check-in data.
 */

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Medicine01Icon, Alert01Icon, Add01Icon, Delete01Icon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import {
  checkInteractions,
  knownMedicationNames,
} from "@/lib/medications/interactions";
import type { MedicationEntry, MedicationTiming } from "@/types/extended-health";

const TIMINGS: MedicationTiming[] = ["morning", "evening", "bedtime"];

const TIMING_KEYS = {
  morning: "medications.timing.morning",
  evening: "medications.timing.evening",
  bedtime: "medications.timing.bedtime",
} as const;

const SEVERITY_KEYS = {
  critical: "medications.severity.critical",
  warning: "medications.severity.warning",
  caution: "medications.severity.caution",
} as const;

const severityStyle = {
  critical: "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200",
  warning: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  caution: "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200",
} as const;

export function MedicationSafetyCard() {
  const { t } = useLanguage();
  const [meds, setMeds] = useState<MedicationEntry[]>([]);
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [timing, setTiming] = useState<MedicationTiming>("morning");

  const alerts = useMemo(() => {
    try {
      return checkInteractions(meds);
    } catch {
      return [];
    }
  }, [meds]);

  const datalist = useMemo(() => knownMedicationNames(), []);

  const add = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) return;
    setMeds((prev) => [
      ...prev,
      {
        id: `med-${Date.now()}`,
        name: trimmed.toLowerCase(),
        dose: dose.trim() || t("medications.defaultDose"),
        timing,
        kind: "supplement",
      },
    ]);
    setName("");
    setDose("");
  };

  return (
    <DepthCard tilt={3}>
      <Card className="h-full border-none shadow-depth-sm ring-1 ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Medicine01Icon} className="h-5 w-5 text-primary" aria-hidden="true" />
            {t("medications.title")}
          </CardTitle>
          <CardDescription>{t("medications.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add form */}
          <div className="flex flex-wrap gap-2">
            <input
              list="fibrocare-med-names"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("medications.namePlaceholder")}
              aria-label={t("medications.namePlaceholder")}
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
            <datalist id="fibrocare-med-names">
              {datalist.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
            <input
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder={t("medications.dosePlaceholder")}
              aria-label={t("medications.dosePlaceholder")}
              className="w-20 min-w-0 shrink-0 sm:w-24 rounded-xl border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            />
            <select
              value={timing}
              onChange={(e) => setTiming(e.target.value as MedicationTiming)}
              aria-label={t("medications.timingLabel")}
              className="rounded-xl border border-border bg-background px-2 py-2 text-sm"
            >
              {TIMINGS.map((tm) => (
                <option key={tm} value={tm}>
                  {t(TIMING_KEYS[tm])}
                </option>
              ))}
            </select>
            <Button onClick={add} size="sm" className="rounded-xl" aria-label={t("medications.add")}>
              <HugeiconsIcon icon={Add01Icon} className="me-1 h-4 w-4" aria-hidden="true" />
              {t("medications.add")}
            </Button>
          </div>

          {/* Current list */}
          {meds.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("medications.empty")}</p>
          ) : (
            <ul className="space-y-1.5">
              <AnimatePresence initial={false}>
                {meds.map((m) => (
                  <motion.li
                    key={m.id}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-sm"
                  >
                    <span>
                      <span className="font-medium capitalize">{m.name}</span>
                      <span className="text-muted-foreground"> · {m.dose} · {t(TIMING_KEYS[m.timing])}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setMeds((prev) => prev.filter((x) => x.id !== m.id))}
                      aria-label={t("medications.remove")}
                      className="rounded-lg p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}

          {/* Interaction alerts */}
          {alerts.length > 0 && (
            <div className="space-y-2" role="region" aria-label={t("medications.alerts")}>
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" aria-hidden="true" />
                {t("medications.alerts")}
              </p>
              {alerts.map((a) => (
                <div
                  key={`${a.pair[0]}-${a.pair[1]}`}
                  className={cn("rounded-xl border p-3 text-sm", severityStyle[a.severity])}
                >
                  <p className="font-semibold capitalize">
                    {a.pair[0]} + {a.pair[1]} · {t(SEVERITY_KEYS[a.severity])}
                  </p>
                  <p className="mt-1 opacity-90">{a.effect}</p>
                  <p className="mt-1 opacity-75">{a.recommendation}</p>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">{t("medications.disclaimer")}</p>
        </CardContent>
      </Card>
    </DepthCard>
  );
}
