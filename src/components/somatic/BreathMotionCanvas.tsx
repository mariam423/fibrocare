"use client";

/**
 * Motion canvas synchronized with the 4-7-8 breathing engine.
 *
 * Draws expanding/contracting concentric ripples whose radius follows the
 * current breath phase (inhale grows, hold holds, exhale shrinks) — driven by
 * the exact same `breathStateAt` clock that paces the audio kit, so visuals
 * and guidance can never drift apart. Pure canvas, fully offline; animates
 * only while active and honors prefers-reduced-motion with a static ring.
 */

import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { breathStateAt } from "@/lib/somatic/breathing";

export interface BreathMotionCanvasProps {
  /** Whether the breathing session is running. */
  active: boolean;
  /** Shared elapsed-seconds clock (same state that drives the audio/timer). */
  elapsedSeconds: number;
  size?: number;
}

export function BreathMotionCanvas({ active, elapsedSeconds, size = 96 }: BreathMotionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const state = breathStateAt("4-7-8", elapsedSeconds);
    const phaseDuration = state.secondsElapsedInPhase + state.secondsRemainingInPhase;
    const progress = phaseDuration > 0
      ? Math.min(1, state.secondsElapsedInPhase / phaseDuration)
      : 0;

    // Ring radius maps phase: inhale 0.35→1, hold ~1, exhale 1→0.35.
    let scale: number;
    if (state.phase === "inhale") scale = 0.35 + 0.65 * progress;
    else if (state.phase === "hold") scale = 1;
    else scale = 1 - 0.65 * progress;

    const draw = (wobble: number) => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const baseR = (size / 2 - 4) * (active ? scale : 0.5);

      // Concentric ripples — outer rings trail the leading edge softly.
      const rings = reduceMotion ? 1 : 3;
      for (let i = 0; i < rings; i++) {
        const r = baseR * (1 - i * 0.18) + (i > 0 && active && !reduceMotion ? wobble * (1 - i * 0.3) : 0);
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(2, r), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(45, 212, 191, ${0.55 - i * 0.16})`;
        ctx.lineWidth = 2 - i * 0.4;
        ctx.stroke();
      }

      // Calm center dot.
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(45, 212, 191, 0.8)";
      ctx.fill();
    };

    if (!active || reduceMotion) {
      draw(0);
      return;
    }

    // Gentle sinusoidal breathing wobble while active.
    const start = performance.now();
    const animate = (now: number) => {
      const wobble = Math.sin((now - start) / 300) * 1.5;
      draw(wobble);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [active, elapsedSeconds, size, reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      aria-hidden="true"
      className="rounded-full"
    />
  );
}
