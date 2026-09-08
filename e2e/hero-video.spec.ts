/**
 * e2e/hero-video.spec.ts — verifies the landing hero video preview actually
 * plays: the <video> element resolves, fires canplay, and the component swaps
 * its internal status from "loading" to "ready" (fallback UI must NOT appear).
 *
 * Runs under the default playwright.config.ts webServer (local dev on :3000).
 * For a production check, drive the deployed URL directly:
 *   curl -sI https://fibrocare.vercel.app/videos/fibrocare-app-preview.webm
 */
import { test, expect } from "@playwright/test";

test.describe("HeroVideoPreview", () => {
  test("hero video loads and plays on the landing page", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 60_000 });

    const video = page.locator("figure video");
    await expect(video).toHaveCount(1);

    // Wait for real playback readiness (state-based, not style-based):
    // readyState >= 2 (current data available) means canplay fired, which is
    // exactly the signal the component uses to flip "loading" → "ready".
    // Dev-server cold starts can delay this well past 10s, so poll generously.
    // (expect.poll re-asserts until the whole poll block passes; toEqual lets
    // us express the predicate as a plain matcher on the polled object.)
    await expect
      .poll(
        async () => {
          const s = await video.evaluate((el: HTMLVideoElement) => ({
            readyState: el.readyState,
            duration: el.duration,
            currentSrc: el.currentSrc,
          }));
          // Normalize to a single boolean so the final matcher is trivial.
          return s.readyState >= 2 && s.duration > 0;
        },
        { timeout: 30_000, intervals: [500, 1_000, 2_000] },
      )
      .toBe(true);

    // With canplay fired, the component restores opacity (status "ready").
    await expect(video).not.toHaveCSS("opacity", "0");

    // No fallback UI: the "Demo video is being prepared" card must be absent.
    await expect(page.getByText("Demo video is being prepared")).toHaveCount(0);

    // Playback must be STARTABLE: call play() and verify the clock advances.
    // (Autoplay is a browser policy — headless Chromium blocks it without
    // --autoplay-policy flags, so asserting `paused === false` would test the
    // test environment, not the component. muted + playsInline + loop + the
    // autoplay attribute are what the component can control, and play() is
    // what real autoplay reduces to.)
    await video.evaluate((el: HTMLVideoElement) => el.play());
    await expect
      .poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime), {
        timeout: 5_000,
      })
      .toBeGreaterThan(0);
  });

  test("video assets are reachable (no 404)", async ({ request }) => {
    const video = await request.get("/videos/fibrocare-app-preview.webm");
    expect(video.status()).toBe(200);
    expect(video.headers()["content-type"]).toContain("video/webm");

    const poster = await request.get("/videos/fibrocare-app-preview-poster.png");
    expect(poster.status()).toBe(200);
    expect(poster.headers()["content-type"]).toContain("image/png");
  });
});
