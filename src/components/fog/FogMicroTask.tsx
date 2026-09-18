"use client";

/**
 * FogMicroTask — the Fog Shield's anti-overwhelm tool.
 *
 * One task that "feels too big right now" becomes up to three tiny, ordered
 * micro-steps via the deterministic `breakdownTask` engine. Fewer than three
 * steps get padded with universal low-load assist steps, each time across
 * the button reports a calm gain — ticking a step clears a little fog.
 * Optionally the session logs to the fog log as a MICROTASK coping event.
 */

import React, { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Task01Icon,
  MagicWand01Icon,
  CheckmarkCircle01Icon,
  CheckListIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { localizeActionError } from "@/lib/actionErrors";
import { breakdownTask, type MicroStep } from "@/lib/fog/microTasks";
import { saveFogLog } from "@/app/fog-shield/actions";
import type { TranslationKey } from "@/lib/translations";

const TARGET_STEPS = 3;

interface FogMicroTaskProps {
  onSettled: (delta: number) => void;
}

/** Translated universal assist steps, padded to reach exactly three. */
function assistSteps(
  task: string,
  t: (key: TranslationKey, params?: Record<string, string>) => string
): MicroStep[] {
  const theTask = task.trim() || t("fog.microtask.theTask");
  return [
    { label: t("fog.microtask.assist1", { task: theTask }) },
    { label: t("fog.microtask.assist2") },
    { label: t("fog.microtask.assist3") },
  ];
}

export function FogMicroTask({ onSettled }: FogMicroTaskProps) {
  const { t } = useLanguage();
  const [task, setTask] = useState("");
  const [steps, setSteps] = useState<MicroStep[] | null>(null);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [cleared, setCleared] = useState(false);
  const [logThis, setLogThis] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doneCount = useMemo(
    () => (steps ? steps.filter((_, i) => done[i]).length : 0),
    [steps, done]
  );

  const split = () => {
    const raw = task.trim();
    if (!raw) return;
    const broken = breakdownTask(raw);
    const padded =
      broken.length >= TARGET_STEPS
        ? broken.slice(0, TARGET_STEPS)
        : [...broken, ...assistSteps(raw, t)].slice(0, TARGET_STEPS);
    setSteps(padded);
    setDone({});
    setCleared(false);
    setSaved(false);
    setError(null);
  };

  const tick = async (index: number) => {
    if (!steps) return;
    if (done[index]) return;
    const next: Record<number, boolean> = { ...done, [index]: true };
    setDone(next);
    onSettled(0.25);
    const allDone =
      steps.length === 0
        ? false
        : steps.every((_, i) => next[i] === true);
    if (allDone) {
      setCleared(true);
      if (logThis) {
        setSaving(true);
        const res = await saveFogLog({
          intensity: 5,
          triggers: [],
          brainDumpText: task.trim() || undefined,
          copingToolUsed: "MICROTASK",
        });
        setSaving(false);
        if (res.success) {
          setSaved(true);
          onSettled(0.2);
        } else {
          setError(localizeActionError(res.error, "fog.save.failed", t));
        }
      }
    }
  };

  const restart = () => {
    setTask("");
    setSteps(null);
    setDone({});
    setCleared(false);
    setSaved(false);
    setError(null);
  };

  return (
    <Card className="h-full border border-sky-500/15 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
      <CardHeader className="border-b border-zinc-200/80 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10 backdrop-blur-sm">
            <HugeiconsIcon icon={Task01Icon} className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-xl text-zinc-900 dark:text-white font-semibold">
              {t("fog.microtask.title")}
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              {t("fog.microtask.subtitle")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5 sm:p-6">
        {steps === null ? (
          <>
            <label className="block">
              <span className="text-sm text-muted-foreground">{t("fog.microtask.prompt")}</span>
              <input
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    split();
                  }
                }}
                placeholder={t("fog.microtask.placeholder")}
                className="mt-2 w-full rounded-xl border border-input bg-card/70 px-3 py-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
            <Button onClick={split} disabled={!task.trim()} className="w-full rounded-full">
              <HugeiconsIcon icon={MagicWand01Icon} className="h-4 w-4" aria-hidden="true" />
              {t("fog.microtask.breakdown")}
            </Button>
          </>
        ) : (
          <>
            <ol className="space-y-2" aria-label={t("fog.microtask.title")}>
              {steps.map((step, i) => {
                const isDone = !!done[i];
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => tick(i)}
                      disabled={cleared || isDone}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-start text-sm transition-colors",
                        isDone
                          ? "border-teal-500/30 bg-teal-500/5"
                          : "border-border bg-card/60 hover:bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                          isDone
                            ? "border-teal-500 bg-teal-500 text-white"
                            : "border-muted-foreground/40 bg-transparent"
                        )}
                        aria-hidden="true"
                      >
                        {isDone && <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-3.5 w-3.5" />}
                      </span>
                      <span className="flex-1">
                        <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {t("fog.microtask.step")} {i + 1}
                        </span>
                        <span className={cn(isDone && "text-muted-foreground line-through")}>{step.label}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {cleared ? (
              <p className="flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-300" aria-live="polite">
                <HugeiconsIcon icon={CheckListIcon} className="h-4 w-4" aria-hidden="true" />
                {saved
                  ? t("fog.microtask.saved")
                  : error ?? t("fog.microtask.allDone")}
              </p>
            ) : (
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={logThis}
                  onChange={(e) => setLogThis(e.target.checked)}
                  className="h-4 w-4 accent-sky-600 dark:accent-sky-400"
                />
                {t("fog.microtask.saveToggle")}
              </label>
            )}

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      doneCount >= TARGET_STEPS ? "bg-teal-500" : "bg-sky-500"
                    )}
                    style={{ width: `${(doneCount / TARGET_STEPS) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {doneCount}/{TARGET_STEPS}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={restart} disabled={saving} className="rounded-full">
                {t("fog.microtask.newTask")}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}