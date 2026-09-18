"use client";

/**
 * SosButton — the floating SOS action for the app's inner pages.
 *
 * Fixed bottom-corner FAB (bottom-right in LTR, bottom-left in RTL via
 * logical `end-5`) available on dashboard and internal views: opens the
 * SosCrisisModal with the guided breathing countdown, the pre-formatted
 * family/doctor emergency message (Web Share → clipboard fallback), and
 * the high-contrast instant guidance for dizziness / disorientation.
 *
 * Visibility rules:
 *  - Hidden on the public landing page and the auth/legal/utility routes
 *    (`/`, /login, /signup, /forgot-password, /reset-password, /privacy,
 *    /terms, /offline, /vt-test, /caregiver/*).
 *  - Shown only on dashboard and inner app pages.
 *  - The user can dismiss it; the choice persists in localStorage and it
 *    returns on a fresh session when that flag is cleared.
 *
 * Crisis-surface design constraints:
 *  - 56px touch target, high contrast, `aria-expanded` wired.
 *  - Large fonts, huge buttons — usable mid-flare, one-handed, shaking.
 *  - Escape closes; focus is restored to the FAB on close.
 *  - The message contains no health data beyond what the user chooses to
 *    share; nothing is sent anywhere by this component (pure client-side
 *    share sheet). No PHI touches storage or network here.
 */

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Cancel01Icon,
  Copy01Icon,
  Share01Icon,
  CheckmarkCircle02Icon,
  TelephoneIcon,
  GlassWaterIcon,
} from "@hugeicons/core-free-icons";
import {
  BREATHING_TOTAL,
  breathPhaseAt,
  breathSecondsLeft,
} from "@/lib/clinical/copingStrategies";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/translations";

const PHASE_KEYS: Record<"inhale" | "hold" | "exhale", TranslationKey> = {
  inhale: "clinical.coping.breath.inhale",
  hold: "clinical.coping.breath.hold",
  exhale: "clinical.coping.breath.exhale",
};

/** Seconds of guided breathing in the SOS countdown (2 cycles + 2s). */
const SOS_BREATH_SECONDS = BREATHING_TOTAL * 2 + 2;

/** Routes where the crisis FAB stays hidden (public/legal/auth/utility). */
const HIDDEN_PATHS = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/privacy",
  "/terms",
  "/offline",
  "/vt-test",
  "/caregiver",
];

/** localStorage key remembering the user's "hide the SOS button" choice. */
const DISMISS_KEY = "fibrocare-sos-dismissed";

/** External-store subscribe for the hydration flag (no external changes). */
const subscribeNoop = () => () => {};

function isHiddenPath(pathname: string): boolean {
  return HIDDEN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    // Storage unavailable — fall through and show the FAB.
    return false;
  }
}

export function SosButton() {
  const { t, locale } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [userDismissed, setUserDismissed] = useState(false);
  const fabRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Post-hydration guard so the FAB never flashes on hidden routes (the
  // route + persisted dismiss state are only known once the client mounts).
  // `useSyncExternalStore` yields false on the server and during hydration,
  // then true client-side — no state writes from an effect.
  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  // Breathing countdown — runs only while the modal is open. The reset
  // happens in the open/close paths (not the effect body), so the effect
  // never calls setState synchronously on mount (react-hooks rule).
  const [elapsed, setElapsed] = useState(0);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => {
      setElapsed((s) => {
        const next = s + 1;
        if (next >= SOS_BREATH_SECONDS) {
          clearInterval(timer);
          setSettled(true);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [open]);

  // Escape to close + scroll lock while the crisis modal is up.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const openModal = useCallback(() => {
    setElapsed(0);
    setSettled(false);
    setOpen(true);
  }, []);

  const closeAndRestore = useCallback(() => {
    setOpen(false);
    // Return focus to the FAB so keyboard users aren't stranded.
    requestAnimationFrame(() => fabRef.current?.focus());
  }, []);

  const dismiss = useCallback(() => {
    setUserDismissed(true);
    setOpen(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Storage unavailable — hide for this render only.
    }
  }, []);

  const phase = breathPhaseAt(elapsed % BREATHING_TOTAL);
  const secondsLeft = breathSecondsLeft(elapsed % BREATHING_TOTAL);

  const message = t("sos.message.body");

  const handleShare = useCallback(async () => {
    const text = t("sos.message.body");
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: t("sos.message.title"), text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setSettled(true);
    } catch {
      // User cancelled or share failed — keep the copy button available.
    }
  }, [t]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(t("sos.message.body"));
      setSettled(true);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }, [t]);

  // Hidden before hydration, on public/legal/auth/utility routes, or once
  // the user dismisses it (persisted). Only dashboard/inner pages see it.
  const dismissed = userDismissed || (isHydrated && readDismissed());
  if (!isHydrated || isHiddenPath(pathname) || dismissed) {
    return null;
  }

  return (
    <>
      {/* Floating action button — bottom-end corner, above safe areas. The
          wrapper keeps the fixed placement while the FAB and its small
          dismiss (X) control stay independent, non-nested buttons. */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] end-4 z-50 sm:end-6">
        <button
          ref={fabRef}
          type="button"
          onClick={openModal}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={t("sos.fab")}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full",
            "border border-rose-500/40 bg-rose-600 text-white shadow-xl shadow-rose-900/30",
            "transition-transform hover:scale-105 active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
          )}
        >
          <HugeiconsIcon icon={Alert02Icon} className="h-7 w-7" aria-hidden="true" />
        </button>

        {/* Small close / dismiss mark on the FAB's outer corner. */}
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("sos.dismissFab")}
          className={cn(
            "absolute -end-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full",
            "border border-rose-200/60 bg-rose-700 text-white shadow-md shadow-rose-900/40",
            "transition-colors hover:bg-rose-800",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-1"
          )}
        >
          <HugeiconsIcon icon={Cancel01Icon} className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={t("sos.modal.title")}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAndRestore();
          }}
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-rose-500/30 bg-background p-5 shadow-2xl outline-none sm:rounded-3xl sm:p-6"
          >
            {/* Header */}
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/15" aria-hidden="true">
                  <HugeiconsIcon icon={Alert02Icon} className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t("sos.modal.title")}</h2>
                  <p className="text-sm text-muted-foreground">{t("sos.modal.subtitle")}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeAndRestore}
                aria-label={t("sos.close")}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* 1 — Guided breathing countdown */}
            <section className="mb-4 rounded-2xl border border-teal-500/25 bg-teal-500/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-300">
                <HugeiconsIcon icon={GlassWaterIcon} className="h-4 w-4" aria-hidden="true" />
                {t("sos.breath.title")}
              </div>
              <div className="flex flex-col items-center gap-1 py-2">
                <span
                  className={cn(
                    "text-6xl font-black tabular-nums transition-colors",
                    phase === "exhale"
                      ? "text-teal-600 dark:text-teal-300"
                      : "text-foreground"
                  )}
                  aria-live="assertive"
                >
                  {Math.max(0, SOS_BREATH_SECONDS - elapsed)}
                </span>
                <span className="text-lg font-semibold text-foreground" aria-hidden="true">
                  {t(PHASE_KEYS[phase])} · {secondsLeft}
                </span>
                <span className="text-xs text-muted-foreground">{t("sos.breath.hint")}</span>
              </div>
              {settled && (
                <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-teal-700 dark:text-teal-300" aria-live="polite">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4" aria-hidden="true" />
                  {t("sos.breath.done")}
                </p>
              )}
            </section>

            {/* 2 — Pre-formatted emergency message */}
            <section className="mb-4 rounded-2xl border border-border/70 bg-card/60 p-4">
              <p className="text-sm font-semibold text-foreground">{t("sos.message.title")}</p>
              <p
                dir={locale === "ar" ? "rtl" : "ltr"}
                className="mt-2 rounded-xl bg-muted/50 px-3 py-2.5 text-sm leading-relaxed text-foreground"
              >
                {message}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button type="button" onClick={handleShare} className="rounded-xl">
                  <HugeiconsIcon icon={Share01Icon} className="me-2 h-4 w-4" aria-hidden="true" />
                  {t("sos.message.share")}
                </Button>
                <Button type="button" variant="outline" onClick={handleCopy} className="rounded-xl">
                  <HugeiconsIcon icon={Copy01Icon} className="me-2 h-4 w-4" aria-hidden="true" />
                  {t("sos.message.copy")}
                </Button>
              </div>
            </section>

            {/* 3 — High-contrast instant guidance */}
            <section className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="text-base font-bold text-amber-800 dark:text-amber-200">
                {t("sos.guide.title")}
              </p>
              <ul className="mt-2 space-y-1.5 text-[15px] font-semibold leading-snug text-amber-900 dark:text-amber-100">
                {(["sos.guide.sit", "sos.guide.head", "sos.guide.sip", "sos.guide.call"] as const).map((key) => (
                  <li key={key} className="flex items-start gap-2">
                    <span aria-hidden="true" className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                    {t(key)}
                  </li>
                ))}
              </ul>
            </section>

            {/* Escalation row */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <a
                href="tel:997"
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-500/20 dark:text-rose-300"
              >
                <HugeiconsIcon icon={TelephoneIcon} className="h-4 w-4" aria-hidden="true" />
                {t("sos.emergencyCall")}
              </a>
              <Button type="button" variant="outline" onClick={closeAndRestore} className="min-h-12 rounded-xl">
                {t("sos.close")}
              </Button>
            </div>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              {t("sos.privacyNote")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
