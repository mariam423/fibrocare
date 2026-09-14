// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { checkRateLimitDistributed } from "@/lib/ai/ratelimit";
import { getServerSession } from "next-auth";
import { requirePermissionResponse } from "@/lib/auth/entitlement";
import { seedDoctorArticleLibrary } from "@/app/pro/doctor-article-actions";
// Imported from the REAL module (not mocked): these literals are the pin.
import {
  SEED_RATE_LIMIT,
  SEED_RATE_WINDOW_MS,
} from "@/app/pro/doctor-article-cache";

/**
 * Budget pin for the seed endpoint.
 *
 * The seed limiter exists to stop scripted hammering, and its headroom
 * (12 / 5 min) is what lets fresh deploys and e2e runs self-seed through
 * parallel first visitors. A silent regression in either direction is
 * bad:
 *   - smaller/shorter → first visitors 429 and the library stays empty
 *   - bigger/longer   → a script can burn LLM budget unopposed
 *
 * The first test pins the literal values; changing them must update
 * this test deliberately. The later tests prove the route actually
 * enforces the limiter with those shared constants (catching edits that
 * hardcode different numbers or delete the limiter call).
 */

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/ai/ratelimit", () => ({
  checkRateLimitDistributed: vi.fn(),
}));

vi.mock("@/lib/auth/entitlement", () => ({
  requirePermissionResponse: vi.fn(),
}));

vi.mock("@/app/pro/doctor-article-actions", () => ({
  seedDoctorArticleLibrary: vi.fn(),
}));

const mockedSession = vi.mocked(getServerSession);
const mockedEntitlement = vi.mocked(requirePermissionResponse);
const mockedLimiter = vi.mocked(checkRateLimitDistributed);
const mockedSeed = vi.mocked(seedDoctorArticleLibrary);

function postRequest(ip = "203.0.113.9") {
  return new NextRequest("http://localhost:3000/api/ai/articles/seed", {
    method: "POST",
    headers: { "x-forwarded-for": ip },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedSession.mockResolvedValue({
    user: { id: "user-1" },
  } as never);
  mockedEntitlement.mockResolvedValue(null);
  mockedLimiter.mockResolvedValue({
    ok: true,
    remaining: SEED_RATE_LIMIT - 1,
    resetAt: Date.now() + 1000,
  });
  mockedSeed.mockResolvedValue({ generated: 0, total: 16 });
});

describe("seed route — budget pin", () => {
  it("pins the shared seed budget constants (update deliberately, not silently)", () => {
    expect(SEED_RATE_LIMIT).toBe(12);
    expect(SEED_RATE_WINDOW_MS).toBe(5 * 60 * 1000);
  });

  it("enforces the limiter with the shared constants, keyed per IP", async () => {
    const res = await POST(postRequest("198.51.100.7"));

    expect(res.status).toBe(200);
    expect(mockedLimiter).toHaveBeenCalledTimes(1);
    const [key, limit, windowMs] = mockedLimiter.mock.calls[0];
    expect(key).toBe("seed:198.51.100.7");
    expect(limit).toBe(SEED_RATE_LIMIT);
    expect(windowMs).toBe(SEED_RATE_WINDOW_MS);
  });

  it("returns 429 with Retry-After when the budget is exhausted", async () => {
    mockedLimiter.mockResolvedValue({
      ok: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    });

    const res = await POST(postRequest());
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("30");
    // Denied requests must never reach the seeding work.
    expect(mockedSeed).not.toHaveBeenCalled();
  });

  it("does not consume budget work when unauthenticated", async () => {
    mockedSession.mockResolvedValue(null);

    const res = await POST(postRequest());
    expect(res.status).toBe(401);
    expect(mockedLimiter).not.toHaveBeenCalled();
  });

  it("does not consume budget work when the entitlement check denies", async () => {
    mockedEntitlement.mockResolvedValue(
      Response.json({ error: "denied" }, { status: 403 })
    );

    const res = await POST(postRequest());
    expect(res.status).toBe(403);
    expect(mockedLimiter).not.toHaveBeenCalled();
  });
});
