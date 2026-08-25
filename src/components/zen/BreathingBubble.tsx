"use client";

import React, { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PauseIcon, PlayIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { BdiText } from "@/components/resources/BdiText";

const INHALE = 4;
const EXHALE = 6;
const TOTAL = INHALE + EXHALE;

/**
 * Controls keep their native Space behavior (buttons activate, sliders
 * adjust); Space anywhere else toggles the breathing cycle.
 */
function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "BUTTON" ||
    tag === "INPUT" ||
    tag === "SELECT" ||
    tag === "TEXTAREA" ||
    tag === "A" ||
    target.isContentEditable ||
    target.hasAttribute("role")
  );
}

export function BreathingBubble({
  ultraDark = false,
}: {
  ultraDark?: boolean;
}) {
  const { t, locale } = useLanguage();
  const [sec, setSec] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setSec((s) => (s + 1) % TOTAL), 1000);
    return () => clearInterval(timer);
  }, [paused]);

  // Space toggles the breathing cycle; the countdown + circle animation both
  // freeze while paused (the CSS animation pauses mid-pulse via play-state).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== " ") return;
      if (isInteractiveTarget(e.target)) return;
      e.preventDefault();
      setPaused((p) => !p);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const inhaling = sec < INHALE;
  const left = inhaling ? INHALE - sec : TOTAL - sec;

  const phaseText = inhaling
    ? t("zen.breatheIn", { seconds: left })
    : t("zen.breatheOut", { seconds: left });

  const announce = paused ? t("zen.pausedAria") : phaseText;

  return (
    <div className="relative flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Glow */}
        {!ultraDark && (
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-teal-400 blur-3xl opacity-50 breathe-glow"
            style={{ animationPlayState: paused ? "paused" : "running" }}
          />
        )}

        {ultraDark && (
          <div className="absolute inset-0 rounded-full bg-white/[0.06] blur-2xl" />
        )}

        {/* Circle */}
        <div
          className={cn(
            "relative w-48 h-48 rounded-full border-4 border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-sm animate-breathe transition-all duration-700",
            ultraDark &&
              "bg-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]",
            paused && "opacity-60 border-emerald-400/40"
          )}
          style={{ animationPlayState: paused ? "paused" : "running" }}
        >
          <span
            className={cn(
              "text-2xl font-light text-white select-none z-10",
              // Letter-spacing breaks the joined Arabic script, so keep the
              // airy tracking only for Latin text.
              locale === "en" && "tracking-widest"
            )}
          >
            {/* bdi isolates the phase count ("3s" / "3ث") so it never
                mirrors or reorders inside the RTL sentence. */}
            <BdiText text={phaseText} />
          </span>
        </div>
      </div>

      {/* Pause / resume control (discoverable, works for touch too) */}
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-5 py-2 text-sm font-medium backdrop-blur-md transition-all duration-300 active:scale-[0.97]",
          "border-white/15 bg-white/[0.06] text-slate-300 hover:bg-white/10 hover:text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
          paused && "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
        )}
      >
        <HugeiconsIcon
          icon={paused ? PlayIcon : PauseIcon}
          className="h-4 w-4"
          aria-hidden="true"
        />
        {paused ? t("zen.resume") : t("zen.pause")}
      </button>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}
