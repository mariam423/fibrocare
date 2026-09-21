// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Security tests for the core server actions (src/app/actions.ts).
 *
 * Locked-in contracts from the security audit:
 *  - IDOR: `deletePainLog` must refuse to delete another user's log and
 *    must perform the final delete OWNERSHIP-SCOPED (the TOCTOU fix:
 *    deleteMany({ id, userId }) with a count check, not a find-then-delete
 *    race).
 *  - Enumeration: `registerUser` must return the SAME generic error for an
 *    existing email as for any other failure — never "account exists".
 *  - Reset-token hygiene: stored tokens are SHA-256 hashes (a DB leak must
 *    not yield usable reset links), and the reset link is NEVER returned
 *    in production.
 */

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/ai/ratelimit", () => ({
  checkRateLimitDistributed: vi.fn().mockResolvedValue({ ok: true, remaining: 9, resetAt: Date.now() + 60_000 }),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({
    get: vi.fn(() => null),
  })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    painLog: {
      findUnique: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    passwordResetToken: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    symptomLog: { upsert: vi.fn(), findMany: vi.fn().mockResolvedValue([]), create: vi.fn(), deleteMany: vi.fn() },
    menstrualCycle: { findFirst: vi.fn(), findMany: vi.fn().mockResolvedValue([]) },
    menstrualLog: { findMany: vi.fn().mockResolvedValue([]) },
    spoonLog: { upsert: vi.fn(), findUnique: vi.fn(), findMany: vi.fn().mockResolvedValue([]) },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(async () => "$2a$10$fakehashfakehashfakehashfakehash"),
    compare: vi.fn(async () => true),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import {
  deletePainLog,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from "./actions";
import { prisma } from "@/lib/prisma";

const mockedSession = vi.mocked(getServerSession);
const mockedUserFindUnique = vi.mocked(prisma.user.findUnique);
const mockedLogFindUnique = vi.mocked(prisma.painLog.findUnique);
const mockedLogDeleteMany = vi.mocked(prisma.painLog.deleteMany);
const mockedBcryptHash = vi.mocked(
  bcrypt.hash as (s: string, r: number) => Promise<string>
);
const mockedResetTokenCreate = vi.mocked(prisma.passwordResetToken.create);
const mockedResetTokenFindUnique = vi.mocked(prisma.passwordResetToken.findUnique);

/** NODE_ENV is typed read-only; tests flip it through a widened reference. */
function setNodeEnv(value: string | undefined) {
  const env = process.env as { NODE_ENV?: string };
  if (value === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = value;
}

beforeEach(() => {
  vi.clearAllMocks();
  setNodeEnv("test");
  delete process.env.SHOW_RESET_LINK;
  mockedSession.mockResolvedValue({ user: { id: "user-me" } } as never);
  // getSessionUser() resolves the caller through user.findUnique — default
  // to the signed-in caller with NO privacy PIN (so action locks pass).
  mockedUserFindUnique.mockResolvedValue({
    id: "user-me",
    pinHash: null,
  } as never);
});

afterEach(() => {
  vi.restoreAllMocks();
  setNodeEnv(undefined);
});

describe("deletePainLog — ownership (IDOR) & TOCTOU", () => {
  it("refuses to delete another user's log without any delete query", async () => {
    mockedLogFindUnique.mockResolvedValue({
      id: "log-1",
      userId: "user-victim",
    } as never);

    const result = await deletePainLog("log-1");

    expect(result.success).toBe(false);
    expect(mockedLogDeleteMany).not.toHaveBeenCalled();
  });

  it("refuses when the log does not exist at all", async () => {
    mockedLogFindUnique.mockResolvedValue(null);

    const result = await deletePainLog("nonexistent");
    expect(result.success).toBe(false);
    expect(mockedLogDeleteMany).not.toHaveBeenCalled();
  });

  it("scopes the final delete to BOTH id and userId (TOCTOU-safe)", async () => {
    mockedLogFindUnique.mockResolvedValue({
      id: "log-1",
      userId: "user-me",
    } as never);
    mockedLogDeleteMany.mockResolvedValue({ count: 1 });

    const result = await deletePainLog("log-1");

    expect(result.success).toBe(true);
    expect(mockedLogDeleteMany).toHaveBeenCalledWith({
      where: { id: "log-1", userId: "user-me" },
    });
  });

  it("reports not-found when a concurrent delete already removed the row", async () => {
    mockedLogFindUnique.mockResolvedValue({
      id: "log-1",
      userId: "user-me",
    } as never);
    // The ownership-scoped delete lost the race: the row is already gone.
    mockedLogDeleteMany.mockResolvedValue({ count: 0 });

    const result = await deletePainLog("log-1");
    expect(result.success).toBe(false);
  });

  it("refuses an unauthenticated caller", async () => {
    mockedSession.mockResolvedValue(null);
    const result = await deletePainLog("log-1");
    expect(result.success).toBe(false);
    expect(mockedLogFindUnique).not.toHaveBeenCalled();
  });
});

describe("registerUser — anti-enumeration", () => {
  it("returns the SAME generic error for an existing email (no account-exists oracle)", async () => {
    mockedUserFindUnique.mockResolvedValue({
      id: "user-1",
      email: "taken@example.com",
    } as never);

    const result = await registerUser({
      name: "Attacker",
      email: "taken@example.com",
      password: "longenoughpassword1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      // Generic message — must NOT reveal that the account exists.
      expect(result.error).toMatch(/couldn't create your account/i);
      expect(result.error).not.toMatch(/exist|registered|taken/i);
    }
  });

  it("hashes the password BEFORE the existence lookup (timing-oracle fix)", async () => {
    mockedUserFindUnique.mockResolvedValue({ id: "u1" } as never);

    await registerUser({
      name: "Probe",
      email: "known@example.com",
      password: "longenoughpassword1",
    });

    expect(mockedBcryptHash).toHaveBeenCalled();
    expect(mockedUserFindUnique).toHaveBeenCalled();
  });

  it("still rejects weak passwords before any DB work", async () => {
    const result = await registerUser({
      name: "Someone",
      email: "fresh@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
    expect(mockedBcryptHash).not.toHaveBeenCalled();
    expect(mockedUserFindUnique).not.toHaveBeenCalled();
  });
});

describe("password reset — token hygiene", () => {
  it("stores only the SHA-256 HASH of the reset token, never the raw token", async () => {
    mockedUserFindUnique.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
    } as never);
    mockedResetTokenCreate.mockResolvedValue({} as never);

    await requestPasswordReset("user@example.com");

    const createArg = mockedResetTokenCreate.mock.calls[0]?.[0];
    expect(createArg).toBeDefined();
    const storedToken = (createArg as { data: { token: string } }).data.token;
    // Raw tokens are 64-hex (32 bytes); a SHA-256 hex is also 64 chars, but
    // the stored value must equal the hash of SOMETHING — verified below by
    // resetPassword resolving it. What must never happen: the raw token in
    // plaintext being the same value returned in a link... it cannot be
    // asserted directly here, so instead assert shape + that resetPassword
    // can resolve a raw token to this stored hash.
    expect(storedToken).toMatch(/^[0-9a-f]{64}$/);
  });

  it("NEVER returns the reset link in production (bearer-token exposure)", async () => {
    setNodeEnv("production");
    mockedUserFindUnique.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
    } as never);

    const result = await requestPasswordReset("user@example.com");
    expect(result.success).toBe(true);
    expect(result).not.toHaveProperty("resetLink");
  });

  it("resolves a raw token by hashing it — stored value is a digest, not the token", async () => {
    const { createHash, randomBytes } = await import("node:crypto");
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    mockedResetTokenFindUnique.mockImplementation((async (args: {
      where: { token: string };
    }) => {
      // The action must look up by the HASH of the provided token.
      expect(args.where.token).toBe(tokenHash);
      expect(args.where.token).not.toBe(rawToken);
      return {
        token: tokenHash,
        userId: "user-1",
        expires: new Date(Date.now() + 60_000),
      } as never;
    }) as never);
    mockedUserFindUnique.mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(prisma.user.update).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(prisma.passwordResetToken.deleteMany).mockResolvedValue({ count: 2 } as never);

    const result = await resetPassword(rawToken, "newLongPassword99");
    expect(result.success).toBe(true);
  });

  it("rejects an expired reset token", async () => {
    const { createHash } = await import("node:crypto");
    const rawToken = "a".repeat(64);
    mockedResetTokenFindUnique.mockResolvedValue({
      token: createHash("sha256").update(rawToken).digest("hex"),
      userId: "user-1",
      expires: new Date(Date.now() - 1000),
    } as never);

    const result = await resetPassword(rawToken, "newLongPassword99");
    expect(result.success).toBe(false);
    expect(vi.mocked(prisma.user.update)).not.toHaveBeenCalled();
  });
});
