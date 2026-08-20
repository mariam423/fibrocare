"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  FastWindIcon,
  Moon02Icon,
  BookOpen01Icon,
  BadgeCheckIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { useHealth } from "@/context/HealthContext";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface RecoveryCardProps {
  title: string;
  description: string;
  icon: IconSvgElement;
  actionLabel: string;
  onAction: () => void;
  color: "purple" | "teal" | "orange";
  /** Renders the action button in its "on" state (filled + aria-pressed). */
  active?: boolean;
}

const colorMap = {
  purple: {
    iconBg: "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300",
    hover: "hover:ring-2 hover:ring-purple-300/60 dark:hover:ring-purple-700/60",
    button: "hover:bg-purple-100/60 dark:hover:bg-purple-900/30",
  },
  teal: {
    iconBg: "bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-300",
    hover: "hover:ring-2 hover:ring-teal-300/60 dark:hover:ring-teal-700/60",
    button: "hover:bg-teal-100/60 dark:hover:bg-teal-900/30",
  },
  orange: {
    iconBg: "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-300",
    hover: "hover:ring-2 hover:ring-orange-300/60 dark:hover:ring-orange-700/60",
    button: "hover:bg-orange-100/60 dark:hover:bg-orange-900/30",
  },
};

// Shared neutral card surface. The exact layout spec lives on the Card
// element (p-4 comes from the Card; CardContent below is a zero-padding
// flex wrapper so we don't double-pad). `overflow-visible` (after the base
// Card's overflow-hidden) guarantees no titles, descriptions, or inputs are
// ever clipped or hidden.
const cardSurface =
  "h-full flex flex-col justify-between p-4 rounded-2xl border border-border bg-card backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-visible transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.4),0_0_24px_rgba(16,185,129,0.16)] hover:border-emerald-400/30";

export function RecoveryCard({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  color,
  active = false,
}: RecoveryCardProps) {
  const colors = colorMap[color];
  return (
    <DepthCard tilt={4} className="h-full">
      <Card
        className={cn(
          cardSurface,
          colors.hover,
          active &&
            "ring-2 ring-emerald-500/60 dark:ring-emerald-400/50 hover:ring-emerald-500/60 dark:hover:ring-emerald-400/50"
        )}
      >
        <CardContent className="flex h-full flex-col justify-between p-0">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-xl p-2.5",
                colors.iconBg
              )}
            >
              <HugeiconsIcon
                icon={icon}
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold leading-snug text-foreground">
                {title}
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-1 flex-col min-h-0">
            <div className="mt-auto pt-2 w-full">
              <Button
                size="sm"
                variant="ghost"
                onClick={onAction}
                aria-pressed={active}
                className={cn(
                  "h-auto min-h-7 w-full whitespace-normal break-words leading-snug px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200",
                  active
                    ? "bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300"
                    : colors.button
                )}
              >
                {actionLabel}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </DepthCard>
  );
}

const QUICK_GRATITUDES: TranslationKey[] = [
  "recovery.gratitude.chip1",
  "recovery.gratitude.chip2",
  "recovery.gratitude.chip3",
];

function GratitudeJournalCard() {
  const { t } = useLanguage();
  const [entry, setEntry] = useState("");
  const [selected, setSelected] = useState<TranslationKey[]>([]);
  const [saved, setSaved] = useState(false);

  const canSave = entry.trim().length > 0 || selected.length > 0;

  const toggleChip = (label: TranslationKey) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleSave = () => {
    if (!canSave) return;
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setEntry("");
      setSelected([]);
    }, 1800);
  };

  return (
    <DepthCard tilt={4} className="h-full">
      <Card
        className={cn(
          cardSurface,
          "hover:ring-2 hover:ring-emerald-300/60 dark:hover:ring-emerald-700/60"
        )}
      >
        <CardContent className="flex h-full flex-col justify-between p-0">
          <div className="flex items-start gap-3">
            <div className="flex shrink-0 items-center justify-center rounded-xl p-2.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              <HugeiconsIcon
                icon={BookOpen01Icon}
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold leading-snug text-foreground">
                {t("recovery.gratitude.title")}
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {t("recovery.gratitude.description")}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-1 flex-col min-h-0">
            {/* Quick-select chips: tap to toggle gratitude prompts */}
            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label={t("recovery.gratitude.ariaLabel")}
            >
              {QUICK_GRATITUDES.map((label) => {
                const isSelected = selected.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleChip(label)}
                    className={cn(
                      "inline-flex items-center gap-1 h-8 rounded-full border px-3 text-[11px] font-medium transition-all duration-200 active:scale-[0.97] cursor-pointer",
                      isSelected
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                        : "border-emerald-800/60 bg-emerald-950/20 text-emerald-200 hover:border-emerald-600"
                    )}
                  >
                    {isSelected && (
                      <HugeiconsIcon
                        icon={BadgeCheckIcon}
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    )}
                    {t(label)}
                  </button>
                );
              })}
            </div>

            <label htmlFor="gratitude-input" className="sr-only">
              {t("recovery.gratitude.textareaLabel")}
            </label>
            <textarea
              id="gratitude-input"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder={t("recovery.gratitude.placeholder")}
              className="w-full h-24 min-h-[90px] p-2.5 text-xs rounded-xl border border-emerald-800/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-950/20 text-slate-100 placeholder:text-slate-400 resize-none my-2 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-emerald-700/40"
            />
            <div className="mt-auto pt-2 w-full">
              <Button
                data-a11y="gratitude-save"
                onClick={handleSave}
                disabled={!canSave}
                className={cn(
                  "w-full py-2 px-3 whitespace-normal break-words leading-snug text-xs font-medium rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition-colors",
                  saved && "bg-emerald-800 hover:bg-emerald-700"
                )}
              >
                {saved ? t("recovery.gratitude.saved") : t("recovery.gratitude.saveEntry")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </DepthCard>
  );
}

export function RecoveryPanel({ onZen }: { onZen: () => void }) {
  const { activeTheme, setTheme, setMotionEnabled } = useHealth();
  const { t } = useLanguage();
  const isSensitiveMode = activeTheme === "Sensitive";

  // Sensory-rest surface: dim + still the app. The `sensitive-mode` class
  // on <body> drives the gentle brightness overlay in globals.css; the
  // .theme-sensitive palette (sage, low contrast) and html.motion-reduce
  // (animations off) are applied by ThemeManager from context state.
  useEffect(() => {
    document.body.classList.toggle("sensitive-mode", isSensitiveMode);
    return () => document.body.classList.remove("sensitive-mode");
  }, [isSensitiveMode]);

  const toggleSensitive = () => {
    const next = !isSensitiveMode;
    setTheme(next ? "Sensitive" : "Standard");
    setMotionEnabled(!next);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch w-full overflow-visible">
      <div className="w-full h-full">
        <RecoveryCard
          title={t("recovery.sensory.title")}
          description={
            isSensitiveMode
              ? t("recovery.sensory.on")
              : t("recovery.sensory.off")
          }
          icon={Moon02Icon}
          actionLabel={
            isSensitiveMode
              ? t("recovery.sensory.deactivate")
              : t("recovery.sensory.activate")
          }
          active={isSensitiveMode}
          onAction={toggleSensitive}
          color="purple"
        />
      </div>
      <div className="w-full h-full">
        <RecoveryCard
          title={t("recovery.breath.title")}
          description={t("recovery.breath.description")}
          icon={FastWindIcon}
          actionLabel={t("recovery.breath.openZen")}
          onAction={onZen}
          color="teal"
        />
      </div>
      <div className="w-full h-full">
        <GratitudeJournalCard />
      </div>
    </div>
  );
}
