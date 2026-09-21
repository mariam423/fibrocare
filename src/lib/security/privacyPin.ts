import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getJwtSecret } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Server-side privacy PIN ("lock") support.
 *
 * Previously the lock lived entirely in the browser (a SHA-256 digest in
 * localStorage): anyone who extracted the NextAuth session cookie could
 * call the data server actions directly and read the user's health logs
 * without ever entering the PIN. Here the authority moves to the server:
 *
 *  - The PIN hash (`pinHash` on `User`) is bcrypt of `"<userId>:<pin>"`,
 *    so raw PINs are never stored and hashes are user-scoped (a matching
 *    hash for user A is meaningless for user B).
 *  - "Unlocked" is an httpOnly, signed cookie (HMAC-SHA256 over
 *    `userId:expiry`) set ONLY by a server action that verified the PIN
 *    (or an OS-level biometric check). Client scripts cannot forge or
 *    read it, so a stolen session cookie no longer bypasses the lock.
 *  - Sensitive data actions call `isActionLocked(user)` before returning
 *    health data; they deny (empty/error) while locked.
 */

export const PRIVACY_UNLOCK_COOKIE = "fibrocare.privacy.unlock";
/** How long a successful unlock lasts before the keypad shows again. */
export const PRIVACY_UNLOCK_TTL_MS = 24 * 60 * 60 * 1000;

const PIN_PATTERN = /^\d{4}$/;

/** Wrong PINs allowed before a temporary lockout, and how long it lasts. */
export const PIN_MAX_FAILED_ATTEMPTS = 5;
export const PIN_LOCKOUT_MS = 2 * 60 * 1000;

// Re-export so `actions.ts` keeps one import site. This module (crypto,
// bcrypt) must NOT be statically reachable from `auth.ts` / middleware —
// `auth.ts` imports { getClientIp } from the edge-safe "./clientIp" instead.
export { getClientIp } from "./clientIp";

/* ------------------------------------------------------------------ */
/* Unlock token (HMAC-signed, httpOnly cookie)                         */
/* ------------------------------------------------------------------ */

function hmacBody(userId: string, expiryMs: number): string {
  return `${userId}:${expiryMs}`;
}

function signUnlockToken(userId: string): string | null {
  const secret = getJwtSecret();
  if (!secret) return null;
  const expiry = Date.now() + PRIVACY_UNLOCK_TTL_MS;
  const sig = crypto
    .createHmac("sha256", secret)
    .update(hmacBody(userId, expiry))
    .digest("base64url");
  return `${hmacBody(userId, expiry)}:${sig}`;
}

/**
 * Test-only hook: mint a signed unlock token with a controllable expiry so
 * security tests can exercise replay (expired token) and tamper (expiry
 * swap) scenarios without advancing the clock. Production code paths call
 * `signUnlockToken` (above) which always uses `Date.now() + TTL`.
 */
export function signUnlockTokenForTest(
  userId: string,
  expiryMs: number = Date.now() + PRIVACY_UNLOCK_TTL_MS
): string | null {
  const secret = getJwtSecret();
  if (!secret) return null;
  const sig = crypto
    .createHmac("sha256", secret)
    .update(hmacBody(userId, expiryMs))
    .digest("base64url");
  return `${hmacBody(userId, expiryMs)}:${sig}`;
}

/** Constant-time verify of `userId` + expiry + HMAC signature. */
export function verifyUnlockToken(token: string, userId: string): boolean {
  const secret = getJwtSecret();
  if (!secret) return false;

  const parts = token.split(":");
  if (parts.length !== 3) return false;
  const [tokenUserId, expiryStr, sig] = parts;
  if (tokenUserId !== userId) return false;

  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || expiry <= Date.now()) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(hmacBody(tokenUserId, expiry))
    .digest("base64url");
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Read + validate the unlock cookie for `userId`. */
export async function isPrivacyUnlocked(userId: string): Promise<boolean> {
  try {
    const { cookies } = await import("next/headers");
    const token = (await cookies()).get(PRIVACY_UNLOCK_COOKIE)?.value;
    if (!token) return false;
    return verifyUnlockToken(token, userId);
  } catch {
    return false;
  }
}

/** Set the signed unlock cookie (server actions may mutate cookies). */
export async function issuePrivacyUnlock(userId: string): Promise<void> {
  const token = signUnlockToken(userId);
  if (!token) return; // missing secret → token never issued; stays locked
  const { cookies } = await import("next/headers");
  (await cookies()).set(PRIVACY_UNLOCK_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PRIVACY_UNLOCK_TTL_MS / 1000,
  });
}

/** Clear the unlock cookie. */
export async function revokePrivacyUnlock(): Promise<void> {
  const { cookies } = await import("next/headers");
  (await cookies()).set(PRIVACY_UNLOCK_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/* ------------------------------------------------------------------ */
/* PIN hashing                                                         */
/* ------------------------------------------------------------------ */

export function isValidPinFormat(pin: string): boolean {
  return PIN_PATTERN.test(pin);
}

/** bcrypt hash of `"<userId>:<pin>"` — user-scoped, never the raw PIN. */
export async function hashPin(pin: string, userId: string): Promise<string> {
  return bcrypt.hash(`${userId}:${pin}`, 10);
}

export async function verifyPinHash(
  pin: string,
  userId: string,
  pinHash: string
): Promise<boolean> {
  return bcrypt.compare(`${userId}:${pin}`, pinHash);
}

/* ------------------------------------------------------------------ */
/* Gate for sensitive data actions                                     */
/* ------------------------------------------------------------------ */

/**
 * True when a configured lock is currently active for `user` — the PIN is
 * set and the session lacks a valid signed unlock cookie. Data actions
 * should return empty/denied before reading any health data when true.
 */
export async function isActionLocked(user: {
  id: string;
  pinHash: string | null;
}): Promise<boolean> {
  if (!user.pinHash) return false;
  return !(await isPrivacyUnlocked(user.id));
}

/**
 * Route-handler variant of the lock gate.
 *
 * Resolves the caller's PIN state from the DB and returns a 423 JSON
 * response while a configured lock is engaged, or `null` when the caller
 * may proceed. The API routes (`/api/chat`, `/api/ai/*`, `/api/health/*`)
 * return health-derived data just like the sensitive server actions, so
 * they must honour the lock the same way — a valid session cookie alone
 * must never serve health data past a PIN the user set to hide it.
 */
export async function privacyLockResponse(
  userId: string
): Promise<Response | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, pinHash: true },
  });
  if (!user) return null;
  if (await isActionLocked(user)) {
    return Response.json(
      { error: "Privacy lock engaged — unlock FibroCare to continue." },
      { status: 423 }
    );
  }
  return null;
}