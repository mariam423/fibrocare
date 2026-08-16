"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
} from "framer-motion";

import { useMotionEnabled } from "@/hooks/useMotionEnabled";
import { cn } from "@/lib/utils";

interface MagneticProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode;
  /** How strongly the element leans toward the cursor. 0 = no travel. */
  strength?: number;
  /** Gentle scale-up while hovering (e.g. 1.02). 1 = no scaling. */
  hoverScale?: number;
  /** Press-down scale on pointer click (e.g. 0.97). 1 = no scaling. */
  tapScale?: number;
}

const MAGNET_SPRING = { stiffness: 240, damping: 18, mass: 0.5 };
/** Press spring for the scale-down feedback. */
const TAP_SPRING = { type: "spring", stiffness: 400, damping: 22, mass: 0.6 } as const;
/** Cap the pointer travel so the element never leaves its layout box. */
const MAX_TRAVEL = 28;

/**
 * Magnetic cursor wrapper (originkit §4).
 *
 * The wrapped element leans toward the pointer with a spring and settles
 * back on leave. It is a pointer-only enhancement: keyboard focus rings,
 * active states and click targets live on the children and are untouched,
 * and the effect is fully disabled under reduced motion (system or the
 * manual `html.motion-reduce` kill-switch) and on coarse pointers.
 *
 * The same DOM structure always renders (a single `motion.div`) so SSR and
 * client hydration stay identical; only the behaviour is gated at runtime.
 */
export function Magnetic({
  children,
  strength = 0.18,
  hoverScale = 1,
  tapScale = 1,
  className,
  ...props
}: MagneticProps) {
  const motionEnabled = useMotionEnabled();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, MAGNET_SPRING);
  const sy = useSpring(y, MAGNET_SPRING);

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!motionEnabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = (event.clientX - rect.left - rect.width / 2) * strength;
    const dy = (event.clientY - rect.top - rect.height / 2) * strength;
    x.set(Math.max(-MAX_TRAVEL, Math.min(MAX_TRAVEL, dx)));
    y.set(Math.max(-MAX_TRAVEL, Math.min(MAX_TRAVEL, dy)));
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={cn("will-change-transform", className)}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={motionEnabled && hoverScale !== 1 ? { scale: hoverScale } : undefined}
      whileTap={motionEnabled && tapScale !== 1 ? { scale: tapScale } : undefined}
      transition={TAP_SPRING}
      {...props}
    >
      {children}
    </motion.div>
  );
}