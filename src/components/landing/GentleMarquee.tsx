"use client";

import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { HeartIcon } from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import { useMotionEnabled } from "@/hooks/useMotionEnabled";

export function GentleMarquee() {
  const { t } = useLanguage();
  const motionEnabled = useMotionEnabled();
  const WORDS = t("landing.marquee.words").split(" ");

  const row = (
    <div className="flex shrink-0 items-center gap-6 pr-6 sm:gap-8 sm:pr-8">
      {WORDS.map((word) => (
        <span key={word} className="flex items-center gap-6 sm:gap-8">
          <span className="text-sm font-medium tracking-[0.22em] uppercase text-primary/50 sm:text-base">
            {word}
          </span>
          <HugeiconsIcon
            icon={HeartIcon}
            className="h-3 w-3 shrink-0 text-primary/25"
            aria-hidden="true"
          />
        </span>
      ))}
    </div>
  );

  /*
   * Seamless loop: two identical copies side by side, each drifting left by
   * its own full width (-100%). Because both move at the same speed, copy 2
   * slides into the spot copy 1 just vacated, so the strip never shows a gap.
   * Disabled entirely under reduced motion / Sensitive mode (motionEnabled).
   */
  const marqueeAnimation = {
    animate: { x: "-100%" },
    transition: { repeat: Infinity, duration: 20, ease: "linear" as const },
  };

  return (
    <section
      aria-hidden="true"
      className="relative overflow-hidden border-y border-border/60 bg-muted/30 py-5 select-none dark:border-white/10 dark:bg-background/40 dark:backdrop-blur-xl"
    >
      <div className="flex">
        {motionEnabled ? (
          <>
            <motion.div className="flex shrink-0" {...marqueeAnimation}>
              {row}
            </motion.div>
            <motion.div className="flex shrink-0" {...marqueeAnimation}>
              {row}
            </motion.div>
          </>
        ) : (
          <>
            <div className="flex shrink-0">{row}</div>
            <div className="flex shrink-0">{row}</div>
          </>
        )}
      </div>
      {/* Soft edge fades so the strip dissolves into the page */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}