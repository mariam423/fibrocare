"use client";

import React, { useState, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface Medication {
  id: string;
  tKey: TranslationKey;
  nextDose: string;
}

const MEDICATIONS: Medication[] = [
  { id: "morning", tKey: "medication.morningSupplement", nextDose: "8:00 AM" },
  { id: "pain", tKey: "medication.painRelief", nextDose: "2:00 PM" },
  { id: "evening", tKey: "medication.eveningMag", nextDose: "9:00 PM" },
];

function getNextCountdown(nextDose: string): string {
  const now = new Date();
  const [time, period] = nextDose.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);

  const diff = target.getTime() - now.getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
}

export function MedicationTrackerCard() {
  const { t } = useLanguage();
  const [taken, setTaken] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setTaken((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <div className="p-6">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-slate-100">
          {t("medication.title")}
        </h3>
        <p className="text-sm text-slate-400">
          {t("medication.subtitle")}
        </p>
      </div>
      <div className="space-y-3">
        {MEDICATIONS.map((med) => {
          const isTaken = taken.has(med.id);
          return (
            <button
              key={med.id}
              type="button"
              onClick={() => toggle(med.id)}
              className={cn(
                "flex items-center gap-3 w-full rounded-xl py-3 px-4 text-left transition-all duration-200",
                isTaken
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              )}
            >
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors duration-200",
                  isTaken
                    ? "text-emerald-400"
                    : "text-slate-400"
                )}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium transition-colors duration-200 truncate",
                    isTaken
                      ? "text-emerald-300 line-through"
                      : "text-slate-100"
                  )}
                >
                  {t(med.tKey)}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <HugeiconsIcon
                    icon={Clock01Icon}
                    className="h-3 w-3 text-slate-400 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-xs text-slate-400 truncate">
                    {med.nextDose}
                  </span>
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  isTaken
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-emerald-400/10 text-emerald-300"
                )}
              >
                {isTaken ? t("medication.taken") : t("medication.pending")}
              </span>
            </button>
          );
        })}

        {/* Next dose countdown */}
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
          <HugeiconsIcon
            icon={Clock01Icon}
            className="h-4 w-4 text-emerald-400"
            aria-hidden="true"
          />
          <span className="text-xs font-medium text-emerald-300">
            {t("medication.nextDose")} {getNextCountdown(MEDICATIONS.find((m) => !taken.has(m.id))?.nextDose ?? MEDICATIONS[0].nextDose)}
          </span>
        </div>
      </div>
    </div>
  );
}
