"use client";

/**
 * "Safe foods you trust" bookmark list for the Nutrition page.
 *
 * Each gentler food option has a bookmark toggle persisted to
 * localStorage (`fibrocare:safe-foods`), so the user's own safe list
 * survives reloads and is available offline. Purely additive — the shared
 * storage slot is namespaced and never read by other features.
 */

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  BookmarkAddIcon,
  BookmarkCheck02Icon,
  FishIcon,
  AppleIcon,
  LeafIcon,
  Bread01Icon,
  MilkBottleIcon,
  DropletIcon,
} from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/translations";

const SAFE_FOODS: Array<{
  id: string;
  labelKey: TranslationKey;
  icon: IconSvgElement;
}> = [
  { id: "fish", labelKey: "nutrition.bookmark.food.fish", icon: FishIcon },
  { id: "fruits", labelKey: "nutrition.bookmark.food.fruits", icon: AppleIcon },
  { id: "nuts", labelKey: "nutrition.bookmark.food.nuts", icon: LeafIcon },
  {
    id: "wholeGrains",
    labelKey: "nutrition.bookmark.food.wholeGrains",
    icon: Bread01Icon,
  },
  {
    id: "fermented",
    labelKey: "nutrition.bookmark.food.fermented",
    icon: MilkBottleIcon,
  },
  { id: "oliveOil", labelKey: "nutrition.bookmark.food.oliveOil", icon: DropletIcon },
];

const STORAGE_KEY = "fibrocare:safe-foods";

export function SafeFoodBookmark() {
  const { t } = useLanguage();
  const [bookmarked, setBookmarked] = useLocalStorage<string[]>(STORAGE_KEY, []);

  const toggle = (id: string) => {
    setBookmarked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">
          {t("nutrition.bookmark.title")}
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
          <HugeiconsIcon icon={BookmarkCheck02Icon} className="h-3 w-3" aria-hidden="true" />
          <bdi>{t("nutrition.bookmark.savedCount", { count: bookmarked.length })}</bdi>
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {t("nutrition.bookmark.subtitle")}
      </p>

      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SAFE_FOODS.map((food) => {
          const saved = bookmarked.includes(food.id);
          return (
            <li key={food.id}>
              <button
                type="button"
                aria-pressed={saved}
                onClick={() => toggle(food.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-start transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  saved
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-border/60 bg-card/50 hover:border-emerald-400/30 hover:bg-emerald-500/5"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    saved
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <HugeiconsIcon icon={food.icon} className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 text-sm text-foreground/90">
                  {t(food.labelKey)}
                </span>
                <HugeiconsIcon
                  icon={saved ? BookmarkCheck02Icon : BookmarkAddIcon}
                  className={cn(
                    "h-4 w-4 shrink-0",
                    saved ? "text-emerald-500" : "text-muted-foreground/60"
                  )}
                  aria-hidden="true"
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
