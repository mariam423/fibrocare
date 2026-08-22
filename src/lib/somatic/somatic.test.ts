import { describe, expect, it } from "vitest";
import { selectExercises, SOMATIC_EXERCISES } from "./exercises";
import { breathStateAt, cycleLength } from "./breathing";
import { FlareAudioKit, type MinimalAudioContext } from "./audio";

describe("selectExercises", () => {
  it("keeps only zero-spoon options on a flare day", () => {
    const picked = selectExercises({ painLevel: 9, spoonsRemaining: 0 });
    expect(picked.length).toBeGreaterThan(0);
    for (const ex of picked) {
      expect(ex.spoonCost).toBe(0);
      expect(ex.maxPain).toBeGreaterThanOrEqual(9);
    }
  });

  it("excludes exercises above the current pain level", () => {
    const picked = selectExercises({ painLevel: 6, spoonsRemaining: 12, limit: 99 });
    for (const ex of picked) expect(ex.maxPain).toBeGreaterThanOrEqual(6);
    expect(picked.some((e) => e.id === "cat-cow")).toBe(false); // maxPain 5
  });

  it("sorts cheapest-spoon exercises first", () => {
    const picked = selectExercises({ painLevel: 0, spoonsRemaining: 12, limit: 99 });
    const costs = picked.map((p) => p.spoonCost);
    expect([...costs].sort((a, b) => a - b)).toEqual(costs);
  });

  it("catalog is complete and non-empty", () => {
    expect(SOMATIC_EXERCISES.length).toBeGreaterThanOrEqual(8);
    for (const ex of SOMATIC_EXERCISES) {
      expect(ex.titleKey).toMatch(/^somatic\.ex\./);
      expect(ex.descriptionKey).toMatch(/^somatic\.ex\./);
    }
  });
});

describe("breathStateAt (4-7-8)", () => {
  it("has a 19-second cycle", () => {
    expect(cycleLength("4-7-8")).toBe(19);
  });

  it("walks the phases in order", () => {
    expect(breathStateAt("4-7-8", 0).phase).toBe("inhale");
    expect(breathStateAt("4-7-8", 3.9).phase).toBe("inhale");
    expect(breathStateAt("4-7-8", 4.5).phase).toBe("hold");
    expect(breathStateAt("4-7-8", 10.9).phase).toBe("hold");
    expect(breathStateAt("4-7-8", 11.5).phase).toBe("exhale");
    expect(breathStateAt("4-7-8", 18.9).phase).toBe("exhale");
  });

  it("wraps into the next cycle and tracks counts", () => {
    const s = breathStateAt("4-7-8", 19.5);
    expect(s.cycle).toBe(1);
    expect(s.phase).toBe("inhale");
    expect(s.secondsRemainingInPhase).toBeCloseTo(3.5, 1);
  });

  it("clamps negative elapsed time", () => {
    expect(breathStateAt("4-7-8", -5).cycle).toBe(0);
  });
});

/** Deterministic stub AudioContext — verifies scheduling + state machine. */
function stubContext(): MinimalAudioContext & { oscillators: number; sources: number } {
  const ctx = {
    currentTime: 100,
    destination: {},
    oscillators: 0,
    sources: 0,
    createOscillator() {
      ctx.oscillators++;
      return {
        type: "sine",
        frequency: { value: 0 },
        connect: () => {},
        start: () => {},
        stop: () => {},
      };
    },
    createGain() {
      return {
        gain: { value: 0, setValueAtTime: () => {} },
        connect: () => {},
        disconnect: () => {},
      };
    },
    createBuffer: (channels: number, length: number) => ({
      getChannelData: () => new Float32Array(length),
    }),
    createBufferSource() {
      ctx.sources++;
      return {
        buffer: null,
        loop: false,
        connect: () => {},
        start: () => {},
        stop: () => {},
      };
    },
    createBiquadFilter() {
      return { type: "lowpass", frequency: { value: 0 }, connect: () => {} };
    },
  } as unknown as MinimalAudioContext & { oscillators: number; sources: number };
  return ctx;
}

describe("FlareAudioKit", () => {
  it("starts idle and plays a binaural preset with two oscillators (stereo pair)", async () => {
    const ctx = stubContext();
    const kit = new FlareAudioKit(() => ctx);
    expect(kit.getStatus()).toBe("idle");
    expect(kit.getPlayingPreset()).toBeNull();

    await kit.play("binaural432");
    expect(kit.getStatus()).toBe("playing");
    expect(kit.getPlayingPreset()).toBe("binaural432");
    expect(ctx.oscillators).toBe(2);
  });

  it("plays brown noise with a single looping buffer source", async () => {
    const ctx = stubContext();
    const kit = new FlareAudioKit(() => ctx);
    await kit.play("brownNoise");
    expect(kit.getPlayingPreset()).toBe("brownNoise");
    expect(ctx.sources).toBe(1);
    expect(ctx.oscillators).toBe(0);
  });

  it("switching presets stops the previous one", async () => {
    const ctx = stubContext();
    const kit = new FlareAudioKit(() => ctx);
    await kit.play("binaural432");
    await kit.play("binaural528");
    expect(kit.getPlayingPreset()).toBe("binaural528");
    expect(ctx.oscillators).toBe(4); // 2 stopped + 2 live (stubs don't really stop)
  });

  it("stop() returns to idle and is safe to call twice", async () => {
    const kit = new FlareAudioKit(() => stubContext());
    await kit.play("brownNoise");
    kit.stop();
    expect(kit.getStatus()).toBe("idle");
    expect(kit.getPlayingPreset()).toBeNull();
    expect(() => kit.stop()).not.toThrow();
  });

  it("rejects unknown preset names via Zod", async () => {
    const kit = new FlareAudioKit(() => stubContext());
    await expect(kit.play("heavy-metal" as never)).rejects.toThrow();
    expect(kit.getStatus()).toBe("idle");
  });
});
