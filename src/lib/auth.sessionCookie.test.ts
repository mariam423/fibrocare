// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { getSessionCookieName } from "./auth";

/**
 * Contract tests for the session cookie name derivation.
 *
 * The name must follow the DEPLOYMENT PROTOCOL, not NODE_ENV: on HTTPS
 * deployments it carries the browser-enforced `__Secure-` prefix, while
 * plain-HTTP deployments (localhost dev, the `next start` e2e live
 * server) keep the plain name — browsers REJECT `__Secure-` cookies set
 * over http. The middleware resolves the same helper, so both the write
 * side (NextAuth) and the read side (getToken) always agree.
 */

const ORIGINAL_NEXTAUTH_URL = process.env.NEXTAUTH_URL;
const ORIGINAL_VERCEL = process.env.VERCEL;

afterEach(() => {
  if (ORIGINAL_NEXTAUTH_URL === undefined) delete process.env.NEXTAUTH_URL;
  else process.env.NEXTAUTH_URL = ORIGINAL_NEXTAUTH_URL;

  if (ORIGINAL_VERCEL === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = ORIGINAL_VERCEL;
});

describe("getSessionCookieName", () => {
  it("uses the plain name when no deployment context is set (localhost dev)", () => {
    delete process.env.NEXTAUTH_URL;
    delete process.env.VERCEL;
    expect(getSessionCookieName()).toBe("next-auth.session-token");
  });

  it("uses the __Secure- prefix for an https NEXTAUTH_URL", () => {
    process.env.NEXTAUTH_URL = "https://fibrocare.vercel.app";
    delete process.env.VERCEL;
    expect(getSessionCookieName()).toBe("__Secure-next-auth.session-token");
  });

  it("keeps the plain name for an http NEXTAUTH_URL even under NODE_ENV=production", () => {
    process.env.NEXTAUTH_URL = "http://localhost:3101";
    delete process.env.VERCEL;
    // e2e live server: production build served over http — a __Secure-
    // cookie would be dropped by the browser and break every authed test.
    expect(getSessionCookieName()).toBe("next-auth.session-token");
  });

  it("uses the __Secure- prefix on Vercel regardless of NEXTAUTH_URL", () => {
    process.env.VERCEL = "1";
    delete process.env.NEXTAUTH_URL;
    expect(getSessionCookieName()).toBe("__Secure-next-auth.session-token");
  });

  it("treats a non-https:// prefix as http (no partial matches)", () => {
    process.env.NEXTAUTH_URL = "https://evil.example/.https://x";
    delete process.env.VERCEL;
    expect(getSessionCookieName()).toBe("__Secure-next-auth.session-token");
    // still https-based; the point is that a value not STARTING with
    // https:// never gets the prefix:
    process.env.NEXTAUTH_URL = "xhttps://fibrocare.vercel.app";
    expect(getSessionCookieName()).toBe("next-auth.session-token");
  });
});
