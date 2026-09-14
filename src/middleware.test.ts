// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { middleware } from "./middleware";

/**
 * Regression tests for the route-guard middleware (src/middleware.ts).
 *
 * Locked-in contract (fail-closed fix):
 *  - A token that THROWS during validation (corrupted cookie, rotated
 *    secret) must redirect to /login and clear the cookie — the previous
 *    code served the protected page shell on this path (fail-open).
 *  - A token that decrypts but has no `sub` still redirects (unchanged).
 *  - A valid token passes through (unchanged).
 */

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getJwtSecret: vi.fn(() => "test-secret"),
}));

const mockedGetToken = vi.mocked(getToken);

function requestFor(path: string) {
  return new NextRequest(`http://localhost:3000${path}`);
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("middleware — protected routes", () => {
  it("lets a valid token through", async () => {
    mockedGetToken.mockResolvedValue({ sub: "u1" } as never);
    const res = await middleware(requestFor("/dashboard"));
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("redirects to /login when no token resolves (null, no throw)", async () => {
    mockedGetToken.mockResolvedValue(null);
    const res = await middleware(requestFor("/dashboard"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("FAILS CLOSED when token validation throws (rotated secret / corrupt cookie)", async () => {
    mockedGetToken.mockRejectedValue(
      new Error("JWE decryption failed: Invalid key length")
    );
    const res = await middleware(requestFor("/dashboard"));

    // Must be a redirect, NOT NextResponse.next() (200).
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
    expect(res.headers.get("location")).toContain("callbackUrl=%2Fdashboard");

    // The undecryptable cookie must be cleared.
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("next-auth.session-token=");
    expect(setCookie).toContain("Max-Age=0");
  });

  it("FAILS CLOSED on /pro too — every protected prefix gets the same treatment", async () => {
    mockedGetToken.mockRejectedValue(new Error("corrupt"));
    for (const path of ["/zen", "/pro/doctor", "/health-logs", "/reports"]) {
      const res = await middleware(requestFor(path));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login");
    }
  });

  it("passes through unprotected paths without validating a token", async () => {
    const res = await middleware(requestFor("/privacy"));
    expect(res.status).toBe(200);
    expect(mockedGetToken).not.toHaveBeenCalled();
  });
});
