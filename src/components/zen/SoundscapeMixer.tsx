"use client";

import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SoundId = "rain" | "forest" | "whiteNoise" | "deepHum";

const SOUND_OPTIONS: { id: SoundId; label: string; description: string }[] = [
  { id: "rain", label: "Rain", description: "Soft falling rain" },
  { id: "forest", label: "Forest", description: "Deep woodland ambience" },
  { id: "whiteNoise", label: "White Noise", description: "Steady static" },
  { id: "deepHum", label: "Deep Hum", description: "Low grounding tone" },
];

function createNoiseBuffer(ctx: AudioContext, type: "white" | "brown", seconds = 4) {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * seconds);
  const buffer = ctx.createBuffer(1, length, rate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    if (type === "brown") {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else {
      data[i] = white;
    }
  }
  return buffer;
}

/**
 * Asset-free ambient soundscape mixer built on the Web Audio API.
 * All sounds are synthesized in the browser, so no mp3 assets are needed
 * and the loops are gapless.
 */
export function SoundscapeMixer({ disabled = false }: { disabled?: boolean }) {
  const [activeSounds, setActiveSounds] = useState<Record<SoundId, boolean>>({
    rain: false,
    forest: false,
    whiteNoise: false,
    deepHum: false,
  });

  const ctxRef = useRef<AudioContext | null>(null);
  const stopHandlers = useRef<Map<SoundId, () => void>>(new Map());

  useEffect(() => {
    const handlers = stopHandlers.current;
    const contextRef = ctxRef;
    return () => {
      handlers.forEach((stop) => stop());
      handlers.clear();
      void contextRef.current?.close().catch(() => undefined);
      contextRef.current = null;
    };
  }, []);

  const getContext = (): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      void ctxRef.current.resume();
    }
    return ctxRef.current;
  };

  const connectNoise = (
    ctx: AudioContext,
    type: "white" | "brown",
    filterType: BiquadFilterType,
    frequency: number
  ) => {
    const source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx, type);
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = frequency;
    source.connect(filter);
    return { source, filter };
  };

  const startSound = (id: SoundId) => {
    const ctx = getContext();
    const gain = ctx.createGain();
    const connections: { source: AudioScheduledSourceNode; nodes: AudioNode[] }[] = [];

    switch (id) {
      case "rain": {
        const { source, filter } = connectNoise(ctx, "white", "lowpass", 5000);
        gain.gain.value = 0.12;
        filter.connect(gain);
        connections.push({ source, nodes: [filter] });
        break;
      }
      case "forest": {
        const { source, filter } = connectNoise(ctx, "brown", "lowpass", 800);
        gain.gain.value = 0.2;
        filter.connect(gain);
        connections.push({ source, nodes: [filter] });
        break;
      }
      case "whiteNoise": {
        const { source, filter } = connectNoise(ctx, "white", "highpass", 400);
        gain.gain.value = 0.1;
        filter.connect(gain);
        connections.push({ source, nodes: [filter] });
        break;
      }
      case "deepHum": {
        const osc55 = ctx.createOscillator();
        osc55.frequency.value = 55;
        osc55.type = "sine";
        const osc110 = ctx.createOscillator();
        osc110.frequency.value = 110;
        osc110.type = "sine";
        const gain110 = ctx.createGain();
        gain110.gain.value = 0.35;
        osc55.connect(gain);
        osc110.connect(gain110);
        gain110.connect(gain);
        gain.gain.value = 0.16;
        connections.push({ source: osc55, nodes: [] });
        connections.push({ source: osc110, nodes: [gain110] });
        break;
      }
    }

    gain.connect(ctx.destination);
    connections.forEach(({ source }) => source.start());

    const stop = () => {
      try {
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.disconnect();
        connections.forEach(({ source, nodes }) => {
          try {
            source.stop();
          } catch {
            // already stopped
          }
          nodes.forEach((n) => n.disconnect());
        });
      } catch {
        // ignore teardown errors
      }
    };

    stopHandlers.current.set(id, stop);
  };

  const toggleSound = (id: SoundId) => {
    const next = !activeSounds[id];
    setActiveSounds((prev) => ({ ...prev, [id]: next }));
    if (next) {
      startSound(id);
    } else {
      stopHandlers.current.get(id)?.();
      stopHandlers.current.delete(id);
    }
  };

  return (
    <div
      className="grid grid-cols-2 gap-4 w-full max-w-xs"
      role="group"
      aria-label="Soundscape mixer"
    >
      {SOUND_OPTIONS.map((sound) => {
        const active = activeSounds[sound.id];
        return (
          <Button
            key={sound.id}
            variant="outline"
            onClick={() => toggleSound(sound.id)}
            disabled={disabled}
            aria-pressed={active}
            title={sound.description}
            className={cn(
              "flex-col gap-1 rounded-xl py-6 transition-all",
              active
                ? "bg-white/20 border-white/40 text-white"
                : "bg-transparent border-white/10 text-slate-400"
            )}
          >
            <span className="flex items-center gap-2">
              {active ? (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              )}
              {sound.label}
            </span>
            <span className="text-[10px] font-normal opacity-70">
              {sound.description}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
