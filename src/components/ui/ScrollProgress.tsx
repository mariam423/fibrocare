"use client";

import * as React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

import { useMotionEnabled } from "@/hooks/useMotionEnabled";

/**
 * Scroll progress indicator (scroll-progress-timeline technique).
 *
 * A slim 3px gradient bar pinned to the very top of the page that fills
 * left-to-right (or right-to-left in RTL) as the document scrolls. The
 * progress value is spring-smoothed so the bar glides instead of snapping.
 *
 * Accessibility & robustness:
 * - Decorative only: `aria-hidden` + `pointer-events: none`, and the bar
 *   never receives focus.
 * - Under reduced motion (system or the manual `html.motion-reduce`
 *   kill-switch via useMotionEnabled) it renders nothing, so there is no
 *   moving UI for sensitive users.
 * - Framer Motion's `useScroll` measures window progress directly; no
 *   rAF loop, no React state per frame.
 */
export function ScrollProgress() {
  const motionEnabled = useMotionEnabled();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  if (!motionEnabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[90] h-[3px] origin-left bg-gradient-to-r from-primary via-primary/70 to-primary/40 rtl:origin-right"
      style={{ scaleX }}
    />
  );
}