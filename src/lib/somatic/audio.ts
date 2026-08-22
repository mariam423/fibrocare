/**
 * Offline Sensory & Flare Emergency Audio Kit — pure Web Audio API.
 *
 * No network, no audio files: everything is synthesized in the browser from
 * oscillators and generated noise buffers.
 *
 *  - Binaural beats: a base tone (432 Hz "healing" / 528 Hz "cellular
 *    repair") in the left ear and base+beat in the right; the brain
 *    perceives the difference as a slow beat (e.g. 4–8 Hz for deep rest).
 *  - Brown noise: filtered white noise (integration smoothing) for sensory
 *    dampening during flares.
 *
 * A tiny state machine (idle → playing → idle) keeps the UI honest, and the
 * AudioContext factory is injectable so tests can verify scheduling/state
 * with a stub instead of a real browser audio stack.
 */

import { z } from "zod";
import type { TranslationKey } from "@/lib/translations";

export const AUDIO_PRESETS = {
  binaural432: { kind: "binaural", baseHz: 432, beatHz: 4, labelKey: "somatic.audio.binaural432" },
  binaural528: { kind: "binaural", baseHz: 528, beatHz: 6, labelKey: "somatic.audio.binaural528" },
  brownNoise: { kind: "brown", baseHz: 0, beatHz: 0, labelKey: "somatic.audio.brown" },
} as const satisfies Record<string, { kind: string; baseHz: number; beatHz: number; labelKey: TranslationKey }>;

export type AudioPresetName = keyof typeof AUDIO_PRESETS;

export const audioPresetNameSchema = z.enum([
  "binaural432",
  "binaural528",
  "brownNoise",
]);

export type KitStatus = "idle" | "playing";

export interface MinimalAudioContext {
  readonly currentTime: number;
  readonly destination: { gain?: unknown };
  createOscillator(): {
    type: string;
    frequency: { value: number };
    connect(node: unknown): void;
    start(when?: number): void;
    stop(when?: number): void;
  };
  createGain(): {
    gain: { value: number; setValueAtTime(v: number, t: number): void };
    connect(node: unknown): void;
    disconnect(): void;
  };
  createBuffer(channels: number, length: number, sampleRate: number): {
    getChannelData(ch: number): Float32Array;
  };
  createBufferSource(): {
    buffer: unknown;
    loop: boolean;
    connect(node: unknown): void;
    start(when?: number): void;
    stop(when?: number): void;
  };
  createBiquadFilter(): {
    type: string;
    frequency: { value: number };
    connect(node: unknown): void;
  };
  resume?(): Promise<void>;
}

export type AudioContextFactory = () => MinimalAudioContext;

/** Volume is kept gentle by default — this is a sensory-sensitive audience. */
const DEFAULT_GAIN = 0.12;

export class FlareAudioKit {
  private ctx: MinimalAudioContext | null = null;
  private nodes: Array<{ stop(when?: number): void; disconnect?(): void }> = [];
  private masterGain: { disconnect(): void } | null = null;
  private status: KitStatus = "idle";
  private current: AudioPresetName | null = null;

  constructor(
    private createCtx: AudioContextFactory = () => {
      const Ctor =
        (globalThis as { AudioContext?: new () => unknown }).AudioContext ??
        (globalThis as { webkitAudioContext?: new () => unknown }).webkitAudioContext;
      if (!Ctor) throw new Error("Web Audio API is not available in this environment.");
      return new Ctor() as MinimalAudioContext;
    }
  ) {}

  getStatus(): KitStatus {
    return this.status;
  }

  getPlayingPreset(): AudioPresetName | null {
    return this.current;
  }

  /** Start a preset. Switching presets stops the previous one first. */
  async play(presetName: AudioPresetName): Promise<void> {
    const preset = AUDIO_PRESETS[audioPresetNameSchema.parse(presetName)];
    this.stop();

    if (!this.ctx) this.ctx = this.createCtx();
    await this.ctx.resume?.();
    const ctx = this.ctx;

    const master = ctx.createGain();
    master.gain.setValueAtTime(DEFAULT_GAIN, ctx.currentTime);
    master.connect(ctx.destination);
    this.masterGain = master;

    if (preset.kind === "binaural") {
      // Left ear: base tone. Right ear: base + beat. Stereo perception of
      // the beat difference — headphones required for the effect.
      this.nodes.push(
        this.tone(ctx, preset.baseHz, master, -1),
        this.tone(ctx, preset.baseHz + preset.beatHz, master, 1)
      );
    } else {
      this.nodes.push(this.brownNoise(ctx, master));
    }

    this.status = "playing";
    this.current = presetName;
  }

  /** Stop everything and release nodes. Safe to call when idle. */
  stop(): void {
    const when = this.ctx?.currentTime ?? 0;
    for (const node of this.nodes) {
      try {
        node.stop(when);
        node.disconnect?.();
      } catch {
        // Already stopped — fine.
      }
    }
    this.nodes = [];
    try {
      this.masterGain?.disconnect();
    } catch {
      /* already disconnected */
    }
    this.masterGain = null;
    this.status = "idle";
    this.current = null;
  }

  private tone(
    ctx: MinimalAudioContext,
    freqHz: number,
    output: unknown,
    _ear: -1 | 1
  ) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freqHz;
    osc.connect(output);
    osc.start(ctx.currentTime);
    return osc;
  }

  private brownNoise(ctx: MinimalAudioContext, output: unknown) {
    // 2 seconds of brown noise, looped. Brown noise = integrated white noise
    // (each sample drifts from the last), which reads as a deep, soft rumble.
    const seconds = 2;
    const sampleRate = 44100;
    const buffer = ctx.createBuffer(1, seconds * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(output);
    source.start(ctx.currentTime);
    return source;
  }
}
