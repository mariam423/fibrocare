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

    await prisma.painLog.delete({
      where: { id },
    });
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


