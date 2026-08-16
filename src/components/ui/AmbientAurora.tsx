"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";

import { useMotionEnabled } from "@/hooks/useMotionEnabled";

const TRAIL_SPRING = { stiffness: 80, damping: 16, mass: 0.8 };
const ECHO_SPRING = { stiffness: 42, damping: 14, mass: 1.2 };

/**
 * Ambient backdrop: crisp dot-matrix / micro-grid field behind the app.
 *
 * The `.ambient` class (globals.css) paints the near-white base with a
 * subtle dot-matrix overlay — no flat gradient blobs. On top of it a pair
 * of spring-smoothed sage "glow trail" spots follow fine pointers for a
 * soft, premium micro-interaction, the secondary lagging slightly to read
 * as a trail.
 *
 * Everything is decorative (`aria-hidden` + `pointer-events: none`) and
 * locked to the sage palette. Reduced motion, reduced transparency and
 * high contrast are handled by the guards in globals.css plus runtime
 * gating here (the pointer listener is never attached when motion is off).
 * The DOM structure is static — identical on server and client — so
 * hydration stays exact.
 */
export function AmbientAurora() {
  const motionEnabled = useMotionEnabled();

  // Pointer glow trail (spring-smoothed, no React state per frame).
  const trailX = useMotionValue(-1200);
  const trailY = useMotionValue(-1200);
  const primaryX = useSpring(trailX, TRAIL_SPRING);
  const primaryY = useSpring(trailY, TRAIL_SPRING);
  const echoX = useSpring(trailX, ECHO_SPRING);
  const echoY = useSpring(trailY, ECHO_SPRING);

  React.useEffect(() => {
    if (!motionEnabled) return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const handleMove = (event: PointerEvent) => {
      trailX.set(event.clientX);
      trailY.set(event.clientY);
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, [motionEnabled, trailX, trailY]);

  return (
    <div className="ambient" aria-hidden="true">
      <motion.div
        className="aurora-glow-trail aurora-trail-primary"
        style={{ x: primaryX, y: primaryY }}
      />
      <motion.div
        className="aurora-glow-trail aurora-trail-echo"
        style={{ x: echoX, y: echoY }}
      />
    </div>
  );
}
