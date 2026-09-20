import { test, expect } from "@playwright/test";
import { LOCK_DIALOG_TIMEOUT_MS, unlockPrivatePage } from "./helpers/privacy";
import { PRIVACY_UNLOCK_COOKIE } from "../src/lib/security/privacyPin";

/**
 * Regression: the PIN privacy lock must gate the API surface, not just the UI.
 *
 * The lock screen hides the app while engaged, but /api/chat, /api/ai/* and
 * /api/health/* return health-derived data server-side. A regression where a
 * route forgets the `privacyLockResponse` guard would silently leak diary
 * data to anyone holding only the session cookie (no PIN re-entry) — e.g.
 * a script calling the endpoint directly from DevTools.
 *
 * Contract pinned here:
 *  - While the lock is engaged (no signed unlock cookie): every
 *    health-derived endpoint answers 423 with the lock error — never data.
 *  - After a real keypad unlock (correct PIN): the same endpoints answer
 *    normally (200 for the data reads; anything but 423 for the AI routes,
 *    whose status legitimately varies with provider/mock mode).
 */

const LOCK_TITLE = "Your space is locked";

/** Endpoints that derive from the user's health data. */
const GATED_ENDPOINTS = [
  { method: "GET", path: "/api/health/correlations" },
  { method: "GET", path: "/api/health/cycle-log" },
  {
    method: "POST",
    path: "/api/health/symptoms",
    body: { symptom: "pain", severity: 5, date: "2026-01-01" },
  },
  {
    method: "POST",
    path: "/api/chat",
    body: { messages: [{ role: "user", content: "hello" }] },
  },
  { method: "POST", path: "/api/ai/insight", body: {} },
  { method: "GET", path: "/api/ai/clinical-brief" },
] as const;

test.describe("Privacy lock — API gate", () => {
  // Cold dev-server compiles every endpoint on its first request; the
  // suite-level 120s budget covers navigation, not six route compiles.
  test.setTimeout(300_000);

  test("health-derived APIs return 423 while locked and serve data after unlock", async ({
    page,
  }) => {
    // Establish the session + unlock cookie, then surgically drop ONLY the
    // unlock cookie (clearCookies with a name filter — session cookie stays).
    // A plain reload keeps the unlock cookie: the gate honours it and never
    // re-locks, so "while locked" would silently not be locked.
    await unlockPrivatePage(page, "/dashboard");
    await page.context().clearCookies({ name: PRIVACY_UNLOCK_COOKIE });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: LOCK_TITLE })
    ).toBeVisible();

    // --- While locked: every endpoint must refuse with 423, never data. ---
    for (const ep of GATED_ENDPOINTS) {
      const res =
        ep.method === "GET"
          ? await page.request.get(ep.path)
          : await page.request.post(ep.path, { data: "body" in ep ? ep.body : {} });
      expect(res.status(), `${ep.method} ${ep.path} while locked`).toBe(423);
      const body = await res.json();
      expect(
        body.error,
        `${ep.method} ${ep.path} lock error body`
      ).toContain("Privacy lock engaged");
    }

    // --- Real keypad unlock (the shared helper's well-known PIN). ---
    const dialog = page.getByRole("dialog");
    for (const digit of ["1", "2", "3", "4"]) {
      await dialog.getByRole("button", { name: `Digit ${digit}` }).click();
    }
    await expect(page.getByRole("heading", { name: LOCK_TITLE })).toHaveCount(
      0,
      { timeout: LOCK_DIALOG_TIMEOUT_MS }
    );

    // --- After unlock: the gate must stop blocking. ---
    // The two data reads are deterministic — require a real 200.
    for (const path of ["/api/health/correlations", "/api/health/cycle-log"]) {
      const res = await page.request.get(path);
      expect(res.status(), `GET ${path} after unlock`).toBe(200);
    }
    // The AI routes' status varies with provider/mock mode — the contract
    // is only that the privacy gate no longer answers 423.
    for (const ep of GATED_ENDPOINTS.slice(2)) {
      const res =
        ep.method === "GET"
          ? await page.request.get(ep.path)
          : await page.request.post(ep.path, { data: "body" in ep ? ep.body : {} });
      expect(
        res.status(),
        `${ep.method} ${ep.path} must not stay locked after unlock`
      ).not.toBe(423);
    }
  });
});
