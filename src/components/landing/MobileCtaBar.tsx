"use client";

import * as React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

/**
 * Sticky mobile CTA bar (landing-page-design §Mobile).
 *
 * A single full-width primary CTA pinned to the bottom of the viewport on
 * mobile, appearing only after the hero scrolls out of view so it never
 * duplicates the hero's own CTA. The trust line ("Free to start · No credit
 * card") reinforces the low-commitment offer.
 *
 * - `fixed` (never affects layout) and hidden above the `md` breakpoint.
 * - Slides up/down with a transform-only transition (the global motion
 *   kill-switch already collapses this to instant).
 * - `inert` while off-screen so the hidden CTA is removed from the
 *   accessibility tree and tab order.
 * - `pb-[max(...,env(safe-area-inset-bottom))]` clears the iOS home bar.
 */
export function MobileCtaBar() {
  const { t } = useLanguage();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      inert={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 px-4 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] backdrop-blur-lg transition-transform duration-300 ease-out md:hidden",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <Button
        size="lg"
        nativeButton={false}
        className="w-full rounded-full"
        render={<Link href="/signup" />}
      >
        {t("landing.start")}
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          data-icon="inline-end"
          className="rtl:scale-x-[-1]"
          aria-hidden="true"
        />
      </Button>
      <p className="mt-2 text-center text-[11px] text-slate-800 dark:text-zinc-200">
        {t("landing.hero.freeStart")} · {t("landing.hero.noCard")}
      </p>
    </div>
  );
}
