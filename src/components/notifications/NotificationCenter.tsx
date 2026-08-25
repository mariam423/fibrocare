"use client";

/**
 * Notification Center — the dropdown panel itself. Rendered inside the
 * header's NotificationBell popover. Shows the latest notifications newest
 * first, each with a localized title/message, category chip, relative time,
 * and per-card dismiss. "Mark all as read" clears the unread badge in one
 * tap, and clicking a card marks it read + navigates to its actionUrl.
 * Fully RTL-aware (logical `start`/`end` utilities + document `dir`).
 */

import React from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Brain01Icon,
  Medicine01Icon,
  CloudRainWindIcon,
  FlowerIcon,
  ClipboardCheckIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { useNotifications, timeAgoParts } from "@/lib/notifications";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import type { NotificationType } from "@/lib/notifications";
import { cn } from "@/lib/utils";

const TYPE_META: Record<
  NotificationType,
  { icon: typeof Brain01Icon; labelKey: TranslationKey; badge: string }
> = {
  weather_trigger: {
    icon: CloudRainWindIcon,
    labelKey: "notification.type.weather_trigger",
    badge:
      "bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-300 ring-sky-500/25",
  },
  medication_reminder: {
    icon: Medicine01Icon,
    labelKey: "notification.type.medication_reminder",
    badge:
      "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300 ring-emerald-500/25",
  },
  daily_checkin: {
    icon: ClipboardCheckIcon,
    labelKey: "notification.type.daily_checkin",
    badge:
      "bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300 ring-rose-500/25",
  },
  zen_recommendation: {
    icon: FlowerIcon,
    labelKey: "notification.type.zen_recommendation",
    badge:
      "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300 ring-amber-500/25",
  },
  ai_prediction: {
    icon: Brain01Icon,
    labelKey: "notification.type.ai_prediction",
    badge:
      "bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-300 ring-violet-500/25",
  },
};

function formatRelativeTime(
  timestamp: number,
  t: (
    key: TranslationKey,
    params?: Record<string, string | number>
  ) => string
): string {
  const { value, unit } = timeAgoParts(timestamp);
  if (unit === "minute") {
    return value <= 1
      ? t("notification.time.justNow")
      : t("notification.time.minutesAgo", { count: value });
  }
  if (unit === "hour") {
    return t("notification.time.hoursAgo", { count: value });
  }
  return t("notification.time.daysAgo", { count: value });
}

interface NotificationCenterProps {
  /** Close the popover (bell calls this on outside-click/Escape too). */
  onClose: () => void;
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const { t } = useLanguage();
  const { notifications, unread, markRead, markAllRead, dismiss } =
    useNotifications();
  const router = useRouter();

  const handleCardClick = (id: string, actionUrl?: string) => {
    markRead(id);
    onClose();
    if (actionUrl) router.push(actionUrl);
  };

  return (
    <div
      role="dialog"
      aria-label={t("notification.title")}
      className="w-[min(92vw,22rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/10 ring-1 ring-black/5"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">
          {t("notification.title")}
          {unread > 0 && (
            <span className="ms-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              {unread}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
              {t("notification.markAllRead")}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={t("notification.closeAria")}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[min(60vh,26rem)] overflow-y-auto overscroll-contain">
        {notifications.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {t("notification.empty")}
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {notifications.map((n) => {
              const meta = TYPE_META[n.type];
              const Icon = meta.icon;
              return (
                <li key={n.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => handleCardClick(n.id, n.actionUrl)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 pe-10 text-start transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50",
                      !n.read && "bg-primary/[0.03]"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-inset",
                        meta.badge
                      )}
                    >
                      <HugeiconsIcon icon={Icon} className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {t(n.title, n.params)}
                        </span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {formatRelativeTime(n.timestamp, t)}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {t(n.message, n.params)}
                      </span>
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            !n.read ? "bg-primary" : "bg-muted-foreground/40"
                          )}
                          aria-hidden="true"
                        />
                        {t(meta.labelKey)}
                      </span>
                    </span>
                  </button>
                  {/* Per-card dismiss */}
                  <button
                    type="button"
                    onClick={() => dismiss(n.id)}
                    aria-label={t("notification.dismissAria")}
                    className="absolute end-2 top-3 rounded-lg p-1 text-muted-foreground/60 opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 group-hover:opacity-100"
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
