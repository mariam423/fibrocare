"use client";

/**
 * Smart meal warnings — renders the personal + known trigger set for a meal,
 * with an anti-inflammatory swap suggestion for known categories. Used both
 * live (as the user types foods in the logger) and for the warning snapshot
 * stored on each saved meal.
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  LeafIcon,
  SaladIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { suggestSwapForKnown } from "@/lib/diet/triggerEngine";
import { cn } from "@/lib/utils";

const KNOWN_WARN_PREFIX = "diet.warn.known.";

export type WarningModel =
  | {
      kind: "personal";
      id: string;
      label: string;
      severity: number;
      matchedFood?: string;
    }
  | {
      kind: "known";
      id: string;
      labelKey: TranslationKey;
      matchedFood?: string;
    };

/** Parse the persisted `warningsJson` snapshot into display models. */
export function parseStoredWarnings(json: string): WarningModel[] {
  try {
    const raw = JSON.parse(json) as unknown;
    if (!Array.isArray(raw)) return [];
    const result: WarningModel[] = [];
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      if (rec.kind === "personal" && typeof rec.id === "string") {
        result.push({
          kind: "personal",
          id: rec.id,
          label: typeof rec.label === "string" ? rec.label : "",
          severity: typeof rec.severity === "number" ? rec.severity : 3,
          matchedFood: typeof rec.matchedFood === "string" ? rec.matchedFood : undefined,
        });
      } else if (
        rec.kind === "known" &&
        typeof rec.id === "string" &&
        typeof rec.labelKey === "string" &&
        rec.labelKey.startsWith(KNOWN_WARN_PREFIX)
      ) {
        result.push({
          kind: "known",
          id: rec.id,
          labelKey: rec.labelKey as TranslationKey,
          matchedFood: typeof rec.matchedFood === "string" ? rec.matchedFood : undefined,
        });
      }
    }
    return result;
  } catch {
    return [];
  }
}

interface TriggerWarningsProps {
  warnings: WarningModel[];
  compact?: boolean;
}

export function TriggerWarnings({ warnings, compact = false }: TriggerWarningsProps) {
  const { t, dir } = useLanguage();

  if (warnings.length === 0) {
    return (
      <AnimatePresence initial={false}>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-300"
          role="status"
        >
          <HugeiconsIcon icon={SaladIcon} className="h-4 w-4 shrink-0" aria-hidden="true" />
          {t("diet.warnings.none")}
        </motion.p>
      </AnimatePresence>
    );
  }

  if (compact) {
    return (
      <ul className="space-y-1.5">
        {warnings.map((warning) => {
          const isKnown = warning.kind === "known";
          const title = isKnown ? t(warning.labelKey) : warning.label;
          return (
            <li key={`${warning.kind}:${warning.id}`} className="flex items-start gap-1.5 text-xs leading-relaxed">
              <HugeiconsIcon
                icon={isKnown ? LeafIcon : SaladIcon}
                className={cn(
                  "mt-0.5 h-3.5 w-3.5 shrink-0",
                  isKnown ? "text-amber-500" : "text-rose-500"
                )}
                aria-hidden="true"
              />
              <span dir="auto">
                {title}
                {!isKnown && (
                  <span className="ms-1 text-[10px] text-rose-600 dark:text-rose-400">
                    {t("diet.warn.personal")}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-sm font-medium text-amber-800 dark:text-amber-200">
        <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4 shrink-0" aria-hidden="true" />
        {t("diet.warnings.some")}
      </p>
      <ul className="space-y-2">
        {warnings.map((warning) => {
          const isKnown = warning.kind === "known";
          const title = isKnown ? t(warning.labelKey) : warning.label;
          const swap = isKnown ? suggestSwapForKnown(warning.id) : null;
          return (
            <motion.li
              key={`${warning.kind}:${warning.id}`}
              initial={{ opacity: 0, x: dir === "rtl" ? 6 : -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-amber-500/20 bg-card/60 px-3 py-2.5 backdrop-blur-md"
            >
              <div className="flex items-start gap-2.5">
                <HugeiconsIcon
                  icon={LeafIcon}
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0",
                    isKnown
                      ? "text-amber-500"
                      : "text-rose-500"
                  )}
                  aria-hidden="true"
                />
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium text-foreground" dir="auto">
                    {title}
                    {!isKnown && (
                      <span className="ms-1.5 inline-flex text-[11px] text-rose-600 dark:text-rose-400">
                        {t("diet.warn.personal")}
                      </span>
                    )}
                  </p>
                  {swap && (
                    <p className="flex items-start gap-1.5 text-xs text-muted-foreground leading-relaxed">
                      <HugeiconsIcon icon={SparklesIcon} className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                      <span>
                        <span className="font-medium text-foreground">{t("diet.warnings.swap")}: </span>
                        {t(swap.swapKey)}
                        <span className="text-muted-foreground/70"> — {t(swap.reasonKey)}</span>
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}