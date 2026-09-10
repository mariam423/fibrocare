/**
 * Unit tests for the brute-force gate in the credentials provider.
 *
 * The `authorize` callback is driven directly with a mocked limiter and a
 * mocked Prisma client, so the tests assert the *contract* — lockout happens
 * BEFORE any database access, every attempt consumes a slot, exhausted
 * accounts are rejected with the same generic null (no existence oracle) —
 * not the behavior of a specific limiter backend.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/ai/ratelimit", () => ({
  checkRateLimitDistributed: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: { compare: vi.fn() },
}));

import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { checkRateLimitDistributed } from "@/lib/ai/ratelimit";
import { prisma } from "@/lib/prisma";

const mockedLimiter = vi.mocked(checkRateLimitDistributed);
const mockedFindUnique = vi.mocked(prisma.user.findUnique);
// bcryptjs `compare` is overloaded (promise + callback); vi.mocked resolves
// to the last (void) overload, so pin the promise signature explicitly.
const mockedCompare = vi.mocked(
  bcrypt.compare as (a: string, b: string) => Promise<boolean>
);

/**
 * Extract the credentials `authorize` callback from the NextAuth config.
 * next-auth v4 wraps `CredentialsProvider({...})`: the user config (with
 * `authorize`) lands in the provider's `options` field, while the
 * top-level `authorize` property stays the library's `() => null` default.
 */
function getAuthorize() {
  const provider = authOptions.providers.find(
    (p) => "id" in p && (p as { id: string }).id === "credentials"
  ) as
    | {
        options?: { authorize?: (credentials: unknown) => Promise<unknown> };
      }
    | undefined;
  const authorize = provider?.options?.authorize;
  if (!authorize) {
    throw new Error("credentials authorize not found in authOptions");
  }
  return authorize;
}

const KEY_PREFIX = "login:";

describe("credentials authorize: brute-force gate", () => {
  const authorize = getAuthorize();
  const email = "victim@example.com";

  beforeEach(() => {
    vi.clearAllMocks();
    // Default happy-path mocks: limiter allows, user exists, password valid.
    mockedLimiter.mockResolvedValue({
      ok: true,
      remaining: 9,
      resetAt: Date.now() + 60_000,
    });
    mockedFindUnique.mockResolvedValue({
      id: "user-1",
      email,
      name: "Victim",
      signupRole: "PATIENT",
      passwordHash: "$2a$10$hash",
    } as never);
    mockedCompare.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("consumes a limiter slot keyed by the lowercased email", async () => {
    await authorize({ email: "  VICTIM@Example.COM ", password: "pw" });

    expect(mockedLimiter).toHaveBeenCalledWith(
      `login:${email}`,
      expect.any(Number),
      expect.any(Number)
    );
  });

  it("allows a valid login when the budget is intact", async () => {
    const result = await authorize({ email, password: "pw" });

    expect(result).toMatchObject({ id: "user-1", email });
    expect(mockedCompare).toHaveBeenCalledOnce();
  });

  it("rejects the attempt WITHOUT touching the DB when the budget is exhausted", async () => {
    // 11th attempt within the window: limiter says no.
    mockedLimiter.mockResolvedValue({
      ok: false,
      remaining: 0,
      resetAt: Date.now() + 60_000,
    });

    const result = await authorize({ email, password: "pw" });

    expect(result).toBeNull();
    expect(mockedFindUnique).not.toHaveBeenCalled();
    expect(mockedCompare).not.toHaveBeenCalled();
  });

  it("exhausts the budget after the configured attempt cap", async () => {
    // Drive 10 attempts through the gate, then the 11th must be locked out.
    mockedCompare.mockResolvedValue(false); // wrong password — still consumes a slot
    for (let i = 0; i < 10; i++) {
      await authorize({ email, password: "wrong" });
    }
    expect(mockedLimiter).toHaveBeenCalledTimes(10);

    mockedLimiter.mockResolvedValue({
      ok: false,
      remaining: 0,
      resetAt: Date.now() + 60_000,
    });
    const locked = await authorize({ email, password: "pw" });
    expect(locked).toBeNull();
    expect(mockedFindUnique).toHaveBeenCalledTimes(10); // never on the locked attempt
  });

  it("returns the same generic null for unknown emails (no existence oracle)", async () => {
    mockedFindUnique.mockResolvedValue(null);
    const result = await authorize({ email: "nobody@example.com", password: "pw" });
    expect(result).toBeNull();
  });

  it("returns null for missing credentials without consuming a slot", async () => {
    await authorize(undefined);
    await authorize({ email: email, password: "" });

    expect(mockedLimiter).not.toHaveBeenCalled();
    expect(mockedFindUnique).not.toHaveBeenCalled();
  });
});
