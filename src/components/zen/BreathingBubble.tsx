"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

const INHALE = 4;
const EXHALE = 6;
const TOTAL = INHALE + EXHALE;

export function BreathingBubble({
  ultraDark = false,
}: {
  ultraDark?: boolean;
}) {
  const { t, locale } = useLanguage();
  const [sec, setSec] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSec((s) => (s + 1) % TOTAL), 1000);
    return () => clearInterval(timer);
  }, []);

  const inhaling = sec < INHALE;
  const left = inhaling ? INHALE - sec : TOTAL - sec;

  const text = inhaling
    ? t("zen.breatheIn", { seconds: left })
    : t("zen.breatheOut", { seconds: left });

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Glow */}
      {!ultraDark && (
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-teal-400 blur-3xl opacity-50 breathe-glow"
        />
      )}

      {ultraDark && (
        <div className="absolute inset-0 rounded-full bg-white/[0.06] blur-2xl" />
      )}

      {/* Circle */}
      <div
        className={cn(
          "relative w-48 h-48 rounded-full border-4 border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-sm animate-breathe",
          ultraDark &&
            "bg-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]"
        )}
      >
        <span
          className={cn(
            "text-2xl font-light text-white select-none z-10",
            // Letter-spacing breaks the joined Arabic script, so keep the
            // airy tracking only for Latin text.
            locale === "en" && "tracking-widest"
          )}
        >
          {text}
        </span>
      </div>

      <p className="sr-only" aria-live="polite">
        {text}
      </p>
    </div>
  );
}
