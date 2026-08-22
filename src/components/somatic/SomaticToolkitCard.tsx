"use client";

/**
 * Somatic Movement & Flare Emergency Toolkit:
 *  - adaptive exercise list (pain + spoon filtered) with a step countdown timer,
 *  - offline Web Audio kit (binaural 432/528 Hz, brown noise),
 *  - 4-7-8 breathing visualizer driven by the pure breathing engine.
 * 100% offline — oscillators and noise buffers only, no audio downloads.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlayIcon, StopIcon, Timer01Icon, PlaySquareIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { selectExercises } from "@/lib/somatic/exercises";
import { FlareAudioKit, type AudioPresetName } from "@/lib/somatic/audio";
import { breathStateAt, cycleLength } from "@/lib/somatic/breathing";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { BreathMotionCanvas } from "@/components/somatic/BreathMotionCanvas";
import type { TranslationKey } from "@/lib/translations";
import type { BreathPhase } from "@/types/extended-health";

const AUDIO_PRESETS: Array<{ name: AudioPresetName; labelKey: TranslationKey }> = [
  { name: "binaural432", labelKey: "somatic.audio.binaural432" },
  { name: "binaural528", labelKey: "somatic.audio.binaural528" },
  { name: "brownNoise", labelKey: "somatic.audio.brown" },
];

const BREATH_PHASE_KEYS = {
  inhale: "somatic.breathing.inhale",
  hold: "somatic.breathing.hold",
  exhale: "somatic.breathing.exhale",
} as const satisfies Record<BreathPhase, TranslationKey>;

export function SomaticToolkitCard() {
  const { t } = useLanguage();
  const [painLevel, setPainLevel] = useState(5);
  const [spoonsRemaining, setSpoonsRemaining] = useState(6);

  // Exercise timer state
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Optional guided-video tab (per exercise; null = step cards as before)
  const [videoExercise, setVideoExercise] = useState<string | null>(null);

  // Audio kit state
  const kitRef = useRef<FlareAudioKit | null>(null);
  const [playing, setPlaying] = useState<AudioPresetName | null>(null);

  // Breathing state
  const [breathOn, setBreathOn] = useState(false);
  const [breathElapsed, setBreathElapsed] = useState(0);
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const exercises = useMemo(
    () => selectExercises({ painLevel, spoonsRemaining }),
    [painLevel, spoonsRemaining]
  );

  const breath = breathStateAt("4-7-8", breathElapsed);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (breathRef.current) clearInterval(breathRef.current);
      kitRef.current?.stop();
    };
  }, []);

  const startTimer = (id: string, minutes: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (activeExercise === id) {
      setActiveExercise(null);
      return;
    }
    setActiveExercise(id);
    setSecondsLeft(minutes * 60);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setActiveExercise(null);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const toggleAudio = async (preset: AudioPresetName) => {
    if (!kitRef.current) kitRef.current = new FlareAudioKit();
    const kit = kitRef.current;
    if (playing === preset) {
      kit.stop();
      setPlaying(null);
      return;
    }
    try {
      await kit.play(preset);
      setPlaying(preset);
    } catch {
      setPlaying(null);
    }
  };

  const toggleBreath = () => {
    if (breathOn) {
      if (breathRef.current) clearInterval(breathRef.current);
      setBreathOn(false);
      setBreathElapsed(0);
      return;
    }
    setBreathOn(true);
    breathRef.current = setInterval(() => {
      setBreathElapsed((s) => s + 0.25);
    }, 250);
  };


  return (
    <DepthCard tilt={3}>
      <Card className="h-full border-none shadow-depth-sm ring-1 ring-border">
        <CardHeader>
          <CardTitle>{t("somatic.title")}</CardTitle>
          <CardDescription>{t("somatic.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Sliders */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-muted-foreground">{t("somatic.painToday")}: {painLevel}/10</span>
              <input
                type="range"
                min={0}
                max={10}
                value={painLevel}
                onChange={(e) => setPainLevel(Number(e.target.value))}
                className="mt-1 w-full accent-primary"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">{t("somatic.spoonsLeft")}: {spoonsRemaining}</span>
              <input
                type="range"
                min={0}
                max={12}
                value={spoonsRemaining}
                onChange={(e) => setSpoonsRemaining(Number(e.target.value))}
                className="mt-1 w-full accent-primary"
              />
            </label>
          </div>

          {/* Adaptive exercises */}
          <ul className="space-y-2">
            {exercises.map((ex) => {
              const isActive = activeExercise === ex.id;
              const videoOpen = videoExercise === ex.id;
              return (
                <li
                  key={ex.id}
                  className={cn(
                    "rounded-xl border p-3 text-sm transition-colors",
                    isActive || videoOpen ? "border-primary/40 bg-primary/10" : "border-border/60 bg-muted/30"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{t(ex.titleKey)}</p>
                      <p className="text-xs text-muted-foreground">{t(ex.descriptionKey)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {ex.videoUrl && (
                        <Button
                          size="sm"
                          variant={videoOpen ? "secondary" : "outline"}
                          className="rounded-xl"
                          onClick={() => setVideoExercise(videoOpen ? null : ex.id)}
                          aria-pressed={videoOpen}
                          aria-label={`${t(ex.titleKey)} — ${t("video.tab")}`}
                        >
                          <HugeiconsIcon icon={PlaySquareIcon} className="h-4 w-4" aria-hidden="true" />
                          <span className="hidden sm:inline">{t("video.tab")}</span>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={isActive ? "secondary" : "default"}
                        className="rounded-xl"
                        onClick={() => startTimer(ex.id, ex.minutes)}
                        aria-label={`${t(ex.titleKey)} — ${isActive ? t("somatic.stop") : t("somatic.start")}`}
                      >
                        <HugeiconsIcon
                          icon={isActive ? Timer01Icon : PlayIcon}
                          className={cn("h-4 w-4", isActive && "animate-pulse")}
                          aria-hidden="true"
                        />
                        {isActive
                          ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`
                          : `${ex.minutes}m`}
                      </Button>
                    </div>
                  </div>
                  {/* Guided video toggle — only when a curated source exists.
                      Offline/broken media falls back to the step description. */}
                  {ex.videoUrl && videoOpen && (
                    <div className="mt-3">
                      <VideoPlayer
                        source={ex.videoUrl}
                        title={t(ex.titleKey)}
                        fallback={
                          <p className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
                            {t("video.unavailable")} — {t(ex.descriptionKey)}
                          </p>
                        }
                      />
                    </div>
                  )}
                </li>
              );
            })}
            {exercises.length === 0 && (
              <li className="text-sm text-muted-foreground">{t("somatic.noneSuitable")}</li>
            )}
          </ul>

          {/* Offline audio kit */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
            <p className="mb-2 text-sm font-semibold">{t("somatic.audio.title")}</p>
            <div className="flex flex-wrap gap-2">
              {AUDIO_PRESETS.map((p) => (
                <Button
                  key={p.name}
                  size="sm"
                  variant={playing === p.name ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => void toggleAudio(p.name)}
                  aria-pressed={playing === p.name}
                >
                  <HugeiconsIcon
                    icon={playing === p.name ? StopIcon : PlayIcon}
                    className="me-1 h-4 w-4"
                    aria-hidden="true"
                  />
                  {t(p.labelKey)}
                </Button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t("somatic.audio.headphonesNote")}</p>
          </div>

          {/* 4-7-8 breathing visualizer */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{t("somatic.breathing.title")}</p>
              <Button size="sm" variant={breathOn ? "secondary" : "default"} className="rounded-full" onClick={toggleBreath} aria-pressed={breathOn}>
                {breathOn ? t("somatic.stop") : t("somatic.start")}
              </Button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-6">
              <BreathMotionCanvas active={breathOn} elapsedSeconds={breathElapsed} size={96} />
              <div className="text-sm" aria-live="polite">
                <p className="font-medium">
                  {breathOn ? t(BREATH_PHASE_KEYS[breath.phase]) : t("somatic.breathing.idle")}
                </p>
                <p className="text-muted-foreground">
                  {breathOn
                    ? `${Math.ceil(breath.secondsRemainingInPhase)}s · ${t("somatic.breathing.cycle")} ${breath.cycle + 1} · ${cycleLength("4-7-8")}s`
                    : "4-7-8 · " + t("somatic.breathing.idleHint")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DepthCard>
  );
}
