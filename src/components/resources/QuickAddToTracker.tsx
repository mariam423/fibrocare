"use client";

/**
 * "Add to today's tracker" panel for the Treatment page.
 *
 * Each self-care strategy (and a medication row) gets a one-tap "Add to
 * log" action that saves a pain-log entry through the existing server
 * action — current pain from HealthContext, the strategy as the note and
 * symptom, mood labeled "Self-Care" so it renders localized in the health
 * log. Guests get a gentle sign-in message instead of a hard failure.
 */

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  ActivityIcon,
  BedIcon,
  BathtubIcon,
  DropletIcon,
  RunningShoesIcon,
  PillIcon,
  PlusSignIcon,
  CheckmarkCircle02Icon,
  Loading01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { useHealth } from "@/context/HealthContext";
import { cn } from "@/lib/utils";
import { savePainLog } from "@/app/actions";
import type { TranslationKey } from "@/lib/translations";

const ITEMS: Array<{
  id: string;
  labelKey: TranslationKey;
  icon: IconSvgElement;
}> = [
  { id: "pacing", labelKey: "treatment.quickAdd.item.pacing", icon: ActivityIcon },
  { id: "rest", labelKey: "treatment.quickAdd.item.rest", icon: BedIcon },
  { id: "warm", labelKey: "treatment.quickAdd.item.warm", icon: BathtubIcon },
  { id: "hydration", labelKey: "treatment.quickAdd.item.hydration", icon: DropletIcon },
  {
    id: "movement",
    labelKey: "treatment.quickAdd.item.movement",
    icon: RunningShoesIcon,
  },
  {
    id: "medication",
    labelKey: "treatment.quickAdd.item.medication",
    icon: PillIcon,
  },
];

/** Mood tag stored on the log row; health-logs maps it to a localized key. */
const TRACKER_MOOD = "Self-Care";

export function QuickAddToTracker() {
  const { t } = useLanguage();
  const { currentPainLevel } = useHealth();
  const [saving, setSaving] = useState<string | null>(null);
  const [added, setAdded] = useState<Record<string, boolean>>({});

  const addToTracker = async (id: string, labelKey: TranslationKey) => {
    if (saving) return;
    setSaving(id);
    const label = t(labelKey);
    try {
      const result = await savePainLog(currentPainLevel, TRACKER_MOOD, label, [label]);
      if (result.success) {
        setAdded((prev) => ({ ...prev, [id]: true }));
        toast.success(t("treatment.quickAdd.added"));
      } else if (result.error === "You must be signed in.") {
        toast.error(t("treatment.quickAdd.signIn"));
      } else {
        toast.error(t("treatment.quickAdd.error"));
      }
    } catch {
      toast.error(t("treatment.quickAdd.error"));
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
      <p className="text-sm font-semibold text-foreground">{t("treatment.quickAdd.title")}</p>
      <p className="mt-1 text-xs text-muted-foreground">{t("treatment.quickAdd.subtitle")}</p>

      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ITEMS.map((item) => {
          const isSaving = saving === item.id;
          const isAdded = added[item.id];
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => void addToTracker(item.id, item.labelKey)}
                disabled={isSaving}
                aria-busy={isSaving}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-start transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
                  isAdded
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-border/60 bg-card/50 hover:border-emerald-400/30 hover:bg-emerald-500/5"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    isAdded
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <HugeiconsIcon icon={item.icon} className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 text-sm text-foreground/90">
                  {t(item.labelKey)}
                </span>
                {isSaving ? (
                  <HugeiconsIcon
                    icon={Loading01Icon}
                    className="h-4 w-4 shrink-0 animate-spin text-muted-foreground"
                    aria-hidden="true"
                  />
                ) : isAdded ? (
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="h-4 w-4 shrink-0 text-emerald-500"
                    aria-hidden="true"
                  />
                ) : (
                  <HugeiconsIcon
                    icon={PlusSignIcon}
                    className="h-4 w-4 shrink-0 text-muted-foreground/60"
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
