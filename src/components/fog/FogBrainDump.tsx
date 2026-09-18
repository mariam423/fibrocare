"use client";

/**
 * FogBrainDump — the Fog Shield's "empty the static" tool.
 *
 * The patient types every swirling thought in, marks what's likely feeding
 * the fog, rates its intensity, and saves it. The text is AES-256-GCM
 * encrypted at rest, capped at 4000 characters, and never rendered back to
 * the screen — the dump is genuinely *out of the head*. Saving also reports
 * a calm gain to the Fog Shield hero sphere.
 */

import React, { useCallback, useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  NotebookIcon,
  EraserIcon,
  CheckmarkCircle01Icon,
  HistoryIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { localizeActionError } from "@/lib/actionErrors";
import { saveFogLog, getFogLogs } from "@/app/fog-shield/actions";
import { labelKeyForTrigger, FOG_TRIGGER_PRESETS } from "@/lib/fog/presets";
import { FOG_TRIGGERS_MAX } from "@/lib/validations/health";
import type { FogLogEntry } from "@/lib/types";

const DUMP_MAX = 4000;

interface FogBrainDumpProps {
  onSettled: (delta: number) => void;
}

function formatFogTime(iso: string | Date, locale: string) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const hr = locale === "ar" ? "ar-EG" : locale;
  try {
    if (sameDay) {
      return new Intl.DateTimeFormat(hr, { hour: "2-digit", minute: "2-digit" }).format(d);
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return new Intl.DateTimeFormat(hr, { hour: "2-digit", minute: "2-digit" }).format(d);
    }
    return new Intl.DateTimeFormat(hr, { day: "numeric", month: "short" }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

export function FogBrainDump({ onSettled }: FogBrainDumpProps) {
  const { t, locale } = useLanguage();
  const [text, setText] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<FogLogEntry[]>([]);

  useEffect(() => {
    let alive = true;
    void getFogLogs(6).then((res) => {
      if (alive && res.success && res.data) {
        setRecent(res.data.logs.slice(0, 3));
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const toggleTrigger = (id: string) => {
    setTriggers((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= FOG_TRIGGERS_MAX) return prev;
      return [...prev, id];
    });
  };

  const handleSave = useCallback(async () => {
    if (saving) return;
    const trimmed = text.trim();
    if (!trimmed && triggers.length === 0) {
      setError(t("fog.dump.needsOne"));
      return;
    }
    setSaving(true);
    setError(null);
    const res = await saveFogLog({
      intensity,
      triggers,
      brainDumpText: trimmed || undefined,
      copingToolUsed: "DUMP",
    });
    setSaving(false);
    if (res.success) {
      onSettled(0.35);
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 2600);
      if (res.data?.log) setRecent((prev) => [res.data!.log, ...prev].slice(0, 3));
    } else {
      setError(localizeActionError(res.error, "fog.save.failed", t));
    }
  }, [saving, text, triggers, intensity, onSettled, t]);

  const clearDump = () => {
    setText("");
    setTriggers([]);
    setIntensity(5);
    setError(null);
  };

  return (
    <Card className="h-full border border-amber-500/15 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
      <CardHeader className="border-b border-zinc-200/80 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 backdrop-blur-sm">
            <HugeiconsIcon icon={NotebookIcon} className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-xl text-zinc-900 dark:text-white font-semibold">
              {t("fog.dump.title")}
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              {t("fog.dump.subtitle")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5 sm:p-6">
        <label className="block">
          <span className="text-sm text-muted-foreground">{t("fog.dump.where")}</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, DUMP_MAX))}
            rows={5}
            spellCheck={false}
            className="mt-2 w-full resize-y rounded-xl border border-input bg-card/70 px-3 py-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-describedby="fog-dump-count"
          />
          <span id="fog-dump-count" className="mt-1 block text-end text-xs tabular-nums text-muted-foreground">
            {text.length}/{DUMP_MAX} {t("fog.dump.chars")}
          </span>
        </label>

        {/* Intensity */}
        <fieldset>
          <legend className="text-sm text-muted-foreground">
            {t("fog.dump.intensity")}: <span className="font-semibold text-foreground">{intensity}/10</span>
          </legend>
          <input
            type="range"
            min={1}
            max={10}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="mt-2 w-full accent-amber-600 dark:accent-amber-400"
          />
        </fieldset>

        {/* Triggers */}
        <fieldset>
          <legend className="text-sm text-muted-foreground">{t("fog.dump.triggers")}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {FOG_TRIGGER_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => toggleTrigger(preset.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  triggers.includes(preset.id)
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                    : "border-border bg-card/60 text-muted-foreground hover:bg-muted"
                )}
              >
                {t(preset.labelKey)}
              </button>
            ))}
          </div>
        </fieldset>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleSave} disabled={saving} className="rounded-full">
            <HugeiconsIcon icon={justSaved ? CheckmarkCircle01Icon : NotebookIcon} className="h-4 w-4" aria-hidden="true" />
            {justSaved ? t("fog.dump.saved") : saving ? t("fog.dump.saving") : t("fog.dump.save")}
          </Button>
          <Button variant="outline" size="sm" onClick={clearDump} disabled={!text && triggers.length === 0} className="rounded-full">
            <HugeiconsIcon icon={EraserIcon} className="h-4 w-4" aria-hidden="true" />
            {t("fog.dump.clear")}
          </Button>
        </div>

        {/* Recent fog */}
        {recent.length > 0 && (
          <div className="space-y-2 border-t border-zinc-200/80 pt-4 dark:border-white/5">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <HugeiconsIcon icon={HistoryIcon} className="h-3.5 w-3.5" aria-hidden="true" />
              {t("fog.dump.recent")}
            </p>
            <ul className="space-y-2">
              {recent.map((log) => (
                <li
                  key={log.id}
                  className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 px-3 py-2 text-sm"
                >
                  <span
                    className={cn(
                      "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold tabular-nums",
                      log.intensity >= 8
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-300"
                        : log.intensity >= 5
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        : "bg-teal-500/15 text-teal-700 dark:text-teal-300"
                    )}
                  >
                    {log.intensity}
                  </span>
                  <span className="flex-1 truncate text-muted-foreground">
                    {log.triggers.length > 0
                      ? log.triggers.slice(0, 2).map((tr) => t(labelKeyForTrigger(tr))).join(" · ")
                      : t("fog.dump.noTriggers")}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {formatFogTime(log.createdAt, locale)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}