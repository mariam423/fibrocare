"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  GiftIcon,
  CreditCardIcon,
  Shield01Icon,
  LockIcon,
} from "@hugeicons/core-free-icons";

import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

interface TrustSignal {
  icon: IconSvgElement;
  label: TranslationKey;
}

const TRUST_SIGNALS: TrustSignal[] = [
  { icon: GiftIcon, label: "landing.hero.freeStart" },
  { icon: CreditCardIcon, label: "landing.hero.noCard" },
  { icon: Shield01Icon, label: "landing.hero.private" },
  { icon: LockIcon, label: "landing.trust.encrypted" },
];

/**
 * Social-proof / trust bar (landing-page-design §Social Proof).
 *
 * Replaces the old decorative word marquee with a quiet row of verifiable,
 * no-fabrication trust signals (free, no card, private, encrypted & never
 * sold) that reinforce the low-commitment offer right below the hero. This
 * is meaningful content — so it is NOT `aria-hidden` — and it inherits the
 * high-contrast text tokens (`text-slate-800 dark:text-zinc-200`).
 */
export function TrustBar() {
  const { t } = useLanguage();

  return (
    <section
      aria-label={t("landing.trust.label")}
      className="border-y border-border/60 bg-muted/30 py-6 dark:border-white/10 dark:bg-background/40 dark:backdrop-blur-xl"
    >
      <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 sm:px-6 lg:px-8">
        {TRUST_SIGNALS.map((signal) => (
          <li key={signal.label} className="flex items-center gap-2.5">
            <span className="icon-badge h-8 w-8 rounded-full">
              <HugeiconsIcon
                icon={signal.icon}
                className="h-4 w-4"
                aria-hidden="true"
              />
            </span>
            <span className="text-sm font-medium text-slate-800 dark:text-zinc-200">
              {t(signal.label)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
