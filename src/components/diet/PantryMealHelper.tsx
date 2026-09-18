"use client";

/**
 * PantryMealHelper — one-click anti-inflammatory meal swaps.
 *
 * For the "too tired to think about food" days: the user checks which
 * pantry staples they have, and the helper instantly surfaces the
 * 5-minute, muscle-soothing, anti-inflammatory meals they can actually
 * make — no decisions, no shopping, no cooking marathon.
 *
 * Everything runs through the pure engine in `src/lib/diet/pantryMeals.ts`
 * (pure matching + ranking, unit-testable); this component only owns UI
 * state. Selection persists in localStorage so the list survives the
 * session. Fully localized (EN/AR-RTL) and responsive.
 */

import React, { useCallback, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CarrotIcon,
  CookingPotIcon,
  Loading01Icon,
  TimerIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  PANTRY_INGREDIENTS,
  PANTRY_MEALS,
  matchMeals,
  type PantryIngredientId,
} from "@/lib/diet/pantryMeals";

const STORAGE_KEY = "fibrocare-pantry-selection";

export function PantryMealHelper() {
  const { t, locale } = useLanguage();
  const [selected, setSelected] = useLocalStorage<PantryIngredientId[]>(
    STORAGE_KEY,
    []
  );
  // Guard against hydration mismatch: localStorage reads differ between
  // server and client, so matched results render only post-hydration.
  // The setState-during-render pattern (same as GlobalNavHeader's
  // pathname watcher) flips this once without an effect body setState.
  const [mounted, setMounted] = useState(false);
  const [mountedTick, setMountedTick] = useState(0);
  if (mountedTick === 0) {
    setMountedTick(1);
  } else if (mountedTick === 1 && !mounted) {
    setMounted(true);
  }

  const matches = useMemo(
    () => (mounted ? matchMeals(selected, PANTRY_MEALS) : []),
    [mounted, selected]
  );

  const toggle = useCallback(
    (id: PantryIngredientId) => {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    },
    [setSelected]
  );

  return (
    <Card className="w-full border-emerald-500/20 bg-emerald-500/[0.03] backdrop-blur-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={CookingPotIcon} className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <CardTitle className="text-lg font-semibold">{t("pantry.title")}</CardTitle>
        </div>
        <CardDescription>{t("pantry.subtitle")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Ingredient checkboxes */}
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-foreground/90">
            {t("pantry.haveQuestion")}
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {PANTRY_INGREDIENTS.map((ing) => {
              const on = selected.includes(ing.id);
              return (
                <button
                  key={ing.id}
                  type="button"
                  onClick={() => toggle(ing.id)}
                  aria-pressed={on}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
                    on
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "border-border/70 text-muted-foreground hover:border-emerald-500/40 hover:bg-emerald-500/5"
                  )}
                >
                  {t(ing.labelTKey)}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Matched meals */}
        <div aria-live="polite">
          {!mounted ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" aria-hidden="true" />
              {t("pantry.loading")}
            </p>
          ) : matches.length === 0 ? (
            <p className="rounded-xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              {t("pantry.noMatch")}
            </p>
          ) : (
            <ul className="space-y-2">
              {matches.map((meal, i) => (
                <li
                  key={meal.id}
                  className="rounded-xl border border-border/60 bg-card/60 px-3.5 py-3 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {t(meal.labelTKey)}
                    </p>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                      <HugeiconsIcon icon={TimerIcon} className="h-3 w-3" aria-hidden="true" />
                      {t("pantry.minutes", { count: meal.minutes })}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground" dir={locale === "ar" ? "rtl" : "ltr"}>
                    {t(meal.howTKey)}
                  </p>
                  {i === 0 && (
                    <p className="mt-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      ★ {t("pantry.bestMatch")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground/80">
          <HugeiconsIcon icon={CarrotIcon} className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t("pantry.disclaimer")}
        </p>
      </CardContent>
    </Card>
  );
}
