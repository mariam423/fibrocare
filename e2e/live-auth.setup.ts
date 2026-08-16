import { test as setup, type BrowserContext } from "@playwright/test";
import { existsSync, mkdirSync, readFileSync } from "node:fs";

/**
 * Auth setup for the live-AI e2e run (`playwright.live.config.ts`).
 *
 * Fast path: the main suite's `auth.setup.ts` already wrote a signed-in
 * storage state to `e2e/.auth/user.json`. The session cookie is
 * `domain=localhost` (port-agnostic) and the JWT validates on any port that
 * shares `NEXTAUTH_SECRET`, so the same state authenticates the live server
 * on :3101 without a single login round-trip.
 *
 * Fallback (cold machine / missing state): sign in on /login, then navigate
 * to /dashboard with a full page load. A direct load passes through the
 * proxy middleware with the freshly set cookie — this is reliable, whereas
 * the client-side `router.push` after `signIn()` can bounce back to /login
 * on a cold production server.
 */
const E2E_EMAIL = process.env.E2E_EMAIL ?? "e2e.smoke@fibrocare.local";
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? "FibroCareE2E2026!";
const STORAGE_STATE = "e2e/.auth/user.json";

function isAuthed(url: string) {
  return (
    /^\/?$/.test(new URL(url).pathname) ||
    /^\/dashboard\/?$/.test(new URL(url).pathname)
  );
}

async function authedFromState(ctx: BrowserContext) {
  if (!existsSync(STORAGE_STATE)) return false;
  await ctx.addCookies(
    JSON.parse(readFileSync(STORAGE_STATE, "utf8")).cookies
  );
  const page = await ctx.newPage();
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  const ok = isAuthed(page.url());
  await page.close();
  return ok;
}

async function signInAndSave(ctx: BrowserContext) {
  const page = await ctx.newPage();
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#email", { timeout: 30_000 });

  for (let attempt = 0; attempt < 3; attempt++) {
    await page.locator("#email").fill(E2E_EMAIL);
    await page.locator("#password").fill(E2E_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    // Poll until the session cookie is present (proves the credentials
    // callback succeeded), then land on the dashboard via a direct load.
    const deadline = Date.now() + 40_000;
    let sessionCookie = false;
    while (Date.now() < deadline) {
      const cookies = await ctx.cookies();
      sessionCookie = cookies.some((c) => c.name === "next-auth.session-token" && c.value);
      if (sessionCookie) break;
      await page.waitForTimeout(300);
    }
    if (sessionCookie) {
      await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
      if (isAuthed(page.url())) return true;
    }
  }
  await page.close();
  return false;
}

setup("authenticate against the live server", async ({ context }) => {
  mkdirSync("e2e/.auth", { recursive: true });

  // Fast path: reuse the main suite's signed-in storage state.
  let ok = await authedFromState(context);
  if (!ok) {
    // Fallback: fresh sign-in on the live server.
    ok = await signInAndSave(context);
  }

  if (!ok) {
    throw new Error(
      "Could not authenticate against the live server. If this is a fresh " +
        "machine, run `npm run test:e2e` once first so the throwaway account " +
        "is created and its storage state written."
    );
  }

  await context.storageState({ path: STORAGE_STATE });
});
