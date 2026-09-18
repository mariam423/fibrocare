"use client";

/**
 * FamilySupportCards — pre-formulated explainer cards for loved ones.
 *
 * Explaining a flare, a fog episode, or a crash takes energy the user
 * does not have. These pre-written, locale-aware cards say it once so
 * the user does not have to: copy or share them to the family group,
 * a partner, or a caregiver. Nothing leaves the device except via the
 * user's own share/copy tap (Web Share API → clipboard fallback).
 *
 * Locale-aware: card text renders in the user's current locale, so a
 * message shared with an Arabic-speaking family lands in Arabic.
 */

import React, { useCallback, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Share01Icon,
  CheckmarkCircle02Icon,
  CloudIcon,
  FlameIcon,
  BatteryLowIcon,
  HeartHandshakeIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/translations";

type EpisodeKind = "flare" | "fog" | "crash";

const CARD_META: Record<
  EpisodeKind,
  {
    titleKey: TranslationKey;
    bodyKey: TranslationKey;
    icon: typeof FlameIcon;
    tone: string;
  }
> = {
  flare: {
    titleKey: "family.card.flare.title",
    bodyKey: "family.card.flare.body",
    icon: FlameIcon,
    tone: "border-rose-500/25 bg-rose-500/[0.04]",
  },
  fog: {
    titleKey: "family.card.fog.title",
    bodyKey: "family.card.fog.body",
    icon: CloudIcon,
    tone: "border-sky-500/25 bg-sky-500/[0.04]",
  },
  crash: {
    titleKey: "family.card.crash.title",
    bodyKey: "family.card.crash.body",
    icon: BatteryLowIcon,
    tone: "border-amber-500/25 bg-amber-500/[0.04]",
  },
};

interface CopyState {
  kind: EpisodeKind | null;
  ok: boolean;
}

export function FamilySupportCards() {
  const { t, locale } = useLanguage();
  const [copied, setCopied] = useState<CopyState>({ kind: null, ok: false });

  const flash = useCallback((kind: EpisodeKind, ok: boolean) => {
    setCopied({ kind, ok });
    setTimeout(() => setCopied({ kind: null, ok: false }), 2000);
  }, []);

  const handleCopy = useCallback(
    async (kind: EpisodeKind) => {
      try {
        await navigator.clipboard.writeText(t(CARD_META[kind].bodyKey));
        flash(kind, true);
      } catch {
        flash(kind, false);
      }
    },
    [t, flash]
  );

  const handleShare = useCallback(
    async (kind: EpisodeKind) => {
      const text = t(CARD_META[kind].bodyKey);
      try {
        if (typeof navigator !== "undefined" && navigator.share) {
          await navigator.share({ title: t("family.shareTitle"), text });
        } else {
          // No Web Share (desktop) — clipboard fallback still succeeds.
          await navigator.clipboard.writeText(text);
          flash(kind, true);
        }
      } catch {
        /* user cancelled the share sheet — not an error */
      }
    },
    [t, flash]
  );

  return (
    <Card className="w-full border-violet-500/20 bg-violet-500/[0.03] backdrop-blur-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={HeartHandshakeIcon}
            className="h-5 w-5 text-violet-600 dark:text-violet-400"
            aria-hidden="true"
          />
          <CardTitle className="text-lg font-semibold">{t("family.title")}</CardTitle>
        </div>
        <CardDescription>{t("family.subtitle")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {(Object.keys(CARD_META) as EpisodeKind[]).map((kind) => {
          const meta = CARD_META[kind];
          const isCopied = copied.kind === kind && copied.ok;
          return (
            <div
              key={kind}
              className={cn("rounded-xl border p-4 backdrop-blur-sm", meta.tone)}
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/60 dark:bg-zinc-900/60"
                  aria-hidden="true"
                >
                  <HugeiconsIcon icon={meta.icon} className="h-5 w-5 text-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{t(meta.titleKey)}</p>
                  <p
                    dir={locale === "ar" ? "rtl" : "ltr"}
                    className="mt-1 text-sm leading-relaxed text-muted-foreground"
                  >
                    {t(meta.bodyKey)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(kind)}
                      className="h-8 rounded-full px-3 text-xs"
                    >
                      <HugeiconsIcon
                        icon={isCopied ? CheckmarkCircle02Icon : Copy01Icon}
                        className="me-1.5 h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      {isCopied ? t("family.copied") : t("family.copy")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(kind)}
                      className="h-8 rounded-full px-3 text-xs"
                    >
                      <HugeiconsIcon icon={Share01Icon} className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      {t("family.share")}
                    </Button>
                  </div>
                  {copied.kind === kind && !copied.ok && (
                    <p role="alert" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
                      {t("family.copyFailed")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <p className="text-[11px] leading-relaxed text-muted-foreground/80">
          {t("family.privacyNote")}
        </p>
      </CardContent>
    </Card>
  );
}
