"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";

import { cn } from "@/lib/utils";

export interface DepthCardProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode;
  /** Enable cursor-follow 2.5D perspective tilt. Number = max degrees (default 5). */
  tilt?: boolean | number;
  /** Entrance animation: fade + gentle rise. Defaults to true. */
  animateIn?: boolean;
  /** Stagger delay for the entrance, in seconds. */
  delay?: number;
  /** Gentle idle float (calm breathing motion). Defaults to false. */
  float?: boolean;
  /** Lifted hover state (translate + deeper shadow). Defaults to false. */
  hover?: boolean;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function DepthCard({
  tilt = false,
  animateIn = true,
  delay = 0,
  float = false,
  hover = false,
  className,
  children,
  ...props
}: DepthCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const maxTilt = typeof tilt === "number" ? Math.min(Math.abs(tilt), 10) : 5;
  const tiltEnabled = tilt !== false && !prefersReducedMotion;
  const hoverEnabled = hover && !float && !prefersReducedMotion;

  // Cursor-follow tilt springs
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 160, damping: 18, mass: 0.4 });
  const springY = useSpring(rotateY, { stiffness: 160, damping: 18, mass: 0.4 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEnabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * maxTilt);
    rotateX.set(-py * maxTilt);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      className={cn("group/depth relative h-auto min-h-fit", className)}
      initial={animateIn && !prefersReducedMotion ? { opacity: 0, y: 14 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE_OUT }}
      style={
        tiltEnabled
          ? { rotateX: springX, rotateY: springY, transformPerspective: 900 }
          : undefined
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <div
        className={cn(
          "relative h-auto min-h-full w-full rounded-2xl pb-2",
          hoverEnabled &&
            "transition-transform duration-300 ease-out group-hover/depth:-translate-y-1",
          tiltEnabled && "will-change-transform"
        )}
      >
        {float && !prefersReducedMotion && (
          <motion.div
            aria-hidden="true"
            className="absolute -inset-1 -z-10 rounded-[inherit] bg-slate-900/40 blur-md"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <div
          className={cn(
            "relative z-10 h-auto min-h-full",
            float && !prefersReducedMotion && "motion-safe:animate-float-soft"
          )}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
}