"use client";

import * as React from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

import { useMotionEnabled } from "@/hooks/useMotionEnabled";

/* ------------------------------------------------------------------
   Calm particle field
   A small number of soft sage/lavender motes drift slowly upward and
   sway gently. On fine pointers they are pushed softly away from the
   cursor (a quiet, non-neon interaction). All state lives in refs —
   zero React re-renders per frame; the canvas paints directly.
   ------------------------------------------------------------------ */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  sway: number;
  swaySpeed: number;
  radius: number;
  alpha: number;
  hue: "sage" | "lavender";
}

const PARTICLE_COUNT = 22;
const MAX_DPR = 2;

const SAGE = [59, 107, 72] as const;
const LAVENDER = [143, 131, 184] as const;

function ParticleCanvas({
  motionEnabled,
  className,
}: {
  motionEnabled: boolean;
  className?: string;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !motionEnabled) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const pointer = { x: -9999, y: -9999 };
    let particles: Particle[] = [];

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

    const randomParticle = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.14,
      vy: -(0.05 + Math.random() * 0.14),
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.004 + Math.random() * 0.008,
      radius: 1 + Math.random() * 2.2,
      alpha: 0.16 + Math.random() * 0.26,
      hue: Math.random() > 0.5 ? "sage" : "lavender",
    });

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: PARTICLE_COUNT }, randomParticle);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        // Gentle sway on the horizontal axis
        p.sway += p.swaySpeed;
        p.x += p.vx + Math.sin(p.sway) * 0.12;
        p.y += p.vy;

        // Soft cursor repulsion (fine pointers only)
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120 && dist > 0.001) {
          const force = ((120 - dist) / 120) * 0.6;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        // Wrap around edges so the field is endless
        if (p.y < -12) {
          p.y = height + 12;
          p.x = Math.random() * width;
        }
        if (p.x < -12) p.x = width + 12;
        if (p.x > width + 12) p.x = -12;

        const [r, g, b] = p.hue === "sage" ? SAGE : LAVENDER;
        const bob = Math.sin(t * 0.001 + p.sway * 2) * 0.5;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha + bob * 0.05})`;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    raf = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    document.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [motionEnabled]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

/* ------------------------------------------------------------------
   Scroll-reactive aurora blobs
   Sage and lavender washes drift at different speeds as the hero
   scrolls away (same scroll-scrubbed language as DayStory). Pure
   gradients, transform-only motion.
   ------------------------------------------------------------------ */

function AuroraBlob({
  className,
  y,
  style,
}: {
  className: string;
  y?: MotionValue<string>;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      aria-hidden="true"
      className={`hero-aurora-blob ${className}`}
      style={y ? { y, ...style } : style}
    />
  );
}

export function HeroAurora() {
  const motionEnabled = useMotionEnabled();
  const sectionRef = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Different drift speeds for parallax depth
  const sageY = useTransform(scrollYProgress, [0, 1], ["0%", "26%"]);
  const lavenderY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const auraOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0.35]);

  return (
    <motion.div
      ref={sectionRef}
      aria-hidden="true"
      className="hero-aurora"
      style={motionEnabled ? { opacity: auraOpacity } : undefined}
    >
      {/* Soft sage wash, upper right */}
      <AuroraBlob
        className="hero-aurora-blob-sage right-[-8%] top-[-14%] h-[34rem] w-[34rem] sm:h-[42rem] sm:w-[42rem]"
        y={motionEnabled ? sageY : undefined}
      />
      {/* Lavender echo, lower left */}
      <AuroraBlob
        className="hero-aurora-blob-lavender bottom-[-22%] left-[-12%] h-[30rem] w-[30rem] sm:h-[38rem] sm:w-[38rem]"
        y={motionEnabled ? lavenderY : undefined}
      />

      {/* Calm particle field */}
      {motionEnabled && (
        <ParticleCanvas motionEnabled className="absolute inset-0" />
      )}
    </motion.div>
  );
}
