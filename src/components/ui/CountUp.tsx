"use client";

import * as React from "react";

import { useMotionEnabled } from "@/hooks/useMotionEnabled";
import { cn } from "@/lib/utils";

interface CountUpProps {
  /** The target number to count to. */
  value: number;
  /** Animation duration in milliseconds (default 900). */
  duration?: number;
  /** Number of decimal places (default 0). */
  decimals?: number;
  /** Prefix rendered before the number (e.g. "$"). */
  prefix?: string;
  /** Suffix rendered after the number (e.g. "%"). */
  suffix?: string;
  /** Only animate once the element scrolls into view (default true). */
  inView?: boolean;
  /** Extra class names for the wrapping span. */
  className?: string;
}

/**
 * Animated count-up (design-taste micro-interaction).
 *
 * Counts from 0 to `value` with an ease-out curve using a single
 * requestAnimationFrame loop. The animated number is written directly
 * to `textContent` on a ref — no React state per frame, so there are
 * zero re-renders while counting.
 *
 * Accessibility & robustness:
 * - Under reduced motion (system preference or the manual
 *   `html.motion-reduce` kill-switch via useMotionEnabled) the target
 *   value renders immediately, with no animation.
 * - `aria-hidden` on the animated span; a visually hidden element
 *   carries the final value for screen readers.
 * - SSR and the first client render output the full target value, so
 *   hydration is always exact and no-JS shows the number.
 * - An IntersectionObserver (optional) triggers the animation once the
 *   element enters the viewport.
 */
export function CountUp({
  value,
  duration = 900,
  decimals = 0,
  prefix = "",
  suffix = "",
  inView = true,
  className,
}: CountUpProps) {
  const motionEnabled = useMotionEnabled();
  const spanRef = React.useRef<HTMLSpanElement>(null);
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const [started, setStarted] = React.useState(!inView);

  const format = React.useCallback(
    (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`,
    [prefix, suffix, decimals]
  );

  // Count-up animation: rAF loop, direct DOM write, no re-renders.
  React.useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    // Reduced motion or not yet in view: show the final value statically.
    if (!motionEnabled || !started) {
      el.textContent = format(value);
      return;
    }
    const start = performance.now();
    const from = 0;
    let rafId = 0;
    const raf = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic: fast start, gentle settle (calm, non-bouncy)
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(from + (value - from) * eased);
      if (t < 1) {
        rafId = requestAnimationFrame(raf);
      } else {
        el.textContent = format(value);
      }
    };
    rafId = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration, decimals, prefix, suffix, format, motionEnabled, started]);

  // Viewport trigger: animate once when the element scrolls into view.
  React.useEffect(() => {
    if (!inView || started) return;
    const root = rootRef.current;
    if (!root) return;

    let observer: IntersectionObserver | null = null;
    let cancelled = false;

    if (typeof IntersectionObserver === "undefined") {
      // Very old browsers: reveal immediately (never strand the value).
      queueMicrotask(() => {
        if (!cancelled) setStarted(true);
      });
      return () => {
        cancelled = true;
      };
    }

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setStarted(true);
            observer?.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(root);
    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [inView, started]);

  return (
    <span ref={rootRef} className={cn("inline-block tabular-nums", className)}>
      <span ref={spanRef} aria-hidden="true">
        {format(value)}
      </span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
