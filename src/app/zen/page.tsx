"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useHealth } from "@/context/HealthContext";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { BreathingBubble } from "@/components/zen/BreathingBubble";
import { SoundscapeMixer } from "@/components/zen/SoundscapeMixer";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { useMotionEnabled } from "@/hooks/useMotionEnabled";
import { useLanguage } from "@/context/LanguageContext";

function ZenPointerGlow() {
  const motionEnabled = useMotionEnabled();
  const ref = React.useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!motionEnabled || event.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--glow-x", `${event.clientX}px`);
    el.style.setProperty("--glow-y", `${event.clientY}px`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    >
      <div className="zen-pointer-glow" />
    </div>
  );
}

export default function ZenPage() {
  const router = useRouter();
  const { setTheme } = useHealth();
  const { t } = useLanguage();
  const [isUltraDark, setIsUltraDark] = useState(false);

  const toggleUltraDark = () => {
    setIsUltraDark((prev) => !prev);
  };

  return (
    <RouteTransition>
    <div
      data-testid="zen-portal"
      className={cn(
        "fixed inset-0 z-50 isolate w-screen h-screen overflow-hidden bg-slate-950 flex flex-col items-center justify-center transition-colors duration-1000 p-4",
        isUltraDark ? "bg-[#070812] text-white" : "text-slate-200"
      )}
    >
      {!isUltraDark && <ZenPointerGlow />}
      {!isUltraDark && (
        <header className="absolute top-0 w-full p-6 flex justify-between items-center text-slate-400">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white"
          >
            {t("nav.backToDashboard")}
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{t("zen.focusBreath")}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleUltraDark}
              aria-pressed={isUltraDark}
              className="rounded-full border-slate-700 text-slate-400 hover:bg-slate-800"
            >
              <HugeiconsIcon
                icon={Moon02Icon}
                className="h-4 w-4 me-2"
                aria-hidden="true"
              />
              {t("zen.ultraDark")}
            </Button>
          </div>
        </header>
      )}

      {isUltraDark && (
        <header className="absolute top-0 w-full p-6 flex justify-end text-slate-500">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleUltraDark}
            aria-pressed={isUltraDark}
            className="rounded-full bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-md text-slate-400 hover:bg-white/10 hover:text-slate-200"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              className="h-4 w-4 me-2"
              aria-hidden="true"
            />
            {t("zen.exitUltraDark")}
          </Button>
        </header>
      )}

      <div
        data-testid="zen-content"
        className="relative z-10 flex flex-col items-center justify-center space-y-12"
      >
        <BreathingBubble ultraDark={isUltraDark} />

        {!isUltraDark && (
          <>
            <SoundscapeMixer />
            <Button
              variant="ghost"
              onClick={() => setTheme("Sensitive")}
              className="text-slate-500 hover:text-white"
            >
              {t("zen.switchCalming")}
            </Button>
          </>
        )}

        {isUltraDark && (
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-600 hover:text-slate-400"
          >
            {t("nav.backToDashboard")}
          </Button>
        )}
      </div>
    </div>
    </RouteTransition>
  );
}
