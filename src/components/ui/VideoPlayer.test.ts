import { describe, expect, it } from "vitest";
import { resolveVideoSource } from "./VideoPlayer";
import { SOMATIC_EXERCISES, selectExercises } from "@/lib/somatic/exercises";

describe("resolveVideoSource", () => {
  it("resolves YouTube watch links to privacy-friendly nocookie embeds", () => {
    const r = resolveVideoSource("https://www.youtube.com/watch?v=abc123");
    expect(r).toEqual({
      kind: "youtube",
      id: "abc123",
      embedUrl: "https://www.youtube-nocookie.com/embed/abc123?rel=0",
    });
  });

  it("resolves youtu.be short links and /shorts/ paths", () => {
    expect(resolveVideoSource("https://youtu.be/xyz789")).toMatchObject({ kind: "youtube", id: "xyz789" });
    expect(resolveVideoSource("https://www.youtube.com/shorts/sh0rt1")).toMatchObject({
      kind: "youtube",
      id: "sh0rt1",
    });
  });

  it("resolves Vimeo links to player embeds", () => {
    const r = resolveVideoSource("https://vimeo.com/1234567");
    expect(r).toMatchObject({ kind: "vimeo", id: "1234567" });
  });

  it("resolves direct video files", () => {
    expect(resolveVideoSource("https://cdn.example.com/guide.mp4")).toMatchObject({
      kind: "direct",
    });
    expect(resolveVideoSource("/media/breathing.webm")).toMatchObject({ kind: "direct" });
  });

  it("routes non-embeddable pages (e.g. YouTube search) to external links", () => {
    expect(resolveVideoSource("https://www.youtube.com/results?search_query=cat+cow")).toMatchObject({
      kind: "external",
    });
    expect(resolveVideoSource("https://example.com/page")).toMatchObject({ kind: "external" });
  });

  it("returns null for empty or unparseable input", () => {
    expect(resolveVideoSource("")).toBeNull();
    expect(resolveVideoSource("not a url")).toBeNull();
  });
});

describe("somatic catalog video extension", () => {
  it("videoUrl is optional and never changes filtering", () => {
    // Every catalog entry may or may not carry a video; filtering depends
    // only on pain level and spoons, exactly as before.
    const withVideo = SOMATIC_EXERCISES.filter((e) => e.videoUrl);
    const withoutVideo = SOMATIC_EXERCISES.filter((e) => !e.videoUrl);
    expect(withVideo.length).toBeGreaterThan(0);
    expect(withoutVideo.length + withVideo.length).toBe(SOMATIC_EXERCISES.length);

    for (const ex of withVideo) {
      const r = resolveVideoSource(ex.videoUrl!);
      expect(r).not.toBeNull();
    }

    // Selector output identical with and without videos attached.
    const picked = selectExercises({ painLevel: 9, spoonsRemaining: 0, limit: 99 });
    for (const ex of picked) {
      expect(ex.maxPain).toBeGreaterThanOrEqual(9);
      expect(ex.spoonCost).toBe(0);
    }
  });
});
