"use client";

/**
 * The patient's own personal trigger list. Each entry stores a severity and
 * an encrypted reaction note; the normalization and severity bounds are
 * enforced server-side again in the action. Live foods typed in the logger
 * are matched against this list as they are entered.
 */

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  CheckmarkCircle01Icon,
  Delete01Icon,
  Loading01Icon,
  NutIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { SegmentedFilter, type SegmentedFilterOption } from "@/components/ui/SegmentedFilter";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { addTriggerFood, getTriggerFoods, removeTriggerFood } from "@/app/diet/actions";
import type { TriggerFoodEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

const SEVERITY_LEVELS: Array<{ level: number; tKey: TranslationKey; pill: string }> = [
  { level: 1, tKey: "diet.triggers.severity.level1", pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  { level: 2, tKey: "diet.triggers.severity.level2", pill: "bg-lime-500/10 text-lime-700 dark:text-lime-300" },
  { level: 3, tKey: "diet.triggers.severity.level3", pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  { level: 4, tKey: "diet.triggers.severity.level4", pill: "bg-orange-500/10 text-orange-700 dark:text-orange-300" },
  { level: 5, tKey: "diet.triggers.severity.level5", pill: "bg-rose-500/10 text-rose-700 dark:text-rose-300" },
];

export function PersonalTriggerList() {
  const { t } = useLanguage();

  const [triggers, setTriggers] = useState<TriggerFoodEntry[]>([]);
  const [name, setName] = useState("");
  const [severity, setSeverity] = useState(3);
  const [reactionNote, setReactionNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getTriggerFoods().then((res) => {
      if (!cancelled && res.success) setTriggers(res.data?.triggers ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const severityOptions = useMemo<SegmentedFilterOption[]>(
    () =>
      SEVERITY_LEVELS.map((s) => ({
        value: String(s.level),
        label: t(s.tKey),
        tone: s.level >= 4 ? "rose" : s.level === 3 ? "amber" : "emerald",
      })),
    [t]
  );

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed || isAdding) return;
    setIsAdding(true);
    try {
      const res = await addTriggerFood({
        name: trimmed,
        severity,
        reactionNote: reactionNote.trim() || undefined,
      });
      if (res.success && res.data) {
        const reloaded = await getTriggerFoods();
        if (reloaded.success) setTriggers(reloaded.data?.triggers ?? []);
        setName("");
        setReactionNote("");
      } else if (res.success && !res.data) {
        const reloaded = await getTriggerFoods();
        if (reloaded.success) setTriggers(reloaded.data?.triggers ?? []);
        setName("");
      }
    } catch (error) {
      console.error("Error adding trigger:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (pendingRemove === id) {
      const res = await removeTriggerFood(id);
      if (res.success) {
        setTriggers((prev) => prev.filter((tr) => tr.id !== id));
        setPendingRemove(null);
        setRemoved(true);
        setTimeout(() => setRemoved(false), 2000);
      }
      return;
    }
    setPendingRemove(id);
    setTimeout(() => setPendingRemove((curr) => (curr === id ? null : curr)), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="space-y-2.5">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">{t("diet.triggers.name")}</span>
          <input
            type="text"
            dir="auto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handleAdd()}
            placeholder={t("diet.triggers.namePlaceholder")}
            aria-label={t("diet.triggers.name")}
            className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none transition-all duration-200 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/25"
          />
        </label>

        <div>
          <p className="text-xs font-semibold text-muted-foreground">{t("diet.triggers.severity")}</p>
          <SegmentedFilter
            options={severityOptions}
            value={String(severity)}
            onChange={(v) => setSeverity(Number(v))}
            label={t("diet.triggers.severity")}
            className="mt-1.5 w-full"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">{t("diet.triggers.severity.hint")}</p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">{t("diet.triggers.reactionNote")}</span>
          <textarea
            dir="auto"
            value={reactionNote}
            onChange={(e) => setReactionNote(e.target.value)}
            placeholder={t("diet.triggers.reactionNotePlaceholder")}
            rows={2}
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/25"
          />
        </label>

        <motion.button
          type="button"
          onClick={handleAdd}
          disabled={isAdding || !name.trim()}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/90 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
        >
          {isAdding ? (
            <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" aria-hidden="true" />
          )}
          {isAdding ? t("diet.triggers.adding") : t("diet.triggers.add")}
        </motion.button>
      </div>

      {/* List */}
      {triggers.length === 0 ? (
        <p className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
          <HugeiconsIcon icon={NutIcon} className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          {t("diet.triggers.empty")}
        </p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {triggers.map((trigger) => {
              const level = SEVERITY_LEVELS[trigger.severity - 1] ?? SEVERITY_LEVELS[2];
              const isPending = pendingRemove === trigger.id;
              return (
                <motion.li
                  key={trigger.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="rounded-xl border border-border/70 bg-card/60 px-3 py-2.5 backdrop-blur-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-foreground capitalize" dir="auto">
                        {trigger.name}
                      </p>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          level.pill
                        )}
                      >
                        {t(level.tKey)}
                      </span>
                      {trigger.reactionNote && (
                        <p className="flex items-start gap-1 text-xs text-muted-foreground" dir="auto">
                          <HugeiconsIcon icon={SparklesIcon} className="mt-0.5 h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
                          {trigger.reactionNote}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(trigger.id)}
                      aria-label={t("diet.triggers.remove")}
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors cursor-pointer",
                        isPending
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      )}
                    >
                      {isPending ? (
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <AnimatePresence>
        {removed && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="text-center text-xs font-medium text-primary"
            role="status"
            aria-live="polite"
          >
            {t("diet.triggers.removed")}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}