"use client";

import * as React from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  HeartPulseIcon,
  ArrowRight01Icon,
  ArrowDown01Icon,
  File01Icon,
  CheckmarkCircle01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/Magnetic";
import { Pressable } from "@/components/ui/Pressable";
import { MaskedReveal } from "@/components/ui/MaskedReveal";
import { MouseParallax } from "@/components/ui/MouseParallax";
import { HeroScenery } from "@/components/landing/HeroScenery";
import { HeroAurora } from "@/components/landing/HeroAurora";
import { useMotionEnabled } from "@/hooks/useMotionEnabled";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

/** Premium smooth-out used by every entrance. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Gentle load-in stagger for the hero: blocks rise and settle in order. */
const heroContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
};

/** Opacity-only wrapper for the masked headline (the words animate inside). */
const heroHeading: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: EASE_OUT } },
};

const PROOF_ITEMS: [TranslationKey, TranslationKey, TranslationKey] = [
  "landing.hero.freeStart",
  "landing.hero.noCard",
  "landing.hero.private",
];

/** Decorative app-window mockup of the daily check-in. */
function CheckInMockup({
  t,
}: {
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}) {
  const motionEnabled = useMotionEnabled();
  const rows = [
    { label: t("landing.hero.pain"), value: t("landing.hero.gentle"), width: "38%" },
    { label: t("landing.hero.energy"), value: t("landing.hero.low"), width: "52%" },
    { label: t("landing.hero.sleep"), value: t("landing.hero.sleepValue"), width: "64%" },
  ];

  return (
    <div className="surface-crisp glow-card relative overflow-hidden rounded-[2rem] shadow-beautiful-lg">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-border/60 px-5 py-4">
        <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-primary/25" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" aria-hidden="true" />
        <span className="ms-3 text-xs font-medium text-muted-foreground">FibroCare</span>
        <span className="ms-auto inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
          <span className="relative flex h-1.5 w-1.5">
            <span
              aria-hidden="true"
              className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-70"
            />
            <span
              aria-hidden="true"
              className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_color-mix(in_oklab,var(--primary)_60%,transparent)]"
            />
          </span>
          {t("landing.hero.done")}
        </span>
      </div>

      <div className="p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground sm:text-base">
              {t("landing.hero.checkinTitle")}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("landing.hero.mockupSub")}
            </p>
          </div>
          <span className="icon-badge h-9 w-9 shrink-0 rounded-xl">
            <HugeiconsIcon icon={HeartPulseIcon} className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-5 space-y-3.5">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="w-16 text-xs font-medium text-muted-foreground">
                {row.label}
              </span>
              <div
                aria-hidden="true"
                className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
              >
                {motionEnabled ? (
                  <motion.div
                    className="h-full rounded-full bg-primary/75"
                    initial={{ width: 0 }}
                    animate={{ width: row.width }}
                    transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.6 }}
                  />
                ) : (
                  <div
                    className="h-full rounded-full bg-primary/75"
                    style={{ width: row.width }}
                  />
                )}
              </div>
              <span className="w-14 text-end text-xs font-medium text-foreground">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LandingHero() {
  const motionEnabled = useMotionEnabled();
  const { t } = useLanguage();
  const sectionRef = React.useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Scroll-scrubbed mockup: as the hero scrolls away, the product window
  // gently recedes (slight scale-down + fade) for cinematic depth.
  const mockupScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const mockupOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.25]);

  return (
    <section
      ref={sectionRef}
      className="relative z-0 overflow-hidden px-4 pb-16 pt-24 sm:px-6 md:pb-20 md:pt-28 lg:px-8"
      aria-labelledby="hero-heading"
    >
      <HeroAurora />
      <HeroScenery />

      <motion.div
        initial={motionEnabled ? "hidden" : false}
        animate={motionEnabled ? "visible" : false}
        variants={heroContainer}
        className="relative z-50 mx-auto max-w-6xl"
      >
        {/* Centered headline block */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div variants={heroItem}>
            <span className="group inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/60 px-3.5 py-1.5 text-[13px] font-medium text-primary backdrop-blur-sm transition-all duration-300 hover:border-primary/25 hover:bg-primary/10 hover:shadow-[0_0_24px_-8px_color-mix(in_oklab,var(--primary)_45%,transparent)] dark:bg-background/40 dark:backdrop-blur-xl dark:hover:border-emerald-400/30 dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <HugeiconsIcon icon={HeartPulseIcon} className="h-4 w-4" aria-hidden="true" />
              {t("landing.hero.badge")}
            </span>
          </motion.div>

          <motion.h1
            id="hero-heading"
            variants={heroHeading}
            className="mx-auto mt-7 max-w-[17ch] text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            <MaskedReveal
              text={t("landing.hero.heading")}
              wordClassName="hero-heading-gradient"
              stagger={0.07}
            />
          </motion.h1>

          <motion.p
            variants={heroItem}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {t("landing.hero.subheading")}
          </motion.p>

          <motion.div variants={heroItem}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Magnetic strength={0.15} hoverScale={1.02} tapScale={0.97}>
                <Button
                  size="lg"
                  nativeButton={false}
                  className="rounded-full px-7"
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
              </Magnetic>
              <Pressable hoverScale={1.02} tapScale={0.97} className="rounded-full">
                <Button
                  variant="outline"
                  size="lg"
                  nativeButton={false}
                  className="rounded-full surface-crisp border-transparent"
                  render={<a href="#how" />}
                >
                  {t("landing.hero.seeHow")}
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    data-icon="inline-end"
                    className="rtl:scale-y-[-1]"
                    aria-hidden="true"
                  />
                </Button>
              </Pressable>
            </div>
          </motion.div>

          <motion.ul
            variants={heroItem}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            {PROOF_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  className="h-3.5 w-3.5 text-primary/70"
                  aria-hidden="true"
                />
                {t(item)}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Product mockup floating over the front hill */}
        <motion.div variants={heroItem} className="relative z-50 mx-auto mt-16 max-w-3xl sm:mt-20">
          <motion.div style={motionEnabled ? { scale: mockupScale, opacity: mockupOpacity } : undefined}>
            <MouseParallax depth={0.03} maxTravel={16}>
              <CheckInMockup t={t} />

              {/* Floating glass chips (deeper parallax layers) */}
              <div className="absolute -top-6 start-6 hidden sm:block" aria-hidden="true">
                <MouseParallax depth={0.08} maxTravel={20}>
                  <div className="animate-float-soft">
                    <div className="surface-crisp flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-beautiful-md">
                      <span className="icon-badge h-8 w-8 rounded-full">
                        <HugeiconsIcon icon={SparklesIcon} className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-foreground">
                          {t("landing.hero.minutes")}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          {t("landing.hero.daily")}
                        </span>
                      </span>
                    </div>
                  </div>
                </MouseParallax>
              </div>

              <div className="absolute -bottom-6 end-6 hidden sm:block" aria-hidden="true">
                <MouseParallax depth={0.12} maxTravel={24}>
                  <div className="animate-float-soft" style={{ animationDelay: "1.6s" }}>
                    <div className="surface-crisp flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-beautiful-md">
                      <span className="icon-badge h-8 w-8 rounded-full">
                        <HugeiconsIcon icon={File01Icon} className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-foreground">
                          {t("landing.hero.doctorReady")}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          {t("landing.hero.pdf")}
                        </span>
                      </span>
                    </div>
                  </div>
                </MouseParallax>
              </div>
            </MouseParallax>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
