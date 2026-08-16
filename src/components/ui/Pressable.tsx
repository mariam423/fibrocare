"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

import { useMotionEnabled } from "@/hooks/useMotionEnabled";
import { cn } from "@/lib/utils";

interface PressableProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode;
  /** Gentle scale-up while hovering (1.02 = +2%). 1 = no scaling. */
  hoverScale?: number;
  /** Press-down scale on pointer click (0.97 = -3%). 1 = no scaling. */
  tapScale?: number;
}

/** Spring press physics shared by every primary CTA. */
const SPRING = { type: "spring", stiffness: 400, damping: 22, mass: 0.6 } as const;

/**
 * Spring physics wrapper for CTA buttons (originkit §4, softened).
 *
 * Applies `whileHover={{ scale: hoverScale }}` and
 * `whileTap={{ scale: tapScale }}` with a shared spring so every call to
 * action responds with the same tactile rhythm. Purely a pointer-only
 * enhancement: hover/active/focus states live on the child and are
 * untouched, and the effect fully disables under reduced motion (system
 * or the `html.motion-reduce` kill-switch).
 */
export function Pressable({
  children,
  hoverScale = 1.02,
  tapScale = 0.97,
  className,
  ...props
}: PressableProps) {
  const motionEnabled = useMotionEnabled();

  return (
    <motion.div
      className={cn("will-change-transform", className)}
      whileHover={motionEnabled && hoverScale !== 1 ? { scale: hoverScale } : undefined}
      whileTap={motionEnabled && tapScale !== 1 ? { scale: tapScale } : undefined}
      transition={SPRING}
      {...props}
    >
      {children}
    </motion.div>
  );
}