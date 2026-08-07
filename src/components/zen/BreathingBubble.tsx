"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useHealth } from "@/context/HealthContext";

const INHALE_SECONDS = 4;
const EXHALE_SECONDS = 6;

type Phase = "in" | "out";

interface BreathingBubbleProps {
  /** Ultra-dark mode: hide decorative glow and show only the minimal bubble. */
  ultraDark?: boolean;
}

export function BreathingBubble({ ultraDark = false }: BreathingBubbleProps) {
  const { motionEnabled } = useHealth();
  const prefersReducedMotion = useReducedMotion();
  const animate = motionEnabled && !prefersReducedMotion;

  const [phase, setPhase] = useState<Phase>("in");

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => {
      setPhase((prev) => (prev === "in" ? "out" : "in"));
    }, (phase === "in" ? INHALE_SECONDS : EXHALE_SECONDS) * 1000);
    return () => clearTimeout(timer);
  }, [phase, animate]);

  const phaseDuration = phase === "in" ? INHALE_SECONDS : EXHALE_SECONDS;
  const label = animate
    ? phase === "in"
      ? "Breathe in"
      : "Breathe out"
    : "Breathe";

  return (
    <div className="relative flex flex-col items-center justify-center">
      <p className="sr-only">
        Breathing exercise. Breathe in for four seconds, then breathe out for
        six seconds.
      </p>

      {!ultraDark && (
        <motion.div
          aria-hidden="true"
          animate={animate ? { scale: phase === "in" ? 1.55 : 1 } : {}}
          transition={{
            duration: animate ? phaseDuration : 0,
            ease: "easeInOut",
          }}
          className="w-64 h-64 rounded-full bg-gradient-to-br from-purple-400 to-teal-400 blur-3xl opacity-50"
        />
      )}

      <motion.div
        aria-hidden="true"
        animate={animate ? { scale: phase === "in" ? 1.25 : 1 } : {}}
        transition={{
          duration: animate ? phaseDuration : 0,
          ease: "easeInOut",
        }}
        className="absolute w-48 h-48 rounded-full border-4 border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-sm"
      >
        <span aria-hidden="true" className="text-2xl font-light tracking-widest text-white">
          {label}
        </span>
      </motion.div>

      <p className="sr-only" aria-live="polite">
        {label}
      </p>
    </div>
  );
}
