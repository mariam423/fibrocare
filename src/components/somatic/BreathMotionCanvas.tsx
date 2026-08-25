"use client";

/**
 * Breathing pulse visualizer synchronized with the 4-7-8 engine.
 *
 * A framer-motion keyframe animation mirrors the exact 4-7-8 timing —
 * 4s inhale (grow), 7s hold (pause), 8s exhale (shrink), 19s per cycle —
 * so the circle stays in lockstep with the phase label driven by
 * `breathStateAt`. Concentric rings trail the leading edge with a stagger;
 * prefers-reduced-motion collapses to a single static ring.
 */

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cycleLength } from "@/lib/somatic/breathing";

export interface BreathMotionCanvasProps {
  /** Whether the breathing session is running. */
  active: boolean;
  /** Shared elapsed-seconds clock (same state that drives the audio/timer). */
  elapsedSeconds: number;
  size?: number;
}

const CYCLE = cycleLength("4-7-8"); // 19s: 4s in · 7s hold · 8s out
const TIMES: number[] = [0, 4 / CYCLE, 11 / CYCLE, 1];
const KEYFRAMES: number[] = [0.35, 1, 1, 0.35];

const RINGS = [
  { alpha: 0.55, width: 2, delay: 0 },
  { alpha: 0.39, width: 1.6, delay: 0.4 },
  { alpha: 0.23, width: 1.2, delay: 0.8 },
] as const;

export function BreathMotionCanvas({ active, size = 96 }: BreathMotionCanvasProps) {
  const reduceMotion = useReducedMotion();
  const animating = active && !reduceMotion;

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {RINGS.map((ring) => (
        <motion.div
          key={ring.delay}
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: `rgba(45, 212, 191, ${ring.alpha})`, borderWidth: ring.width }}
          initial={false}
          animate={animating ? { scale: KEYFRAMES } : { scale: 0.5 }}
          transition={
            animating
              ? {
                  duration: CYCLE,
                  times: TIMES,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: ring.delay,
                }
              : { duration: 0.3, ease: "easeOut" }
          }
        />
      ))}
      {/* Calm center dot */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 6,
          height: 6,
          top: "50%",
          left: "50%",
          x: "-50%",
          y: "-50%",
          background: "rgba(45, 212, 191, 0.8)",
        }}
      />
    </div>
  );
}
