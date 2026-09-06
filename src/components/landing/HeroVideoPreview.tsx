"use client";

/**
 * HeroVideoPreview — calm, looping product demo placed directly under the
 * landing hero. Renders a self-hosted WebM with autoplay / muted / loop /
 * inline, a PNG poster as the immediate first-paint, and a graceful
 * "offline / blocked" fallback so the page never breaks if the file fails
 * to load.
 *
 * Visual language mirrors `LandingHero.tsx`: same `EASE_OUT` curve, same
 * `glass-surface` token, same emerald-on-slate palette, same reduced-motion
 * gate via `useMotionEnabled()`. The motion variant is intentionally shorter
 * and quieter than the hero itself — this is supporting content, not the
 * star of the section.
 *
 * File layout (produced by `npm run demo:capture`):
 *   public/videos/fibrocare-app-preview.webm
 *   public/videos/fibrocare-app-preview-poster.png
 *
 * The component does NOT use the existing `VideoPlayer` because:
 *   1. The brief requires `autoPlay loop muted playsInline` without
 *      visible controls. VideoPlayer renders `controls`.
 *   2. The poster-then-fallback flow is hero-specific (the rest of the
 *      app does not need a poster).
 *   3. The framer-motion entrance is a one-off, not worth retrofitting.
 */

import * as React from "react";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlaySquareIcon, SparklesIcon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { useMotionEnabled } from "@/hooks/useMotionEnabled";

/** Same curve as `LandingHero.tsx:33` — keeps motion consistent. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const wrapper: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE_OUT, delay: 0.15 },
  },
};

const caption: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT, delay: 0.6 },
  },
};

interface HeroVideoPreviewProps {
  /** Override the default WebM path. Useful for a /videos/fibromycare...mp4 swap later. */
  src?: string;
  /** Override the default poster path. */
  poster?: string;
  /** Optional extra classes for the outer wrapper. */
  className?: string;
}

/**
 * Soft animated glow behind the video frame. Pure CSS keyframes via Tailwind's
 * `animate-pulse-soft` utility (already in the project) — no JS rAF.
 */
function AmbientGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15 animate-pulse-soft"
    />
  );
}

/**
 * "Demo" chip floating over the top-left of the frame. Pure decoration —
 * hides from screen readers because the visible video already conveys the
 * same information.
 */
function DemoChip({ label }: { label: string }) {
  return (
    <span
      aria-hidden="true"
      className="absolute start-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/35 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-md"
    >
      <HugeiconsIcon icon={PlaySquareIcon} className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

/**
 * Renders when the video file is missing OR the browser refuses to play it
 * (e.g. autoplay policy, offline, codec missing). Keeps the layout intact.
 */
function VideoUnavailable({
  reason,
  titleId,
}: {
  reason: string;
  titleId: string;
}) {
  return (
    <div
      role="img"
      aria-labelledby={titleId}
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-emerald-50/80 via-white/60 to-teal-50/80 px-6 text-center dark:from-slate-900/80 dark:via-slate-900/60 dark:to-emerald-950/40"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <HugeiconsIcon icon={SparklesIcon} className="h-6 w-6" aria-hidden="true" />
      </span>
      <p id={titleId} className="max-w-sm text-sm font-semibold text-foreground">
        {reason}
      </p>
      <p className="max-w-sm text-xs text-muted-foreground">
        The walkthrough video is being prepared. In the meantime, you can
        explore the live product by scrolling down.
      </p>
    </div>
  );
}

export function HeroVideoPreview({
  src = "/videos/fibrocare-app-preview.webm",
  poster = "/videos/fibrocare-app-preview-poster.png",
  className,
}: HeroVideoPreviewProps) {
  const motionEnabled = useMotionEnabled();
  const prefersReduced = useReducedMotion();
  const titleId = React.useId();

  // Track whether the <video> element successfully started playback. If
  // `loadeddata` never fires within 4 s (typical for missing files behind
  // a dev server with blocked /public), swap to the static fallback.
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">(
    "loading",
  );

  React.useEffect(() => {
    if (status === "ready") return;
    const timer = window.setTimeout(() => {
      setStatus((prev) => (prev === "loading" ? "error" : prev));
    }, 4_000);
    return () => window.clearTimeout(timer);
  }, [status]);

  return (
    <motion.figure
      initial={motionEnabled && !prefersReduced ? "hidden" : false}
      animate={motionEnabled && !prefersReduced ? "visible" : false}
      variants={wrapper}
      className={cn(
        "relative z-10 mx-auto mt-14 w-full max-w-3xl px-4 sm:mt-20 sm:px-6",
        className,
      )}
      aria-labelledby={`${titleId}-caption`}
    >
      <AmbientGlow />

      {/* The video card. Same glass tokens as LandingHero's <CheckInMockup>. */}
      <div className="surface-crisp glow-card relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 shadow-beautiful-lg backdrop-blur-md dark:border-emerald-500/20 dark:bg-slate-900/80 ring-1 ring-black/5 dark:ring-white/5">
        {/* Window chrome — echoes the CheckInMockup pattern (LandingHero.tsx:73). */}
        <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/30 px-5 py-4">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/25" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" aria-hidden="true" />
          <span className="ms-3 text-xs font-medium text-muted-foreground opacity-80">
            fibrocare.app
          </span>
          <span className="ms-auto inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span
                aria-hidden="true"
                className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-70"
              />
              <span
                aria-hidden="true"
                className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary"
              />
            </span>
            Live preview
          </span>
        </div>

        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <DemoChip label="DEMO" />

          {status !== "error" ? (
            <video
              className={cn(
                "absolute inset-0 h-full w-full object-cover bg-black/60",
                status === "loading" && "opacity-0",
              )}
              src={src}
              poster={poster}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-label="A short product walkthrough of FibroCare — daily check-in, resources library, and citation dialog"
              onCanPlay={() => setStatus("ready")}
              onError={() => setStatus("error")}
            />
          ) : (
            <VideoUnavailable
              reason="Demo video is being prepared"
              titleId={`${titleId}-fallback`}
            />
          )}

          {/* Subtle inner ring highlight to mirror LandingHero's <CheckInMockup>. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-b-[2rem] ring-1 ring-inset ring-white/10 dark:ring-white/5"
          />
        </div>
      </div>

      <motion.figcaption
        initial={motionEnabled && !prefersReduced ? "hidden" : false}
        animate={motionEnabled && !prefersReduced ? "visible" : false}
        variants={caption}
        id={`${titleId}-caption`}
        className="mt-5 text-center text-sm text-slate-500 dark:text-slate-300/80"
      >
        A 30-second walkthrough — landing, care library, and a RAG-grounded
        clinical citation. Captured with Playwright, served from{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-[12px]">
          /videos
        </code>
        .
      </motion.figcaption>
    </motion.figure>
  );
}

export default HeroVideoPreview;
