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

interface MouseParallaxProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode;
  /** Fraction of the pointer offset applied (e.g. 0.05 = 5%). */
  depth?: number;
  /** Max travel in px in each axis (capped so the layer never leaves its box). */
  maxTravel?: number;
}

const DEFAULT_SPRING = { stiffness: 120, damping: 20, mass: 0.6 };

/**
 * Mouse-reactive depth layer (cinematic mouse-parallax technique).
 *
 * The wrapped layer leans toward the pointer by `depth ×` its offset from
 * the container center, smoothed by a spring so motion feels weighty. Add
 * multiple layers with different `depth` values to a shared container to
 * build layered parallax depth (hero mockup + floating chips).
 *
 * Accessibility & robustness:
 * - Pointer-only enhancement: fully disabled on coarse pointers and under
 *   reduced motion (system or the manual `html.motion-reduce` kill-switch).
 * - A single pointermove listener on the wrapper writes motion values
 *   directly (no React state per frame); offsets are capped by `maxTravel`.
 * - The same DOM structure always renders so SSR and hydration stay exact.
 */
export function MouseParallax({
  children,
  depth = 0.06,
  maxTravel = 24,
  className,
  style,
  ...props
}: MouseParallaxProps) {
  const motionEnabled = useMotionEnabled();
  const ref = React.useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, DEFAULT_SPRING);
  const sy = useSpring(y, DEFAULT_SPRING);

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!motionEnabled || event.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (event.clientX - rect.left - rect.width / 2) * depth;
    const dy = (event.clientY - rect.top - rect.height / 2) * depth;
    x.set(Math.max(-maxTravel, Math.min(maxTravel, dx)));
    y.set(Math.max(-maxTravel, Math.min(maxTravel, dy)));
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={cn("will-change-transform", className)}
      style={{ x: sx, y: sy, ...style }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      {...props}
    >
      {children}
    </motion.div>
  );
}