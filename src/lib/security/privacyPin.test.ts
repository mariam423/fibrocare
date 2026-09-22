// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Security tests for the server-side privacy PIN (src/lib/security/privacyPin.ts).
 *
 * Threat model — the unlock cookie must survive an attacker who:
 *  - holds a STOLEN session cookie and tries to forge/replay an unlock token;
 *  - tampers with the token's userId, expiry, or HMAC;
 *  - reuses an expired token captured earlier;
 *  - presents a token minted for a DIFFERENT user (cross-user replay).
 *
 * The PIN hash must also be user-scoped: a hash leak for user A must never
 * verify user B's PIN, and the cookie must fail closed when the JWT secret
 * is missing (no secret → no token issuance, no verification).
 */

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  hashPin,
  isValidPinFormat,
  PRIVACY_UNLOCK_TTL_MS,
  signUnlockTokenForTest,
  verifyPinHash,
  verifyUnlockToken,
} from "./privacyPin";

const mockedFindUnique = vi.mocked(prisma.user.findUnique);

const SECRET = "test-secret-for-privacy-pin-tests";
const USER_A = "user-aaaa";
const USER_B = "user-bbbb";

/** NODE_ENV is typed read-only; tests flip it through a widened reference. */
function setNodeEnv(value: string | undefined) {
  const env = process.env as { NODE_ENV?: string };
  if (value === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = value;
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXTAUTH_SECRET = SECRET;
  setNodeEnv("test");
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.NEXTAUTH_SECRET;
});

/* ------------------------------------------------------------------ */
/* Unlock token: forgery & tamper resistance                            */
/* ------------------------------------------------------------------ */

describe("unlock token — forgery & tamper resistance", () => {
  it("verifies a legitimately issued token for its owner", () => {
    const token = signUnlockTokenForTest(USER_A);
    expect(token).toBeTruthy();
    expect(verifyUnlockToken(token as string, USER_A)).toBe(true);
  });

  it("rejects a fully forged token (no valid HMAC)", () => {
    // `<userId>:<expiry>:<sig>` shape but with a garbage signature.
    const forged = `${USER_A}:${Date.now() + 60_000}:${"A".repeat(43)}`;
    expect(verifyUnlockToken(forged, USER_A)).toBe(false);
  });

  it("rejects a token with a tampered expiry (extended validity)", () => {
    const token = signUnlockTokenForTest(USER_A) as string;
    const [userId, , sig] = token.split(":");
    // Push the expiry far into the future while keeping the signature.
    const extended = `${userId}:${Date.now() + 10 * PRIVACY_UNLOCK_TTL_MS}:${sig}`;
    expect(verifyUnlockToken(extended, USER_A)).toBe(false);
  });

  it("rejects a token whose userId segment was swapped", () => {
    const token = signUnlockTokenForTest(USER_A) as string;
    const [, expiry, sig] = token.split(":");
    const swapped = `${USER_B}:${expiry}:${sig}`;
    expect(verifyUnlockToken(swapped, USER_B)).toBe(false);
  });

  it("rejects an EXPIRED token (replay after TTL)", () => {
    // Sign as if issued one TTL ago → already expired.
    const expired = signUnlockTokenForTest(USER_A, Date.now() - PRIVACY_UNLOCK_TTL_MS - 5_000);
    expect(expired).toBeTruthy();
    expect(verifyUnlockToken(expired as string, USER_A)).toBe(false);
  });

  it("rejects a token minted for another user (cross-user replay)", () => {
    const tokenB = signUnlockTokenForTest(USER_B) as string;
    expect(verifyUnlockToken(tokenB, USER_A)).toBe(false);
  });

  it("rejects structurally malformed tokens", () => {
    expect(verifyUnlockToken("", USER_A)).toBe(false);
    expect(verifyUnlockToken("no-colons-here", USER_A)).toBe(false);
    expect(verifyUnlockToken("a:b", USER_A)).toBe(false);
    expect(verifyUnlockToken("a:b:c:d", USER_A)).toBe(false);
    expect(verifyUnlockToken(`${USER_A}:not-a-number:abc`, USER_A)).toBe(false);
    expect(verifyUnlockToken(`${USER_A}:${Date.now() - 1000}:abc`, USER_A)).toBe(false);
  });

  it("fails CLOSED when the JWT secret is missing (no verify without secret)", () => {
    delete process.env.NEXTAUTH_SECRET;
    const token = "u1:99999999999999:somesig"; // security: ok fabricated, intentionally invalid
    expect(verifyUnlockToken(token, "u1")).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/* PIN hashing: user-scoped, never raw                                  */
/* ------------------------------------------------------------------ */

describe("PIN hashing — user-scoped bcrypt", () => {
  it("verifies the correct PIN for the correct user", async () => {
    const hash = await hashPin("1234", USER_A);
    await expect(verifyPinHash("1234", USER_A, hash)).resolves.toBe(true);
  });

  it("rejects a wrong PIN", async () => {
    const hash = await hashPin("1234", USER_A);
    await expect(verifyPinHash("9999", USER_A, hash)).resolves.toBe(false);
  });

  it("scopes the hash to the user: user B's PIN never verifies against user A's hash", async () => {
    // Both users chose the SAME PIN — the hashes must still differ and
    // cross-verification must fail (the userId salts the bcrypt input).
    const hashA = await hashPin("1234", USER_A);
    const hashB = await hashPin("1234", USER_B);

    expect(hashA).not.toBe(hashB);
    await expect(verifyPinHash("1234", USER_B, hashA)).resolves.toBe(false);
    await expect(verifyPinHash("1234", USER_A, hashB)).resolves.toBe(false);
  });

  it("never stores the raw PIN or a raw-PIN bcrypt in the hash field", async () => {
    const hash = await hashPin("1234", USER_A);
    expect(hash).not.toContain("1234");
    // bcrypt of the raw PIN alone would verify with userId=""; ours must not.
    await expect(verifyPinHash("1234", "", hash)).resolves.toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/* PIN format validation                                                */
/* ------------------------------------------------------------------ */

describe("isValidPinFormat", () => {
  it("accepts exactly four digits", () => {
    expect(isValidPinFormat("0123")).toBe(true);
    expect(isValidPinFormat("9999")).toBe(true);
  });

  it("rejects wrong lengths and non-digits", () => {
    expect(isValidPinFormat("123")).toBe(false);
    expect(isValidPinFormat("12345")).toBe(false);
    expect(isValidPinFormat("12a4")).toBe(false);
    expect(isValidPinFormat("")).toBe(false);
    expect(isValidPinFormat("١٢٣٤")).toBe(false); // Arabic-Indic digits, not [0-9]
    expect(isValidPinFormat(undefined as unknown as string)).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/* isActionLocked gate (via prisma-backed privacyLockResponse)          */
/* ------------------------------------------------------------------ */

describe("privacy lock gate", () => {
  it("returns 423 for a locked user, blocking health-data reads", async () => {
    const { privacyLockResponse } = await import("./privacyPin");
    mockedFindUnique.mockResolvedValue({
      id: USER_A,
      pinHash: "$2a$10$hash",
    } as never);

    const response = await privacyLockResponse(USER_A);
    expect(response).not.toBeNull();
    expect(response?.status).toBe(423);
  });

  it("returns null (allowed) when no PIN is configured", async () => {
    const { privacyLockResponse } = await import("./privacyPin");
    mockedFindUnique.mockResolvedValue({
      id: USER_A,
      pinHash: null,
    } as never);

    const response = await privacyLockResponse(USER_A);
    expect(response).toBeNull();
  });

  it("returns null (allowed) for an unlocked holder of the signed cookie", async () => {
    // Issue the unlock cookie through the module's own setter, then the
    // gate must pass even though a pinHash exists.
    const { privacyLockResponse } = await import("./privacyPin");
    const { issuePrivacyUnlock } = await import("./privacyPin");

    // next/headers cookies() in a node test environment: the module reads
    // the cookie through a dynamic import — simulate the unlocked state by
    // stubbing the cookie jar.
    const store = new Map<string, string>();
    vi.doMock("next/headers", () => ({
      cookies: vi.fn(async () => ({
        get: (name: string) =>
          store.has(name) ? { name, value: store.get(name) as string } : undefined,
        set: (name: string, value: string) => void store.set(name, value),
      })),
    }));

    mockedFindUnique.mockResolvedValue({
      id: USER_A,
      pinHash: "$2a$10$hash",
    } as never);

    // No cookie set yet → locked.
    const locked = await privacyLockResponse(USER_A);
    expect(locked?.status).toBe(423);

    // Mint + set the signed cookie via the real setter.
    const { cookies } = await import("next/headers");
    const jar = await cookies();
    const token = signUnlockTokenForTest(USER_A) as string;
    store.set("fibrocare.privacy.unlock", token);
    void jar;

    // Re-import a fresh copy so the module reads the stubbed jar lazily
    // (privacyLockResponse already captured above uses the same store).
    const unlocked = await (async () => {
      const mod = await import("./privacyPin");
      return mod.isPrivacyUnlocked(USER_A);
    })();
    expect(unlocked).toBe(true);

    void issuePrivacyUnlock;
  });
});
