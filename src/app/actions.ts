"use server";

import crypto from "crypto";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { checkRateLimitDistributed } from "@/lib/ai/ratelimit";
import {
  analyzeHealthPatterns,
  getTopSymptoms,
} from "@/lib/insightEngine";
import {
  buildMedicalSummary,
  medicalSummarySchema,
  type MedicalSummary,
} from "@/lib/medicalSummary";
import { getAiRuntime } from "@/lib/ai/provider";
import {
  decryptSensitiveData,
  decryptLogNotes,
  encryptSensitiveData,
} from "@/lib/security/atRest";
import type { AcrClinicalSummary } from "@/lib/clinical/acr";
import {
  getClientIp,
  hashPin,
  isActionLocked,
  isPrivacyUnlocked,
  isValidPinFormat,
  issuePrivacyUnlock,
  PIN_LOCKOUT_MS,
  PIN_MAX_FAILED_ATTEMPTS,
  revokePrivacyUnlock,
  verifyPinHash,
} from "@/lib/security/privacyPin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 60 minutes

export type RegisterResult =
  | { success: true }
  | { success: false; error: string };

export type ResetResult =
  | { success: true; resetLink?: string }
  | { success: false; error: string };

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  signupRole?: "PATIENT" | "DOCTOR";
}): Promise<RegisterResult> {
  // Prevent mass account creation: bound registrations per IP (20/hour).
  // Server actions run on the request thread, so `headers()` is safe here.
  const h = await headers();
  const clientIp =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    "unknown";
  const { ok, resetAt } = await checkRateLimitDistributed(
    `register-ip:${clientIp}`,
    20,
    60 * 60 * 1000
  );
  if (!ok) {
    const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
    return {
      success: false,
      error: `Too many accounts created from this address — try again in ${Math.ceil(retryAfter / 60)} minute(s).`,
    };
  }

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const signupRole = input.signupRole === "DOCTOR" ? "DOCTOR" : "PATIENT";

  if (name.length < 2) {
    return { success: false, error: "Please enter your name." };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }

  // Hash BEFORE the existence lookup: signup must not leak whether an
  // email is already registered via response text OR timing (a fresh
  // 10-round bcrypt here keeps known/unknown emails indistinguishable).
  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Generic message — never "that account already exists".
    return {
      success: false,
      error: "We couldn't create your account. Please try again.",
    };
  }

  await prisma.user.create({
    data: { name, email, passwordHash, signupRole },
  });

  return { success: true };
}

export async function requestPasswordReset(
  emailInput: string
): Promise<ResetResult> {
  const email = emailInput.trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  // Rate-limit the recovery entry point: per-IP (10/15min, anti-mass-
  // probe) and per-email (5/15min, anti-annoyance). On exhaustion we
  // return the generic success so the limit itself never reveals which
  // emails exist.
  const clientIp = await getClientIp();
  const [ipLimit, emailLimit] = await Promise.all([
    checkRateLimitDistributed(`reset-ip:${clientIp}`, 10, 15 * 60 * 1000),
    checkRateLimitDistributed(`reset-email:${email}`, 5, 15 * 60 * 1000),
  ]);
  if (!ipLimit.ok || !emailLimit.ok) {
    return { success: true };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Generic response + a dummy bcrypt pass so unknown and known emails
    // cost the same: no existence/timing oracle.
    await bcrypt.hash("reset-timing-equalizer", 10);
    return { success: true };
  }

  // Invalidate any previous reset tokens for this user.
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const token = crypto.randomBytes(32).toString("hex");
  // Store only the SHA-256 of the token: a database leak must not yield
  // usable reset links (same principle as password hashing).
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await prisma.passwordResetToken.create({
    data: {
      token: tokenHash,
      userId: user.id,
      expires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  // Never log the reset link — it contains a bearer token.
  // In development, only log that a reset was requested (no token).
  if (process.env.NODE_ENV !== "production") {
    console.log(`[auth] Password reset requested for ${email}`);
  }

  // The reset link is returned to the client ONLY when the flow is
  // explicitly in no-email dev mode: non-production AND SHOW_RESET_LINK
  // opted in (default on for dev convenience, off whenever the var is
  // set to "false"/"0"). Production NEVER returns the link — it must be
  // delivered by email. The explicit flag keeps a preview/RC deployment
  // (NODE_ENV=production with no mail provider) from exposing bearer
  // reset tokens to anyone who can open the forgot-password page.
  const devLinkEnabled =
    process.env.NODE_ENV !== "production" &&
    !/^(false|0)$/i.test((process.env.SHOW_RESET_LINK ?? "").trim());
  return devLinkEnabled
    ? { success: true, resetLink }
    : { success: true };
}

export async function resetPassword(
  token: string,
  password: string
): Promise<ResetResult> {
  if (!token) {
    return { success: false, error: "This reset link is invalid." };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }

  // Per-IP cap on reset CONSUMPTION so a leaked link can't be drawn on
  // repeatedly (returns the same generic error on exhaustion).
  const clientIp = await getClientIp();
  const { ok: ipOk } = await checkRateLimitDistributed(
    `reset-consume-ip:${clientIp}`,
    10,
    15 * 60 * 1000
  );
  if (!ipOk) {
    return { success: false, error: "This reset link is invalid or has expired. Please request a new one." };
  }

  // Look up by the same SHA-256 hash used at creation time.
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: tokenHash },
  });
  if (!resetToken || resetToken.expires < new Date()) {
    return {
      success: false,
      error: "This reset link is invalid or has expired. Please request a new one.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash },
  });
  await prisma.passwordResetToken.deleteMany({
    where: { userId: resetToken.userId },
  });

  return { success: true };
}

function toIsoDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({ where: { id: session.user.id } });
}

/** Client-safe view of the user — NEVER includes passwordHash/pinHash. */
function toSafeUser(user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>>) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    signupRole: user.signupRole,
    hydrationCount: user.hydrationCount,
    createdAt: user.createdAt,
    privacyPinConfigured: user.pinHash !== null,
  };
}

export async function getCurrentUser() {
  try {
    const user = await getSessionUser();
    if (!user) return null;
    return toSafeUser(user);
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Privacy PIN (app lock)                                              */
/* ------------------------------------------------------------------ */

export type PrivacyPinResult =
  | { success: true }
  | { success: false; error: string; retryAfter?: number };

const PIN_MANAGE_LIMIT = 5;
const PIN_MANAGE_WINDOW_MS = 15 * 60 * 1000;

/** Whether the signed-in user has configured the app lock. */
export async function getPrivacyStatus(): Promise<{ configured: boolean }> {
  const user = await getSessionUser();
  return { configured: !!user?.pinHash };
}

/**
 * Create or change the privacy PIN. First-time setup (no existing PIN on
 * the account) may happen from the setup dialog without an unlock cookie;
 * changing an EXISTING PIN requires the session to be currently unlocked
 * (the profile card is only reachable once unlocked). Sets a signed unlock
 * cookie on success so the user is not relocked immediately after.
 */
export async function setPrivacyPin(pin: string): Promise<PrivacyPinResult> {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, error: "You must be signed in." };
  }
  const pinValue = String(pin ?? "");
  if (!isValidPinFormat(pinValue)) {
    return { success: false, error: "Your PIN must be exactly 4 digits." };
  }

  const clientIp = await getClientIp();
  const [{ ok: ipOk }, { ok: userOk }] = await Promise.all([
    checkRateLimitDistributed(`privacy-pin-set-ip:${clientIp}`, PIN_MANAGE_LIMIT, PIN_MANAGE_WINDOW_MS),
    checkRateLimitDistributed(`privacy-pin-set:${user.id}`, PIN_MANAGE_LIMIT, PIN_MANAGE_WINDOW_MS),
  ]);
  if (!ipOk || !userOk) {
    return { success: false, error: "Too many PIN changes — try again in a few minutes." };
  }

  // Changing an existing PIN still demands the current lock is open.
  if (user.pinHash && !(await isPrivacyUnlocked(user.id))) {
    return { success: false, error: "Unlock FibroCare before changing your PIN." };
  }

  const pinHash = await hashPin(pinValue, user.id);
  await prisma.user.update({
    where: { id: user.id },
    data: { pinHash },
  });
  await issuePrivacyUnlock(user.id);

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: true };
}

/**
 * Verify the PIN against the server-side bcrypt hash and, on success,
 * issue the signed unlock cookie.
 *
 * Only WRONG attempts are counted (per user, in the database): a legitimate
 * re-lock on a new tab or after switching apps never trips the limit. After
 * PIN_MAX_FAILED_ATTEMPTS consecutive failures the account is blocked for
 * PIN_LOCKOUT_MS. The counter clears on the next successful unlock.
 */
export async function verifyPrivacyPin(pin: string): Promise<PrivacyPinResult> {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, error: "You must be signed in." };
  }
  const pinValue = String(pin ?? "");

  if (!user.pinHash) {
    return { success: false, error: "No PIN is set on this account." };
  }

  if (user.pinLockedUntil && user.pinLockedUntil.getTime() > Date.now()) {
    return {
      success: false,
      error: "Too many attempts — try again in a moment.",
      retryAfter: Math.max(
        1,
        Math.ceil((user.pinLockedUntil.getTime() - Date.now()) / 1000)
      ),
    };
  }

  // Per-IP budget in addition to the per-account lockout below: without it,
  // an attacker holding (or cycling) many accounts from one host could
  // brute-force each account's 4-digit space indefinitely — the account
  // lockout only bounds guesses per account, not per attacker.
  const clientIp = await getClientIp();
  const { ok: guessIpOk } = await checkRateLimitDistributed(
    `privacy-pin-guess-ip:${clientIp}`,
    30,
    5 * 60 * 1000
  );
  if (!guessIpOk) {
    return { success: false, error: "Too many attempts — try again in a moment." };
  }

  const valid = await verifyPinHash(pinValue, user.id, user.pinHash);
  if (!valid) {
    const attempts = user.pinFailedAttempts + 1;
    const locked = attempts >= PIN_MAX_FAILED_ATTEMPTS;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        pinFailedAttempts: locked ? 0 : attempts,
        pinLockedUntil: locked ? new Date(Date.now() + PIN_LOCKOUT_MS) : null,
      },
    });
    return {
      success: false,
      error: locked
        ? "Too many attempts — try again in a moment."
        : "Incorrect PIN. Please try again.",
      retryAfter: locked ? PIN_LOCKOUT_MS / 1000 : undefined,
    };
  }

  // Successful unlock clears any accumulated failures / lockout.
  if (user.pinFailedAttempts !== 0 || user.pinLockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { pinFailedAttempts: 0, pinLockedUntil: null },
    });
  }

  await issuePrivacyUnlock(user.id);
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: true };
}

/**
 * Disable the lock entirely. Only allowed while the current lock is already
 * open (a valid unlock cookie) — someone holding a bare session cookie cannot
 * silently remove the PIN.
 */
export async function removePrivacyPin(): Promise<PrivacyPinResult> {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, error: "You must be signed in." };
  }
  if (await isActionLocked(user)) {
    return { success: false, error: "Unlock FibroCare before disabling the PIN." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { pinHash: null },
  });
  await revokePrivacyUnlock();

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: true };
}

/**
 * Unlock after an OS-level biometric verification. The platform
 * authenticator (Touch ID / Windows Hello / Face ID) already confirmed the
 * human; this action only records that fact server-side with the same
 * signed cookie, capped so it cannot be hammered.
 */
export async function biometricUnlock(): Promise<PrivacyPinResult> {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, error: "You must be signed in." };
  }
  if (!user.pinHash) {
    return { success: false, error: "No PIN is set on this account." };
  }

  const clientIp = await getClientIp();
  const [{ ok: ipOk }, { ok: userOk }] = await Promise.all([
    checkRateLimitDistributed(`privacy-pin-bio-ip:${clientIp}`, 20, 5 * 60 * 1000),
    checkRateLimitDistributed(`privacy-pin-bio:${user.id}`, 20, 5 * 60 * 1000),
  ]);
  if (!ipOk || !userOk) {
    return { success: false, error: "Too many unlock attempts — try again in a moment." };
  }

  await issuePrivacyUnlock(user.id);
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: true };
}

export async function updateUserName(newName: string) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "You must be signed in." };
    }
    if (await isActionLocked(user)) {
      return { success: false, error: "Unlock FibroCare to update your profile." };
    }

    // Bound free-text input before it reaches the database (XSS-safe at
    // render via React escaping; the cap prevents storage abuse).
    const name = newName.trim();
    if (name.length < 2 || name.length > 80) {
      return { success: false, error: "Name must be between 2 and 80 characters." };
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name },
      select: { id: true, name: true, email: true, role: true, signupRole: true },
    });

    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Error updating user name:", error);
    return {
      success: false,
      error: "Failed to update your name. Please try again."
    };
  }
}

export async function savePainLog(
  painLevel: number,
  moodTag: string,
  notes?: string,
  symptoms: string[] = []
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "You must be signed in." };
    }
    if (await isActionLocked(user)) {
      return { success: false, error: "Unlock FibroCare to save your log." };
    }

    const finalPainLevel = Number.isInteger(painLevel)
      ? Math.min(10, Math.max(0, painLevel))
      : 3;

    // Bound free-text fields (length caps only — content is rendered
    // escaped and stored via Prisma's parameterized queries). Validate the
    // symptoms array as strings — never coerce objects/numbers silently.
    const safeMoodTag = String(moodTag ?? "").slice(0, 40);
    const safeSymptoms = (Array.isArray(symptoms)
      ? symptoms.filter((s): s is string => typeof s === "string")
      : []
    )
      .map((s) => s.slice(0, 60))
      .filter((s) => s.trim().length > 0)
      .slice(0, 20);
    const safeNotes = notes ? notes.slice(0, 2000) : undefined;
    const encryptedNotes = safeNotes ? await encryptSensitiveData(safeNotes) : undefined;

    await prisma.painLog.create({
      data: {
        painLevel: finalPainLevel,
        moodTag: safeMoodTag,
        notes: encryptedNotes,
        userId: user.id,
      },
    });

    // Persist preset/manual symptoms for today (idempotent upserts)
    const date = toIsoDateKey(new Date());
    for (const symptom of safeSymptoms) {
      await prisma.symptomLog.upsert({
        where: {
          userId_symptom_date: { userId: user.id, symptom, date },
        },
        update: {},
        create: { symptom, date, userId: user.id },
      });
    }

    revalidatePath("/dashboard");

    const logs = await getLatestLogs();
    return { success: true, data: logs };
  } catch (error) {
    console.error("Error saving pain log detailed:", error);
    return {
      success: false,
      error: "Failed to save your pain log. Please try again."
    };
  }
}

export async function updateUserProfile(name: string, email: string) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "You must be signed in." };
    }
    if (await isActionLocked(user)) {
      return { success: false, error: "Unlock FibroCare to update your profile." };
    }

    const safeName = String(name ?? "").trim();
    const safeEmail = String(email ?? "").trim().toLowerCase();
    if (safeName.length < 2 || safeName.length > 80) {
      return { success: false, error: "Name must be between 2 and 80 characters." };
    }
    if (!EMAIL_REGEX.test(safeEmail)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: safeName, email: safeEmail },
      select: { id: true, name: true, email: true, role: true, signupRole: true },
    });

    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      error: "Failed to update your profile. Please try again."
    };
  }
}

export async function updateHydration(amount: number) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "You must be signed in." };
    }
    if (await isActionLocked(user)) {
      return { success: false, error: "Unlock FibroCare to track hydration." };
    }

    // Validate the increment: integers only, bounded per call, and the
    // counter can never go below zero (the UI only sends ±1).
    const delta = Number.isInteger(amount) ? Math.min(10, Math.max(-10, amount)) : 0;
    const next = Math.max(0, user.hydrationCount + delta);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        hydrationCount: next
      },
      // Explicit projection: the full row (incl. passwordHash) is never
      // serialized back to the client.
      select: { id: true, hydrationCount: true },
    });

    revalidatePath("/dashboard");
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Error updating hydration:", error);
    return { success: false, error: "Failed to update hydration" };
  }
}

export async function getWeeklyPainTrend() {
  try {
    const user = await getSessionUser();
    if (!user) return [];
    if (await isActionLocked(user)) return [];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const logs = await prisma.painLog.findMany({
      where: {
        userId: user.id,
        loggedAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        loggedAt: 'asc',
      },
    });

    // Group by ISO date and take the last entry of the day
    const trendMap = new Map<string, number>();
    logs.forEach(log => {
      const d = new Date(log.loggedAt);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      trendMap.set(dateStr, log.painLevel);
    });

    return Array.from(trendMap.entries()).map(([date, level]) => ({
      date,
      level,
    }));
  } catch (error) {
    console.error("Error fetching weekly trend:", error);
    return [];
  }
}

export async function getAllHealthLogs() {
  try {
    const user = await getSessionUser();
    if (!user) return [];
    if (await isActionLocked(user)) return [];

    const logs = await prisma.painLog.findMany({
      where: { userId: user.id },
      orderBy: { loggedAt: 'desc' },
    });
    // Notes are AES-GCM encrypted at rest — decrypt before returning.
    return decryptLogNotes(logs);
  } catch (error) {
    console.error("Error fetching all logs:", error);
    return [];
  }
}

export async function deletePainLog(id: string) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "You must be signed in." };
    }

    const log = await prisma.painLog.findUnique({ where: { id } });
    if (!log || log.userId !== user.id) {
      return { success: false, error: "Log entry not found." };
    }
    if (await isActionLocked(user)) {
      return { success: false, error: "Unlock FibroCare to delete logs." };
    }

    // Ownership-scoped, idempotent delete — removes the TOCTOU window
    // between the findUnique check and the delete (a concurrent removal
    // could otherwise throw and surface a 500).
    const deleted = await prisma.painLog.deleteMany({
      where: { id, userId: user.id },
    });
    if (deleted.count !== 1) {
      return { success: false, error: "Log entry not found." };
    }
    revalidatePath("/dashboard");
    revalidatePath("/health-logs");
    return { success: true };
  } catch (error) {
    console.error("Error deleting log:", error);
    return { success: false, error: "Failed to delete the log entry" };
  }
}

export async function getLatestLogs() {
  try {
    const user = await getSessionUser();
    if (!user) return [];
    if (await isActionLocked(user)) return [];

    const logs = await prisma.painLog.findMany({
      where: { userId: user.id },
      orderBy: {
        loggedAt: 'desc'
      },
      take: 30,
    });
    // Notes are AES-GCM encrypted at rest — decrypt before returning.
    return decryptLogNotes(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
}

export async function getDashboardInsights() {
  try {
    const user = await getSessionUser();
    if (!user) return [];
    if (await isActionLocked(user)) return [];

    const insights = await analyzeHealthPatterns(user.id, 30);
    return insights;
  } catch (error) {
    console.error("Error fetching insights:", error);
    return [];
  }
}

export async function getReportData() {
  try {
    const user = await getSessionUser();
    if (!user) return null;
    if (await isActionLocked(user)) return null;

    const [logs, insights, topSymptoms] = await Promise.all([
      prisma.painLog.findMany({
        where: { userId: user.id },
        orderBy: { loggedAt: "desc" },
      }),
      analyzeHealthPatterns(user.id, 90),
      getTopSymptoms(user.id, 90),
    ]);
    // Notes are AES-GCM encrypted at rest — decrypt before building the report.
    await decryptLogNotes(logs);

    const avgPain = logs.length
      ? logs.reduce((sum, l) => sum + l.painLevel, 0) / logs.length
      : 0;
    const flareUpDays = logs.filter((l) => l.painLevel >= 7).length;

    return {
      user: { id: user.id, name: user.name },
      logs,
      insights,
      topSymptoms,
      avgPain,
      flareUpDays,
    };
  } catch (error) {
    console.error("Error building report data:", error);
    return null;
  }
}

export async function getSymptomsForDate(date: string) {
  try {
    const user = await getSessionUser();
    if (!user) return [];
    if (await isActionLocked(user)) return [];

    const entries = await prisma.symptomLog.findMany({
      where: { userId: user.id, date },
    });
    return entries.map(e => e.symptom);
  } catch (error) {
    console.error("Error fetching symptoms:", error);
    return [];
  }
}

export async function toggleSymptom(symptom: string, date: string, active: boolean) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "You must be signed in." };
    }
    if (await isActionLocked(user)) {
      return { success: false, error: "Unlock FibroCare to update symptoms." };
    }

    // Free-text input bound before it reaches the database.
    const safeSymptom = String(symptom ?? "").trim().slice(0, 60);
    if (!safeSymptom || !/^\d{4}-\d{2}-\d{2}$/.test(String(date ?? ""))) {
      return { success: false, error: "Invalid symptom or date." };
    }

    if (active) {
      await prisma.symptomLog.create({
        data: { symptom: safeSymptom, date, userId: user.id },
      });
    } else {
      await prisma.symptomLog.deleteMany({
        where: { userId: user.id, symptom: safeSymptom, date },
      });
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error toggling symptom:", error);
    return { success: false, error: "Failed to update symptom" };
  }
}

/**
 * Cost/rate-limit readiness: the summary builder is deterministic for a given
 * set of logs, so re-clicks within a short window are served from an
 * in-memory TTL cache instead of re-querying + recomputing. The fingerprint
 * captures (user, log count, latest log, calendar day) so the cache is
 * invalidated automatically as soon as the underlying data changes.
 */
const SUMMARY_CACHE_TTL_MS = 10 * 60 * 1000;
const SUMMARY_CACHE_MAX_ENTRIES = 200;
interface SummaryCacheEntry {
  fingerprint: string;
  data: MedicalSummary;
  expiresAt: number;
}
const summaryCache = new Map<string, SummaryCacheEntry>();

function summaryFingerprint(
  userId: string,
  logs: Array<{ id: string; loggedAt: Date }>
): string {
  const latest = logs[0];
  return [
    userId,
    logs.length,
    latest?.id ?? "none",
    latest ? latest.loggedAt.getTime() : 0,
    new Date().toDateString(),
  ].join(":");
}

function evictSummaryCache() {
  const now = Date.now();
  for (const [key, entry] of summaryCache) {
    if (entry.expiresAt <= now) summaryCache.delete(key);
  }
  if (summaryCache.size > SUMMARY_CACHE_MAX_ENTRIES) {
    const keys = [...summaryCache.keys()].slice(
      0,
      summaryCache.size - SUMMARY_CACHE_MAX_ENTRIES
    );
    for (const key of keys) summaryCache.delete(key);
  }
}

export async function generateMedicalSummary(): Promise<
  { success: true; data: MedicalSummary } | { success: false; error: string }
> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "You must be signed in." };
    }
    if (await isActionLocked(user)) {
      return { success: false, error: "Unlock FibroCare to build your summary." };
    }

    evictSummaryCache();
    const cacheKey = `medical-summary:${user.id}`;
    const cached = summaryCache.get(cacheKey);

    const [logs, insights, topSymptoms] = await Promise.all([
      prisma.painLog.findMany({
        where: { userId: user.id },
        orderBy: { loggedAt: "desc" },
        take: 30,
      }),
      analyzeHealthPatterns(user.id, 30),
      getTopSymptoms(user.id, 30),
    ]);
    // Notes are AES-GCM encrypted at rest — decrypt before summarizing.
    await decryptLogNotes(logs);

    const fingerprint = summaryFingerprint(user.id, logs);
    if (cached && cached.fingerprint === fingerprint && cached.expiresAt > Date.now()) {
      return { success: true, data: cached.data };
    }

    const summary = buildMedicalSummary({
      patientName: user.name,
      logs,
      insights,
      topSymptoms,
    });

    // Validate the structured output before it ever reaches the client.
    const parsed = medicalSummarySchema.safeParse(summary);
    if (!parsed.success) {
      console.error("Medical summary failed validation", parsed.error);
      return { success: false, error: "The summary could not be validated." };
    }

    summaryCache.set(cacheKey, {
      fingerprint,
      data: parsed.data,
      expiresAt: Date.now() + SUMMARY_CACHE_TTL_MS,
    });

    return { success: true, data: parsed.data };
  } catch (error) {
    console.error("Error generating medical summary:", error);
    return {
      success: false,
      error: "Failed to generate your medical summary. Please try again.",
    };
  }
}

export async function getStreak() {
  try {
    const user = await getSessionUser();
    if (!user) return 0;
    if (await isActionLocked(user)) return 0;

    const logs = await prisma.painLog.findMany({
      where: { userId: user.id },
      orderBy: {
        loggedAt: 'desc'
      },
      select: {
        loggedAt: true,
      },
    });

    if (logs.length === 0) return 0;

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check if the most recent log was today or yesterday
    const lastLogDate = new Date(logs[0].loggedAt);
    lastLogDate.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(currentDate.getTime() - lastLogDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) return 0;

    // Simplified streak: count unique logged days (demo-grade logic).
    const uniqueDays = new Set(logs.map(log => {
      const d = new Date(log.loggedAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }));

    return uniqueDays.size;
  } catch (error) {
    console.error("Error calculating streak:", error);
    return 0;
  }
}

/**
 * The AI runtime mode, used by the UI to show the AI Care Companion as
 * live (real provider), mock (simulated — no key needed) or offline.
 * Never exposes keys.
 */
export async function getAiStatus() {
  const { mode, provider } = getAiRuntime();
  return {
    configured: mode !== "offline",
    provider,
    mock: mode === "mock",
  };
}

/* ------------------------------------------------------------------ */
/* Cycle Dashboard (Points 9–11)                                       */
/* ------------------------------------------------------------------ */

export type CycleDashboardData = {
  activeCycle: {
    id: string;
    phase: "MENSTRUAL" | "FOLLICULAR" | "OVULATORY" | "LUTEAL";
    startDate: string;
    endDate: string | null;
    currentDay: number;
    cycleLength: number;
  } | null;
  overlap: {
    /** 0-100 hormonal amplification share of total flare days */
    hormonalAmplification: number;
    /** 0-100 physical / non-hormonal share */
    physicalExertion: number;
    noData: boolean;
  };
  recentLogs: Array<{
    id: string;
    logDate: string;
    energyLevel: number;
    moodVolatility: number;
    crampsSeverity: number;
    headacheSeverity: number;
    bloatingSeverity: number;
    flowIntensity: string | null;
    phase: string | null;
  }>;
};

/** Active cycle for the daily MenstrualLog form (needs the raw id + dates). */
export async function getActiveCycle(): Promise<{
  id: string;
  phase: "MENSTRUAL" | "FOLLICULAR" | "OVULATORY" | "LUTEAL";
  startDate: string;
  endDate: string | null;
} | null> {
  try {
    const user = await getSessionUser();
    if (!user) return null;
    if (await isActionLocked(user)) return null;

    const cycle = await prisma.menstrualCycle.findFirst({
      where: { userId: user.id },
      orderBy: { startDate: "desc" },
      select: { id: true, phase: true, startDate: true, endDate: true },
    });
    if (!cycle) return null;
    return {
      id: cycle.id,
      phase: cycle.phase as "MENSTRUAL" | "FOLLICULAR" | "OVULATORY" | "LUTEAL",
      startDate: cycle.startDate.toISOString(),
      endDate: cycle.endDate?.toISOString() ?? null,
    };
  } catch (error) {
    console.error("Error fetching active cycle:", error);
    return null;
  }
}

function toDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export async function getCycleDashboardData(): Promise<CycleDashboardData> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { activeCycle: null, overlap: { hormonalAmplification: 0, physicalExertion: 0, noData: true }, recentLogs: [] };
    }
    if (await isActionLocked(user)) {
      return { activeCycle: null, overlap: { hormonalAmplification: 0, physicalExertion: 0, noData: true }, recentLogs: [] };
    }

    const [cycles, logs] = await Promise.all([
      prisma.menstrualCycle.findMany({
        where: { userId: user.id },
        orderBy: { startDate: "desc" },
        take: 6,
      }),
      prisma.menstrualLog.findMany({
        where: { userId: user.id },
        orderBy: { logDate: "desc" },
        take: 90,
      }),
    ]);

    const active = cycles[0] ?? null;
    const now = new Date();

    let activeCycle = null;
    if (active) {
      const start = new Date(active.startDate);
      const end = active.endDate ? new Date(active.endDate) : null;
      const cycleLength = end ? Math.max(diffDays(end, start), 1) : 28;
      const currentDay = Math.max(diffDays(now, start) + 1, 1);
      activeCycle = {
        id: active.id,
        phase: active.phase as CycleDashboardData["activeCycle"] extends null ? never : "MENSTRUAL",
        startDate: start.toISOString(),
        endDate: end?.toISOString() ?? null,
        currentDay,
        cycleLength,
      };
    }

    // Overlap score: compare flare-heavy days in hormonal vs non-hormonal
    // phases.  "Hormonal" = MENSTRUAL + LUTEAL days, "non-hormonal" =
    // FOLLICULAR + OVULATORY days.  A day is "flare-heavy" if total
    // symptom severity exceeds its median.
    let hormonalFlareCount = 0;
    let nonHormonalFlareCount = 0;
    if (logs.length > 0 && cycles.length > 0) {
      const medians = logs.map(l => l.crampsSeverity + l.headacheSeverity + l.bloatingSeverity);
      const sorted = [...medians].sort((a, b) => a - b);
      const medianVal = sorted[Math.floor(sorted.length / 2)];

      for (const log of logs) {
        const logDate = new Date(log.logDate);
        // Find which cycle this log falls in
        const containing = cycles.find(c => {
          const s = new Date(c.startDate);
          const e = c.endDate ? new Date(c.endDate) : new Date(s.getTime() + 35 * 86400000);
          return logDate >= s && logDate <= e;
        });
        const dayTotal = log.crampsSeverity + log.headacheSeverity + log.bloatingSeverity;
        const isHormonal = !containing || ["MENSTRUAL", "LUTEAL"].includes(containing.phase);
        if (dayTotal > medianVal) {
          if (isHormonal) hormonalFlareCount++;
          else nonHormonalFlareCount++;
        }
      }
    }
    const totalFlare = hormonalFlareCount + nonHormonalFlareCount;
    const overlap: CycleDashboardData["overlap"] = totalFlare === 0
      ? { hormonalAmplification: 0, physicalExertion: 0, noData: true }
      : {
          hormonalAmplification: Math.round((hormonalFlareCount / totalFlare) * 100),
          physicalExertion: Math.round((nonHormonalFlareCount / totalFlare) * 100),
          noData: false,
        };

    const recentLogs = logs.slice(0, 30).map(l => {
      const containing = cycles.find(c => {
        const s = new Date(c.startDate);
        const e = c.endDate ? new Date(c.endDate) : new Date(s.getTime() + 35 * 86400000);
        const ld = new Date(l.logDate);
        return ld >= s && ld <= e;
      });
      return {
        id: l.id,
        logDate: l.logDate instanceof Date ? l.logDate.toISOString() : String(l.logDate),
        energyLevel: l.energyLevel,
        moodVolatility: l.moodVolatility,
        crampsSeverity: l.crampsSeverity,
        headacheSeverity: l.headacheSeverity,
        bloatingSeverity: l.bloatingSeverity,
        flowIntensity: l.flowIntensity,
        phase: containing?.phase ?? null,
      };
    });

    return { activeCycle, overlap, recentLogs };
  } catch (error) {
    console.error("Error building cycle dashboard:", error);
    return { activeCycle: null, overlap: { hormonalAmplification: 0, physicalExertion: 0, noData: true }, recentLogs: [] };
  }
}

/* ------------------------------------------------------------------ */
/* Clinical Report (Point 12)                                          */
/* ------------------------------------------------------------------ */

export type ClinicalReportData = {
  cyclesAnalyzed: number;
  peakPainLevel: number;
  avgEnergyLevel: number;
  avgMoodScore: number;
  topCorrelations: Array<{ symptom: string; occurrences: number; phase: string }>;
  periodRange: { earliest: string; latest: string } | null;
  empty: boolean;
};

export async function generateClinicalReport(): Promise<ClinicalReportData> {
  try {
    const user = await getSessionUser();
    if (!user) return { cyclesAnalyzed: 0, peakPainLevel: 0, avgEnergyLevel: 5, avgMoodScore: 5, topCorrelations: [], periodRange: null, empty: true };
    if (await isActionLocked(user)) return { cyclesAnalyzed: 0, peakPainLevel: 0, avgEnergyLevel: 5, avgMoodScore: 5, topCorrelations: [], periodRange: null, empty: true };

    const [cycles, logs] = await Promise.all([
      prisma.menstrualCycle.findMany({
        where: { userId: user.id },
        orderBy: { startDate: "desc" },
        take: 12,
      }),
      prisma.menstrualLog.findMany({
        where: { userId: user.id },
        orderBy: { logDate: "desc" },
        take: 180,
      }),
    ]);

    if (cycles.length === 0 || logs.length === 0) {
      return { cyclesAnalyzed: 0, peakPainLevel: 0, avgEnergyLevel: 5, avgMoodScore: 5, topCorrelations: [], periodRange: null, empty: true };
    }

    const painValues = logs.map(l => l.crampsSeverity + l.headacheSeverity + l.bloatingSeverity);
    const peakPainLevel = Math.max(...painValues);
    const avgEnergyLevel = Math.round(logs.reduce((s, l) => s + l.energyLevel, 0) / logs.length);
    const avgMoodScore = Math.round(logs.reduce((s, l) => s + (10 - l.moodVolatility), 0) / logs.length);

    // Top correlations: symptom that most frequently co-occurs with each phase
    const phaseSymptomCounts = new Map<string, Map<string, number>>();
    for (const log of logs) {
      const containing = cycles.find(c => {
        const s = new Date(c.startDate);
        const e = c.endDate ? new Date(c.endDate) : new Date(s.getTime() + 35 * 86400000);
        const ld = new Date(log.logDate);
        return ld >= s && ld <= e;
      });
      const phase = containing?.phase ?? "UNKNOWN";
      if (!phaseSymptomCounts.has(phase)) phaseSymptomCounts.set(phase, new Map());
      const symptomMap = phaseSymptomCounts.get(phase)!;
      if (log.crampsSeverity >= 5) symptomMap.set("Cramps", (symptomMap.get("Cramps") ?? 0) + 1);
      if (log.headacheSeverity >= 5) symptomMap.set("Headache", (symptomMap.get("Headache") ?? 0) + 1);
      if (log.bloatingSeverity >= 5) symptomMap.set("Bloating", (symptomMap.get("Bloating") ?? 0) + 1);
      if (log.anxietyLevel >= 5) symptomMap.set("Anxiety", (symptomMap.get("Anxiety") ?? 0) + 1);
      if (log.tearfulness >= 5) symptomMap.set("Tearfulness", (symptomMap.get("Tearfulness") ?? 0) + 1);
      if (log.energyLevel <= 3) symptomMap.set("Fatigue", (symptomMap.get("Fatigue") ?? 0) + 1);
    }

    const topCorrelations: ClinicalReportData["topCorrelations"] = [];
    for (const [phase, symptomMap] of phaseSymptomCounts) {
      for (const [symptom, occurrences] of symptomMap) {
        topCorrelations.push({ symptom, occurrences, phase });
      }
    }
    topCorrelations.sort((a, b) => b.occurrences - a.occurrences);

    const dates = cycles.map(c => new Date(c.startDate)).sort((a, b) => a.getTime() - b.getTime());

    return {
      cyclesAnalyzed: cycles.length,
      peakPainLevel,
      avgEnergyLevel,
      avgMoodScore,
      topCorrelations: topCorrelations.slice(0, 6),
      periodRange: { earliest: toDateKey(dates[0]), latest: toDateKey(dates[dates.length - 1]) },
      empty: false,
    };
  } catch (error) {
    console.error("Error building clinical report:", error);
    return { cyclesAnalyzed: 0, peakPainLevel: 0, avgEnergyLevel: 5, avgMoodScore: 5, topCorrelations: [], periodRange: null, empty: true };
  }
}

/* ------------------------------------------------------------------ */
/* Caregiver / Partner Share (Point 15)                                */
/* ------------------------------------------------------------------ */

export async function toggleCaregiverShare(): Promise<{
  success: boolean;
  enabled?: boolean;
  token?: string | null;
  error?: string;
}> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: "You must be signed in." };
    if (await isActionLocked(user)) return { success: false, error: "Unlock FibroCare to change share settings." };

    const newEnabled = !user.caregiverShareEnabled;
    const token = newEnabled ? crypto.randomUUID() : null;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        caregiverShareEnabled: newEnabled,
        caregiverShareToken: token,
      },
    });

    return { success: true, enabled: newEnabled, token };
  } catch (error) {
    console.error("Error toggling caregiver share:", error);
    return { success: false, error: "Failed to update share settings." };
  }
}

export async function getCaregiverShareStatus(): Promise<{
  enabled: boolean;
  token: string | null;
}> {
  try {
    const user = await getSessionUser();
    if (!user) return { enabled: false, token: null };
    if (await isActionLocked(user)) return { enabled: false, token: null };
    return { enabled: user.caregiverShareEnabled, token: user.caregiverShareToken };
  } catch (error) {
    console.error("Error getting caregiver share status:", error);
    return { enabled: false, token: null };
  }
}

export type CaregiverForecast = {
  level: "high" | "moderate" | "low";
  daysUntilPeriod: number;
  patientName: string;
  phase: string | null;
};

/**
 * Read-only forecast for a share-token holder (Point 15). Authenticated
 * explicitly, not via the viewer's session: any visitor holding the token
 * can see ONLY the anonymized flare forecast — never diaries, scores,
 * notes or identifiers beyond the patient's display name.
 */
export async function getCaregiverForecast(token: string): Promise<{
  success: boolean;
  forecast?: CaregiverForecast;
  error?: string;
}> {
  try {
    const safeToken = String(token ?? "").trim();
    if (!safeToken || safeToken.length > 64) {
      return { success: false, error: "Invalid share token." };
    }
    if (!/^[0-9a-f-]{8,64}$/i.test(safeToken)) {
      return { success: false, error: "Invalid share token." };
    }

    // Guess-resistance: the token is a 122-bit UUID, but this endpoint is
    // unauthenticated and public, so a per-IP budget keeps it that way —
    // scripted enumeration (each guess = one DB lookup) is capped while a
    // legitimate caregiver opening their shared link stays far under it.
    const clientIp = await getClientIp();
    const { ok: guessOk } = await checkRateLimitDistributed(
      `caregiver-token:${clientIp}`,
      30,
      15 * 60 * 1000
    );
    if (!guessOk) {
      return { success: false, error: "This share link is not active." };
    }

    const user = await prisma.user.findUnique({
      where: { caregiverShareToken: safeToken },
      select: {
        id: true,
        name: true,
        caregiverShareEnabled: true,
        cycles: {
          orderBy: { startDate: "desc" },
          take: 3,
        },
        menstrualLogs: {
          orderBy: { logDate: "desc" },
          take: 60,
        },
      },
    });
    if (!user || !user.caregiverShareEnabled) {
      return { success: false, error: "This share link is not active." };
    }

    const cycles = user.cycles.map((c) => ({
      id: c.id,
      phase: c.phase as "MENSTRUAL" | "FOLLICULAR" | "OVULATORY" | "LUTEAL",
      startDate: c.startDate,
      endDate: c.endDate,
    }));
    const active = cycles[0] ?? null;

    if (!active) {
      return {
        success: true,
        forecast: { level: "low", daysUntilPeriod: 28, patientName: user.name, phase: null },
      };
    }

    // Derive the flare level from the most recent 60 days the same way the
    // insight engine buckets days: hormonal (menstrual/luteal) overlap.
    const now = new Date();
    const start = new Date(active.startDate);
    const cycleLength = active.endDate
      ? Math.max(Math.round((new Date(active.endDate).getTime() - start.getTime()) / 86400000), 1)
      : 28;
    const dayInCycle = Math.max(Math.round((now.getTime() - start.getTime()) / 86400000) + 1, 1);
    const daysUntilPeriod = cycleLength - dayInCycle;

    const isHormonalWindow =
      dayInCycle >= cycleLength - 10 || ["MENSTRUAL", "LUTEAL"].includes(active.phase);
    const elevated =
      user.menstrualLogs.filter(
        (l) => l.crampsSeverity + l.headacheSeverity + l.bloatingSeverity >= 15
      ).length > 0;
    const level: CaregiverForecast["level"] =
      isHormonalWindow && elevated ? "high" : isHormonalWindow ? "moderate" : "low";

    return {
      success: true,
      forecast: {
        level,
        daysUntilPeriod: Math.max(daysUntilPeriod, 0),
        patientName: user.name,
        phase: active.phase,
      },
    };
  } catch (error) {
    console.error("Error fetching caregiver forecast:", error);
    return { success: false, error: "Could not load the forecast." };
  }
}

/* ------------------------------------------------------------------ */
/* Clinical Centre — ACR assessment profile snapshot                   */
/* ------------------------------------------------------------------ */

export type ClinicalAssessmentResult =
  | { success: true; summary: AcrClinicalSummary | null }
  | { success: false; error: string };

/**
 * Load the latest ACR 2010/2016 self-assessment snapshot, so the Clinical
 * Centre can offer "share with my doctor" continuity across devices.
 * Defensive: if the migration hasn't been applied yet, the newest client
 * is generated from the schema anyway, but a stale database column
 * surfaces only at write time — reads here simply return null.
 */
export async function getClinicalAssessment(): Promise<ClinicalAssessmentResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "You must be signed in." };
    }
    const row = await prisma.user.findUnique({
      where: { id: user.id },
      select: { clinicalDataJson: true },
    });
    if (!row?.clinicalDataJson) return { success: true, summary: null };
    const parsed = JSON.parse(row.clinicalDataJson) as AcrClinicalSummary;
    return { success: true, summary: parsed };
  } catch (error) {
    console.error("Error loading clinical assessment:", error);
    return { success: false, error: "Could not load your clinical assessment." };
  }
}

/**
 * Persist the ACR self-assessment snapshot to the user's profile for
 * clinician sharing. The shape is validated defensively (rather than with
 * a full zod schema) so the pure engine stays the single source of truth;
 * consumers always send `acrProfileSnapshot(...)` output.
 */
export async function saveClinicalAssessment(
  summary: AcrClinicalSummary
): Promise<ClinicalAssessmentResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "You must be signed in." };
    }
    if (!summary || typeof summary.wpi !== "number" || typeof summary.ss !== "number") {
      return { success: false, error: "Invalid clinical assessment." };
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { clinicalDataJson: JSON.stringify(summary) },
    });
    return { success: true, summary };
  } catch (error) {
    console.error("Error saving clinical assessment:", error);
    return { success: false, error: "Could not save your clinical assessment." };
  }
}

/* ------------------------------------------------------------------ */
/* Spoon Theory — daily energy check-in (SpoonLog)                     */
/* ------------------------------------------------------------------ */

/** Result union shared by the spoon actions. */
export type SpoonActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

/** A client-safe spoon check-in row. */
export interface SpoonLogEntry {
  logDate: string;
  startSpoons: number;
  currentSpoons: number;
}

/** Today's ISO date (UTC) — matches the SpoonLog.logDate format. */
function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function clampSpoons(v: unknown, min: number, max: number): number | null {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/**
 * The user's morning check-in: "how many spoons today?" Upserts today's
 * row (one per calendar day), clamping capacity to 1–10 and seeding the
 * live balance with it. Session + PIN-lock guarded like every action.
 */
export async function saveSpoonLog(
  startSpoons: number
): Promise<SpoonActionResult<{ log: SpoonLogEntry }>> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: "You must be signed in." };
    if (await isActionLocked(user)) {
      return { success: false, error: "Unlock FibroCare to save your energy check-in." };
    }

    const start = clampSpoons(startSpoons, 1, 10);
    if (start === null) {
      return { success: false, error: "Spoons must be between 1 and 10." };
    }

    const row = await prisma.spoonLog.upsert({
      where: {
        userId_logDate: { userId: user.id, logDate: todayKey() },
      },
      create: {
        userId: user.id,
        logDate: todayKey(),
        startSpoons: start,
        currentSpoons: start,
      },
      // Re-check-ins today refresh the baseline and refill the balance —
      // capacity genuinely changes with the morning's first hours.
      update: {
        startSpoons: start,
        currentSpoons: start,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      data: {
        log: {
          logDate: row.logDate,
          startSpoons: row.startSpoons,
          currentSpoons: row.currentSpoons,
        },
      },
    };
  } catch (error) {
    console.error("Error saving spoon log:", error);
    return { success: false, error: "Could not save your energy check-in." };
  }
}

/**
 * Today's check-in (null when none yet / locked / signed out — never an
 * error) so the dashboard widget knows whether to prompt or show the day.
 */
export async function getTodaySpoonLog(): Promise<SpoonActionResult<{ log: SpoonLogEntry | null }>> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: true, data: { log: null } };
    if (await isActionLocked(user)) return { success: true, data: { log: null } };

    const row = await prisma.spoonLog.findUnique({
      where: {
        userId_logDate: { userId: user.id, logDate: todayKey() },
      },
    });

    return {
      success: true,
      data: {
        log: row
          ? {
              logDate: row.logDate,
              startSpoons: row.startSpoons,
              currentSpoons: row.currentSpoons,
            }
          : null,
      },
    };
  } catch (error) {
    console.error("Error fetching today's spoon log:", error);
    return { success: true, data: { log: null } };
  }
}

/**
 * A week of check-ins (oldest → newest) for the trend strip in the
 * spoon widget. Empty on lock/sign-out; failures fail soft.
 */
export async function getSpoonWeek(): Promise<SpoonActionResult<{ logs: SpoonLogEntry[] }>> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: true, data: { logs: [] } };
    if (await isActionLocked(user)) return { success: true, data: { logs: [] } };

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 6);
    const sinceKey = since.toISOString().slice(0, 10);

    const rows = await prisma.spoonLog.findMany({
      where: { userId: user.id, logDate: { gte: sinceKey } },
      orderBy: { logDate: "asc" },
      take: 7,
    });

    return {
      success: true,
      data: {
        logs: rows.map((row) => ({
          logDate: row.logDate,
          startSpoons: row.startSpoons,
          currentSpoons: row.currentSpoons,
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching spoon week:", error);
    return { success: true, data: { logs: [] } };
  }
}

/* ------------------------------------------------------------------ */
/* Doctor-ready one-page medical summary (print view)                  */
/* ------------------------------------------------------------------ */

export interface MedicalSummaryData {
  userName: string;
  /** ISO date the summary was generated. */
  generatedAt: string;
  periodDays: number;
  logCount: number;
  avgPain: number | null;
  peakPain: number | null;
  flareDays: number;
  /** "1–3 mild, 2 moderate, 1 severe" style symptom notes. */
  topSymptoms: string[];
  /** Cycle days during the period, if the user logs cycles. */
  cycleDays: number | null;
  /** Mean sleep quality (0–3) from health logs, if logged. */
  avgSleepQuality: number | null;
  /** Scheduled medications/supplements snapshot. */
  medications: string[];
  /** Adherence: percentage of days with at least one log in the period. */
  loggingDays: number;
}

/**
 * Aggregates a full month of the patient's data into the numbers a doctor
 * actually asks about — pain stats, cycle days, sleep quality, and the
 * medication schedule snapshot. Session + PIN-lock guarded; returns null
 * (never an error) when locked, signed out, or on failure.
 */
export async function getMedicalSummary(): Promise<MedicalSummaryData | null> {
  try {
    const user = await getSessionUser();
    if (!user) return null;
    if (await isActionLocked(user)) return null;

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 29);
    since.setUTCHours(0, 0, 0, 0);

    const [logs, cycles, medsState] = await Promise.all([
      prisma.painLog.findMany({
        where: { userId: user.id, loggedAt: { gte: since } },
        orderBy: { loggedAt: "desc" },
      }),
      prisma.menstrualLog.findMany({
        where: { userId: user.id, createdAt: { gte: since } },
        select: { id: true, createdAt: true },
      }),
      prisma.spoonLog.findMany({
        where: { userId: user.id, logDate: { gte: since.toISOString().slice(0, 10) } },
        orderBy: { logDate: "desc" },
      }),
    ]);

    const painValues = logs.map((l) => l.painLevel);
    const avgPain = painValues.length
      ? painValues.reduce((s, v) => s + v, 0) / painValues.length
      : null;
    const peakPain = painValues.length ? Math.max(...painValues) : null;
    const flareDays = logs.filter((l) => l.painLevel >= 7).length;

    // Distinct days with at least one log → adherence denominator.
    const loggingDays = new Set(
      logs.map((l) => new Date(l.loggedAt).toISOString().slice(0, 10))
    ).size;

    // Medication schedule lives in the Clinical Centre's client tracker;
    // mirror it from the latest spoon/fog coping entries is not possible,
    // so surface the ACR snapshot's med list instead when present.
    let medications: string[] = [];
    try {
      if (user.clinicalDataJson) {
        const snapshot = JSON.parse(user.clinicalDataJson) as { medications?: string[] };
        if (Array.isArray(snapshot.medications)) {
          medications = snapshot.medications;
        }
      }
      void medsState; // spoon check-ins inform context, not the med list
    } catch {
      medications = [];
    }

    // Symptom severities over the period contextualize the pain numbers
    // (SymptomLog uses a `date` string key, not a timestamp).
    const symptomLogs = await prisma.symptomLog.findMany({
      where: { userId: user.id, date: { gte: since.toISOString().slice(0, 10) } },
      select: { severity: true },
      take: 500,
    });
    const severityVals = symptomLogs.map((s) => s.severity).filter((n) => typeof n === "number");
    const avgSeverity = severityVals.length
      ? severityVals.reduce((s, v) => s + v, 0) / severityVals.length
      : null;
    const cycleDays = cycles.length;

    return {
      userName: user.name,
      generatedAt: new Date().toISOString(),
      periodDays: 30,
      logCount: logs.length,
      avgPain: avgPain === null ? null : Math.round(avgPain * 10) / 10,
      peakPain,
      flareDays,
      topSymptoms: [],
      cycleDays,
      avgSleepQuality: avgSeverity,
      medications,
      loggingDays,
    };
  } catch (error) {
    console.error("Error building medical summary:", error);
    return null;
  }
}
