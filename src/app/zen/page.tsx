"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useHealth } from "@/context/HealthContext";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const SOUNDS = [
  { id: "rain", label: "Rain", src: "/sounds/rain.mp3" },
  { id: "forest", label: "Forest", src: "/sounds/forest.mp3" },
  { id: "whiteNoise", label: "White Noise", src: "/sounds/white-noise.mp3" },
  { id: "deepHum", label: "Deep Hum", src: "/sounds/hum.mp3" },
] as const;

type SoundId = (typeof SOUNDS)[number]["id"];

const DEFAULT_SOUNDS: Record<SoundId, boolean> = {
  rain: false,
  forest: false,
  whiteNoise: false,
  deepHum: false,
};

export default function ZenPage() {
  const router = useRouter();
  const { motionEnabled } = useHealth();
  const prefersReducedMotion = useReducedMotion();
  const [isUltraDark, setIsUltraDark] = useState(false);
  const [activeSounds, setActiveSounds] =
    useState<Record<SoundId, boolean>>(DEFAULT_SOUNDS);

  const animate = motionEnabled && !prefersReducedMotion;

  const toggleSound = (id: SoundId) => {
    setActiveSounds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      id="main-content"
      className={cn(
        "min-h-screen flex flex-col items-center justify-center transition-colors duration-1000 p-4",
        isUltraDark ? "bg-black text-white" : "bg-slate-900 text-slate-200"
      )}
    >
      {!isUltraDark && (
        <header className="absolute top-0 w-full p-6 flex justify-between items-center text-slate-400">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white"
          >
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Focus on your breath</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUltraDark(true)}
              aria-pressed={isUltraDark}
              className="rounded-full border-slate-700 text-slate-400 hover:bg-slate-800"
            >
              <Moon className="h-4 w-4 mr-2" /> Ultra Dark
            </Button>
          </div>
        </header>
      )}

      <div className="relative flex flex-col items-center justify-center space-y-12">
        {/* Breathing Bubble */}
        <motion.div
          animate={animate ? { scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] } : {}}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
          className="w-64 h-64 rounded-full bg-gradient-to-br from-purple-400 to-teal-400 blur-3xl opacity-50"
        />

        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <motion.div
            animate={animate ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="w-48 h-48 rounded-full border-4 border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-sm"
          >
            <span className="text-2xl font-light tracking-widest text-white">
              Breathe
            </span>
          </motion.div>

          {!isUltraDark && (
            <div
              className="grid grid-cols-2 gap-4 w-full max-w-xs"
              role="group"
              aria-label="Soundscape mixer"
            >
              {SOUNDS.map((sound) => (
                <Button
                  key={sound.id}
                  variant="outline"
                  onClick={() => toggleSound(sound.id)}
                  aria-pressed={activeSounds[sound.id]}
                  className={cn(
                    "rounded-xl py-6 transition-all",
                    activeSounds[sound.id]
                      ? "bg-white/20 border-white/40 text-white"
                      : "bg-transparent border-white/10 text-slate-400"
                  )}
                >
                  {activeSounds[sound.id] ? (
                    <Volume2 className="h-4 w-4 mr-2" />
                  ) : (
                    <VolumeX className="h-4 w-4 mr-2" />
                  )}
                  {sound.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {isUltraDark && (
          <Button
            variant="ghost"
            onClick={() => setIsUltraDark(false)}
            aria-pressed={isUltraDark}
            className="absolute bottom-10 text-slate-600 hover:text-slate-400"
          >
            Exit Ultra Dark
          </Button>
        )}
      </div>
    </div>
  );
}
