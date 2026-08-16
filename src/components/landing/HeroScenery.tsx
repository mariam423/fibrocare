"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import { useMotionEnabled } from "@/hooks/useMotionEnabled";

/**
 * Calm horizon behind the hero (Freebuff-style layered depth).
 *
 * A dawn landscape of three moving planes: the sky wash stays fixed,
 * the back hill drifts slower, and the front hill drifts faster as the
 * hero scrolls away — a quiet parallax that gives the page depth
 * without any neon or noise. A breathing sun and slow mist complete
 * the scene.
 *
 * Accessibility:
 * - Decorative only: aria-hidden and pointer-events none.
 * - Parallax and mist are transform-only and fully gated by
 *   `useMotionEnabled`; the global motion kill-switch and the
 *   reduced-transparency / high-contrast media queries in globals.css
 *   drop the animated extras while the static sky and hills remain.
 */
export function HeroScenery() {
  const motionEnabled = useMotionEnabled();
  const sectionRef = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Different drift speeds for depth: the back hill lags, the front
  // hill moves a touch faster.
  const backY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const frontY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const sunY = useTransform(scrollYProgress, [0, 1], ["0%", "36%"]);

  return (
    <div ref={sectionRef} aria-hidden="true" className="hero-scenery">
      {/* Breathing sun — centering and glow live on the static shell, so
          framer's parallax y never fights the CSS translateX centering,
          and the breathe-scale runs on its own inner element. */}
      <div className="hero-scenery-sun">
        <motion.div style={motionEnabled ? { y: sunY } : undefined}>
          <span className="breathe-glow hero-scenery-sun-core" />
        </motion.div>
      </div>

      {/* Slow drifting mist */}
      <span className="hero-scenery-mist hero-scenery-mist-a" />
      <span className="hero-scenery-mist hero-scenery-mist-b" />

      {/* Rolling hills — back layer first, then the front silhouette */}
      <motion.svg
        className="hero-scenery-hills hero-scenery-hills-back"
        viewBox="0 0 1440 300"
        preserveAspectRatio="none"
        style={motionEnabled ? { y: backY } : undefined}
      >
        <path d="M0,196 C220,104 430,214 720,162 C1010,112 1210,224 1440,152 L1440,300 L0,300 Z" />
      </motion.svg>

      <div className="hero-scenery-haze" />

      <motion.svg
        className="hero-scenery-hills hero-scenery-hills-front"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        style={motionEnabled ? { y: frontY } : undefined}
      >
        <path d="M0,150 C280,58 640,196 980,126 C1220,82 1340,150 1440,102 L1440,240 L0,240 Z" />
      </motion.svg>
    </div>
  );
}
