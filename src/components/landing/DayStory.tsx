"use client";

import * as React from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

import { useMotionEnabled } from "@/hooks/useMotionEnabled";

import { useLanguage, type Translate } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

interface Scene {
  time: string;
  label: TranslationKey;
  headline: TranslationKey;
  copy: TranslationKey;
  /** Warm accent hue used for the scene tint (oklab color string). */
  tint: string;
}

const SCENES_CONFIG: Scene[] = [
  {
    time: "07:00",
    label: "landing.day.morning",
    headline: "landing.day.morningHeadline",
    copy: "landing.day.morningCopy",
    tint: "color-mix(in srgb, #3B6B48 10%, transparent)",
  },
  {
    time: "12:30",
    label: "landing.day.midday",
    headline: "landing.day.middayHeadline",
    copy: "landing.day.middayCopy",
    tint: "color-mix(in srgb, #8F83B8 10%, transparent)",
  },
  {
    time: "18:00",
    label: "landing.day.evening",
    headline: "landing.day.eveningHeadline",
    copy: "landing.day.eveningCopy",
    tint: "color-mix(in srgb, #C9683C 10%, transparent)",
  },
  {
    time: "23:30",
    label: "landing.day.night",
    headline: "landing.day.nightHeadline",
    copy: "landing.day.nightCopy",
    tint: "color-mix(in srgb, #64748B 10%, transparent)",
  },
];

function SceneCopy({ scene, t }: { scene: Scene; t: Translate }) {
  return (
    <div className="relative max-w-xl">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium tabular-nums tracking-wide text-primary">
          {scene.time}
        </span>
        <span
          className="rounded-full border border-border px-3 py-0.5 text-[12px] font-medium text-foreground"
          style={{ backgroundColor: scene.tint }}
        >
          {t(scene.label)}
        </span>
      </div>
      <h3 className="mt-4 text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
        {t(scene.headline)}
      </h3>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
        {t(scene.copy)}
      </p>
    </div>
  );
}

function useSceneOpacity(
  index: number,
  progress: MotionValue<number>
): MotionValue<number> {
  const start = index / SCENES_CONFIG.length;
  const end = (index + 1) / SCENES_CONFIG.length;
  const fade = 0.12;
  return useTransform(
    progress,
    [start, start + fade, end - fade, end],
    [0, 1, 1, 0]
  );
}

/** Scroll-scrubbed gradient wash behind the active scene. */
function SceneBackground({
  scene,
  index,
  progress,
}: {
  scene: Scene;
  index: number;
  progress: MotionValue<number>;
}) {
  const opacity = useSceneOpacity(index, progress);
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        opacity,
        background: `radial-gradient(60% 55% at 78% 30%, ${scene.tint} 0%, transparent 68%)`,
      }}
    />
  );
}

/** Scroll-scrubbed copy layer for one scene. */
function SceneForeground({
  scene,
  index,
  progress,
  t,
}: {
  scene: Scene;
  index: number;
  progress: MotionValue<number>;
  t: Translate;
}) {
  const opacity = useSceneOpacity(index, progress);
  return (
    <motion.div className="[grid-area:1/1]" style={{ opacity }}>
      <SceneCopy scene={scene} t={t} />
    </motion.div>
  );
}

function ProgressRail({ progress, t }: { progress: MotionValue<number>; t: Translate }) {
  return (
    <div
      className="hidden flex-col items-center gap-3 lg:flex"
      aria-hidden="true"
    >
      <span className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">
        {t("landing.day.title")}
      </span>
      <div className="relative h-40 w-px overflow-hidden rounded-full bg-border">
        <motion.div
          className="absolute inset-x-0 top-0 h-full rounded-full bg-primary"
          style={{ scaleY: progress, originY: 0 }}
        />
      </div>
      <span className="text-[12px] font-medium tabular-nums text-muted-foreground">
        {t("landing.day.scenes", { count: SCENES_CONFIG.length })}
      </span>
    </div>
  );
}

export function DayStory() {
  const motionEnabled = useMotionEnabled();
  const { t } = useLanguage();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  if (!motionEnabled) {
    return (
      <section id="day" className="px-4 py-16 sm:px-6 md:py-20 lg:px-8" aria-labelledby="day-heading">
        <div className="mx-auto max-w-5xl">
          <h2 id="day-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("landing.day.title")}
          </h2>
          <div className="mt-12 space-y-14">
            {SCENES_CONFIG.map((scene) => (
              <div
                key={scene.time}
                className="relative border-s-2 border-border ps-6 sm:ps-8"
              >
                <span className="absolute -start-1 top-1.5 h-2 w-2 rounded-full bg-primary" />
                <SceneCopy scene={scene} t={t} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="day" ref={containerRef} className="relative h-[420vh]" aria-labelledby="day-heading">
      <h2 id="day-heading" className="sr-only">
        {t("landing.day.title")}
      </h2>
      <div className="sticky top-0 flex h-[100dvh] items-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {SCENES_CONFIG.map((scene, i) => (
            <SceneBackground
              key={scene.time}
              scene={scene}
              index={i}
              progress={scrollYProgress}
            />
          ))}
        </div>

        <div className="grid w-full grid-cols-1 gap-10 px-6 sm:px-12 lg:grid-cols-[1fr_auto] lg:items-center lg:px-16">
          <div>
            {SCENES_CONFIG.map((scene, i) => (
              <SceneForeground
                key={scene.time}
                scene={scene}
                index={i}
                progress={scrollYProgress}
                t={t}
              />
            ))}
          </div>
          <ProgressRail progress={scrollYProgress} t={t} />
        </div>
      </div>
    </section>
  );
}
