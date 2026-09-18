"use client";

/**
 * Meal logger with real-time smart warnings. As foods are typed, the trigger
 * engine evaluates them against the known inflammatory groups and the user's
 * own persisted personal trigger list, and a timing nudge reacts to the
 * selected pre-meal energy level. Saved meals keep the warning snapshot that
 * was shown at save time.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Calendar01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Delete01Icon,
  EnergyIcon,
  Loading01Icon,
  Restaurant02Icon,
  SaladIcon,
  TimeSetting01Icon,
} from "@hugeicons/core-free-icons";
import { SegmentedFilter, type SegmentedFilterOption } from "@/components/ui/SegmentedFilter";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { deleteMealLog, getMealLogs, getTriggerFoods, saveMealLog } from "@/app/diet/actions";
import { computeWarnings, suggestEatingTiming } from "@/lib/diet/triggerEngine";
import type { MealLogEntry, MealType, TriggerFoodEntry } from "@/lib/types";
import { TriggerWarnings, parseStoredWarnings, type WarningModel } from "@/components/diet/TriggerWarnings";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MEAL_OPTIONS: Array<{ type: MealType; tKey: TranslationKey }> = [
  { type: "breakfast", tKey: "diet.logger.mealType.breakfast" },
  { type: "lunch", tKey: "diet.logger.mealType.lunch" },
  { type: "dinner", tKey: "diet.logger.mealType.dinner" },
  { type: "snack", tKey: "diet.logger.mealType.snack" },
];

const ENERGY_LEVELS: Array<{
  level: number;
  tKey: TranslationKey;
  color: string;
  ringColor: string;
  bgColor: string;
}> = [
  { level: 0, tKey: "diet.energy.exhausted", color: "text-red-500", ringColor: "ring-red-500/40", bgColor: "bg-red-500/10" },
  { level: 1, tKey: "diet.energy.low", color: "text-rose-400", ringColor: "ring-rose-400/40", bgColor: "bg-rose-400/10" },
  { level: 2, tKey: "diet.energy.moderate", color: "text-amber-400", ringColor: "ring-amber-400/40", bgColor: "bg-amber-400/10" },
  { level: 3, tKey: "diet.energy.good", color: "text-emerald-400", ringColor: "ring-emerald-400/40", bgColor: "bg-emerald-400/10" },
  { level: 4, tKey: "diet.energy.full", color: "text-emerald-500", ringColor: "ring-emerald-500/40", bgColor: "bg-emerald-500/10" },
];

interface DraftFood {
  id: string;
  name: string;
  amount: string;
}

function freshFood(): DraftFood {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: "", amount: "" };
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatMealTime(value: Date | string): string {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MealLogger() {
  const { t } = useLanguage();

  const [date, setDate] = useState(todayKey);
  const [time, setTime] = useState("");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [foods, setFoods] = useState<DraftFood[]>(() => [freshFood()]);
  const [energyBefore, setEnergyBefore] = useState(2);
  const [notes, setNotes] = useState("");
  const [personalTriggers, setPersonalTriggers] = useState<TriggerFoodEntry[]>([]);
  const [meals, setMeals] = useState<MealLogEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTriggerFoods().then((res) => {
      if (!cancelled && res.success) setPersonalTriggers(res.data?.triggers ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getMealLogs(date).then((res) => {
      if (!cancelled && res.success) setMeals(res.data?.meals ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [date]);

  const triggerItems = useMemo(
    () => personalTriggers.map((tr) => ({ id: tr.id, name: tr.name, severity: tr.severity })),
    [personalTriggers]
  );

  const liveWarnings = useMemo<WarningModel[]>(() => {
    const names = foods.map((f) => f.name.trim()).filter(Boolean);
    if (names.length === 0) return [];
    const matched = computeWarnings(names, triggerItems);
    return matched.map((m) =>
      m.kind === "personal"
        ? { kind: "personal" as const, id: m.id, label: m.label, severity: m.severity, matchedFood: m.matchedFood }
        : { kind: "known" as const, id: m.id, labelKey: m.labelKey, matchedFood: m.matchedFood }
    );
  }, [foods, triggerItems]);

  const timing = useMemo(() => suggestEatingTiming(energyBefore), [energyBefore]);

  const mealTypeOptions = useMemo<SegmentedFilterOption[]>(
    () => MEAL_OPTIONS.map((m) => ({ value: m.type, label: t(m.tKey) })),
    [t]
  );

  const updateFood = (id: string, patch: Partial<DraftFood>) => {
    setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const addFoodRow = () => setFoods((prev) => [...prev, freshFood()]);

  const removeFoodRow = (id: string) => {
    setFoods((prev) => {
      const next = prev.filter((f) => f.id !== id);
      return next.length > 0 ? next : [freshFood()];
    });
  };

  const resetForm = () => {
    setFoods([freshFood()]);
    setNotes("");
    setTime("");
    setSaved(false);
  };

  const handleSave = async () => {
    const items = foods
      .map((f) => ({ name: f.name.trim(), amount: f.amount.trim() || undefined }))
      .filter((f) => f.name.length > 0);
    if (items.length === 0) return;

    setIsSaving(true);
    try {
      const res = await saveMealLog({
        date,
        mealType,
        eatenAt: time ? new Date(`${date}T${time}`) : undefined,
        energyBefore,
        notes: notes.trim() || undefined,
        items,
      });
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
        const reloaded = await getMealLogs(date);
        if (reloaded.success) setMeals(reloaded.data?.meals ?? []);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving meal:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const requestDelete = (id: string) => {
    if (pendingDelete === id) {
      void confirmDelete(id);
      return;
    }
    setPendingDelete(id);
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    confirmTimer.current = setTimeout(() => setPendingDelete(null), 3000);
  };

  const confirmDelete = async (id: string) => {
    const res = await deleteMealLog(id);
    if (res.success) {
      setMeals((prev) => prev.filter((m) => m.id !== id));
      setPendingDelete(null);
    }
  };

  useEffect(() => {
    return () => {
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
    };
  }, []);

  return (
    <div className="space-y-5">
      {/* ── Basic fields ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">{t("diet.logger.date")}</span>
          <div className="relative">
            <HugeiconsIcon
              icon={Calendar01Icon}
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value || todayKey())}
              className="h-10 w-full rounded-xl border border-border bg-card ps-9 pe-3 text-sm outline-none transition-all duration-200 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/25"
            />
          </div>
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">{t("diet.logger.time")}</span>
          <div className="relative">
            <HugeiconsIcon
              icon={Clock01Icon}
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-card ps-9 pe-3 text-sm outline-none transition-all duration-200 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/25"
            />
          </div>
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">{t("diet.logger.mealType")}</span>
          <SegmentedFilter
            options={mealTypeOptions}
            value={mealType}
            onChange={(v) => setMealType(v as MealType)}
            label={t("diet.logger.mealType")}
            className="w-full"
          />
        </label>
      </div>

      {/* ── Food rows ────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">{t("diet.logger.foods")}</p>
        {foods.map((food, index) => (
          <div key={food.id} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/5 text-sm font-semibold text-primary"
            >
              {index + 1}
            </span>
            <input
              type="text"
              dir="auto"
              value={food.name}
              onChange={(e) => updateFood(food.id, { name: e.target.value })}
              placeholder={t("diet.logger.foodsPlaceholder")}
              aria-label={`${t("diet.logger.foods")} ${index + 1}`}
              className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-card px-3 text-sm outline-none transition-all duration-200 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/25"
            />
            <input
              type="text"
              dir="auto"
              value={food.amount}
              onChange={(e) => updateFood(food.id, { amount: e.target.value })}
              placeholder={t("diet.logger.amountPlaceholder")}
              aria-label={t("diet.logger.amount")}
              className="h-10 w-28 shrink-0 rounded-xl border border-border bg-card px-3 text-sm outline-none transition-all duration-200 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/25"
            />
            <button
              type="button"
              onClick={() => removeFoodRow(food.id)}
              aria-label={t("diet.logger.delete")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 cursor-pointer"
            >
              <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addFoodRow}
          className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary cursor-pointer"
        >
          <HugeiconsIcon icon={Add01Icon} className="h-3.5 w-3.5" aria-hidden="true" />
          {t("diet.logger.addFood")}
        </button>
      </div>

      {/* ── Energy before ────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground">{t("diet.logger.energyBefore")}</p>
        <div className="mt-2 grid grid-cols-5 gap-2">
          {ENERGY_LEVELS.map((el) => (
            <button
              key={el.level}
              type="button"
              onClick={() => setEnergyBefore(el.level)}
              aria-pressed={energyBefore === el.level}
              aria-label={t(el.tKey)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl border px-1 py-2.5 text-[11px] font-medium transition-all duration-200 cursor-pointer",
                energyBefore === el.level
                  ? cn("border-2", el.ringColor, el.bgColor, el.color, "font-semibold shadow-md")
                  : "border-border bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <HugeiconsIcon icon={EnergyIcon} className="h-4 w-4" aria-hidden="true" />
              <span className="truncate">{t(el.tKey)}</span>
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">{t("diet.logger.energyBefore.hint")}</p>
      </div>

      {/* ── Live warnings + timing nudge ─────────────────── */}
      <TriggerWarnings warnings={liveWarnings} />

      {foods.some((f) => f.name.trim()) && (
        <div className="flex items-start gap-2.5 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5">
          <HugeiconsIcon
            icon={TimeSetting01Icon}
            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <p className="text-sm text-foreground leading-relaxed">
            <span className="font-medium">{t(timing.tKey)}</span>
            <span className="text-muted-foreground"> — {t(timing.reasonKey)}</span>
            {timing.suggestedBeforeHour !== undefined && (
              <span className="mt-0.5 block text-xs font-medium text-primary">
                {t("diet.correlation.timing.later", { hour: timing.suggestedBeforeHour })}
              </span>
            )}
          </p>
        </div>
      )}

      {/* ── Notes + save ─────────────────────────────────── */}
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-muted-foreground">{t("diet.logger.notes")}</span>
        <textarea
          dir="auto"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("diet.logger.notesPlaceholder")}
          rows={2}
          className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/25"
        />
      </label>

      <motion.button
        type="button"
        onClick={handleSave}
        disabled={isSaving || !foods.some((f) => f.name.trim())}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/90 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer"
      >
        {isSaving ? (
          <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <HugeiconsIcon icon={Restaurant02Icon} className="h-4 w-4" aria-hidden="true" />
        )}
        {isSaving ? t("diet.logger.saving") : t("diet.logger.save")}
      </motion.button>

      <AnimatePresence>
        {saved && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center justify-center gap-1.5 text-center text-sm font-medium text-primary"
            role="status"
            aria-live="polite"
          >
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4" aria-hidden="true" />
            {t("diet.logger.saved")}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Saved meals for the selected date ────────────── */}
      {meals.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t("diet.logger.mealsLabel")}
          </p>
          {meals.map((meal) => {
            const stored = parseStoredWarnings(meal.warningsJson);
            const mealLabel = t(
              MEAL_OPTIONS.find((m) => m.type === meal.mealType)?.tKey ?? "diet.logger.mealType.snack"
            );
            const isPending = pendingDelete === meal.id;
            return (
              <motion.div
                key={meal.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="rounded-xl border border-border/70 bg-muted/40 px-3 py-2.5 backdrop-blur-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                      <span className="font-semibold text-foreground">{mealLabel}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatMealTime(meal.eatenAt)}
                      </span>
                      <span className={cn("text-xs font-medium", ENERGY_LEVELS[meal.energyBefore]?.color ?? "text-muted-foreground")}>
                        {t(ENERGY_LEVELS[meal.energyBefore]?.tKey ?? "diet.energy.moderate")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground" dir="auto">
                      {meal.items.map((item) => item.name).join(" · ")}
                    </p>
                    {meal.notes && (
                      <p className="text-xs text-muted-foreground/80 italic" dir="auto">
                        {meal.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {stored.length > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                        <HugeiconsIcon icon={SaladIcon} className="h-3 w-3" aria-hidden="true" />
                        {stored.length}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-3 w-3" aria-hidden="true" />
                        {t("diet.warnings.none")}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => requestDelete(meal.id)}
                      aria-label={t("diet.logger.delete")}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer",
                        isPending
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-card text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      )}
                    >
                      {isPending ? (
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
                {stored.length > 0 && (
                  <div className="mt-2">
                    <TriggerWarnings warnings={stored} compact />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}