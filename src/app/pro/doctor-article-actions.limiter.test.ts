// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { seedDoctorArticleLibrary } from "./doctor-article-actions";
import { checkRateLimitDistributed } from "@/lib/ai/ratelimit";
import { getServerSession } from "next-auth";
import { requirePermissionResponse } from "@/lib/auth/entitlement";
// Imported from the REAL module (not mocked): these literals are the pin.
import {
  AI_ARTICLES_TAG,
  AI_ARTICLES_TTL_SECONDS,
  SEED_INFLIGHT_TTL_MS,
  SEED_RATE_LIMIT,
  SEED_RATE_WINDOW_MS,
} from "./doctor-article-cache";

/**
 * Budget pin for the seed server action.
 *
 * Server actions are directly callable endpoints, so this action must
 * enforce the same per-user budget the /api/ai/articles/seed route
 * enforces per IP — otherwise any signed-in user could bypass the route
 * by invoking the action. Both call sites import their limits from
 * ./doctor-article-cache so they can never drift apart; the values
 * themselves are pinned in seed/route.test.ts (and re-pinned here).
 *
 * The limiter check must also run AFTER the session + entitlement gates
 * (unauthenticated / non-doctor callers never consume budget) and
 * BEFORE the seeding work.
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

vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

const mockedSession = vi.mocked(getServerSession);
const mockedEntitlement = vi.mocked(requirePermissionResponse);
const mockedLimiter = vi.mocked(checkRateLimitDistributed);

beforeEach(() => {
  vi.clearAllMocks();
  mockedSession.mockResolvedValue({
    user: { id: "doctor-1" },
  } as never);
  mockedEntitlement.mockResolvedValue(null);
  // ok:false keeps the test at the gate: the seeding loop never runs,
  // so no Prisma/AI mocks are needed beyond the module stubs above.
  mockedLimiter.mockResolvedValue({
    ok: false,
    remaining: 0,
    resetAt: Date.now() + 1000,
  });
});

describe("seedDoctorArticleLibrary — budget pin", () => {
  it("pins the shared seed budget constants (must match the API route)", () => {
    expect(SEED_RATE_LIMIT).toBe(12);
    expect(SEED_RATE_WINDOW_MS).toBe(5 * 60 * 1000);
  });

  it("enforces the limiter per user with the shared constants", async () => {
    const result = await seedDoctorArticleLibrary();

    expect(mockedLimiter).toHaveBeenCalledTimes(1);
    const [key, limit, windowMs] = mockedLimiter.mock.calls[0];
    expect(key).toBe("seed:doctor-1");
    expect(limit).toBe(SEED_RATE_LIMIT);
    expect(windowMs).toBe(SEED_RATE_WINDOW_MS);
    // Denied by the budget → no generation, no error thrown.
    expect(result).toEqual({ generated: 0, total: 16 });
  });

  it("never consumes budget when unauthenticated", async () => {
    mockedSession.mockResolvedValue(null);

    await seedDoctorArticleLibrary();
    expect(mockedLimiter).not.toHaveBeenCalled();
  });

  it("never consumes budget when the entitlement check denies", async () => {
    mockedEntitlement.mockResolvedValue(
      Response.json({ error: "denied" }, { status: 403 })
    );

    await seedDoctorArticleLibrary();
    expect(mockedEntitlement).toHaveBeenCalledTimes(1);
    expect(mockedLimiter).not.toHaveBeenCalled();
  });

  it("keeps the seed-state cache on the list's tag so seeds invalidate it", async () => {
    // The gate action (getAiLibrarySeedState) counts verified rows
    // through unstable_cache with the SAME tag + TTL as the public
    // list — that sharing is what makes `revalidateTag(AI_ARTICLES_TAG)`
    // from any seed invalidate both. Pin the contract by re-importing
    // the constants the action module registers its caches with.
    expect(AI_ARTICLES_TAG).toBe("ai-articles");
    expect(AI_ARTICLES_TTL_SECONDS).toBe(60);
    expect(SEED_INFLIGHT_TTL_MS).toBe(90_000);
  });
});
