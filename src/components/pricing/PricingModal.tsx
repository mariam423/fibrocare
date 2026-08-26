"use client";

/**
 * Glassmorphic pricing modal: Free vs. FibroCare Pro. Bilingual (the app's
 * RTL layout flips it automatically), keyboard-dismissible, and checkout is
 * provider-agnostic: with a checkout URL configured it redirects to the
 * provider; without one it explains that Pro is coming soon (graceful
 * offline behavior — never a dead button).
 */

import React, { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, CheckmarkCircle02Icon, FlashIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

const FREE_PERKS_KEYS = [
  "pricing.free.perk1",
  "pricing.free.perk2",
  "pricing.free.perk3",
  "pricing.free.perk4",
] as const;

const PRO_PERKS_KEYS = [
  "pricing.pro.perk1",
  "pricing.pro.perk2",
  "pricing.pro.perk3",
  "pricing.pro.perk4",
  "pricing.pro.perk5",
  "pricing.pro.perk6",
  "pricing.pro.perk7",
] as const;

export interface PricingModalProps {
  open: boolean;
  onClose: () => void;
  /** Checkout URL (Stripe Payment Link / Lemon Squeezy). Optional. */
  checkoutUrl?: string;
}

const subscribeNoop = () => () => {};

export function PricingModal({ open, onClose, checkoutUrl }: PricingModalProps) {
  const { t } = useLanguage();
  // Hydration-safe client check: false on the server render, true once the
  // client hydrates. Avoids both SSR portals and setState-in-effect.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const startCheckout = () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
    // No provider configured: the button stays honest and does nothing
    // beyond showing the "coming soon" note under it.
  };

  // Portal to <body>: ancestors with backdrop-blur/filter/transform (e.g. the
  // fixed app header) would otherwise become the containing block for our
  // fixed overlay and clip the modal to the header bar.
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={t("pricing.title")}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto overscroll-contain rounded-3xl border border-border/60 glass-surface card-depth bg-card/95 p-6"
            initial={{ scale: 0.95, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{t("pricing.title")}</h2>
                <p className="text-sm text-muted-foreground">{t("pricing.subtitle")}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t("common.cancel")}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Free tier */}
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-5">
                <p className="text-sm font-semibold text-muted-foreground">{t("pricing.free.name")}</p>
                <p className="mt-1 text-3xl font-bold">
                  <span dir="ltr" className="whitespace-nowrap tabular-nums">
                    {t("pricing.free.price")}
                  </span>
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {FREE_PERKS_KEYS.map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                        aria-hidden="true"
                      />
                      {t(key)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro tier */}
              <div
                className={cn(
                  "relative rounded-2xl border border-primary/40 bg-primary/10 p-5",
                  "shadow-[0_0_30px_rgba(45,212,191,0.15)]"
                )}
              >
                <span className="absolute -top-2.5 end-4 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground">
                  <HugeiconsIcon icon={FlashIcon} className="h-3 w-3 shrink-0" aria-hidden="true" />
                  {t("pricing.pro.badge")}
                </span>
                <p className="text-sm font-semibold text-primary">{t("pricing.pro.name")}</p>
                {/* Flex + dir-isolated currency: keeps "$6 / month" in a stable
                    visual order under RTL without bidi re-ordering. */}
                <p className="mt-1 flex flex-wrap items-baseline gap-x-1 text-3xl font-bold">
                  <span dir="ltr" className="whitespace-nowrap tabular-nums">
                    {t("pricing.pro.price")}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground whitespace-nowrap">
                    {t("pricing.pro.period")}
                  </span>
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {PRO_PERKS_KEYS.map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      {t(key)}
                    </li>
                  ))}
                </ul>
                <Button className="mt-5 w-full rounded-xl" onClick={startCheckout} disabled={!checkoutUrl}>
                  {checkoutUrl ? t("pricing.upgradeCta") : t("pricing.comingSoon")}
                </Button>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">{t("pricing.footnote")}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
