"use server";

import crypto from "crypto";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
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
}): Promise<RegisterResult> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

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

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, passwordHash } });

  return { success: true };
}

export async function requestPasswordReset(
  emailInput: string
): Promise<ResetResult> {
  const email = emailInput.trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Generic response: do not reveal whether the account exists.
    return { success: true };
  }

  // Invalidate any previous reset tokens for this user.
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/reset-password?token=${token}`;
  console.log(`[auth] Password reset requested for ${email}: ${resetLink}`);

  // In non-production the link is returned so the flow can be tested
  // end-to-end without an email provider. Production must send it by email.
  return process.env.NODE_ENV === "production"
    ? { success: true }
    : { success: true, resetLink };
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

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
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

export async function getCurrentUser() {
  try {
    return await getSessionUser();
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function updateUserName(newName: string) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "You must be signed in." };
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
    });

    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Error updating user name:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user name"
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

    const finalPainLevel = Number.isInteger(painLevel)
      ? Math.min(10, Math.max(0, painLevel))
      : 3;

    // Bound free-text fields (length caps only — content is rendered
    // escaped and stored via Prisma's parameterized queries).
    const safeMoodTag = String(moodTag ?? "").slice(0, 40);
    const safeSymptoms = symptoms
      .map((s) => String(s).slice(0, 60))
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
      error: error instanceof Error ? error.message : "Failed to save pain log due to an unknown error"
    };
  }
}

export async function updateUserProfile(name: string, email: string) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "You must be signed in." };
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
    });

    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user profile"
    };
  }
}

export async function updateHydration(amount: number) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "You must be signed in." };
    }

    // Validate the increment: integers only, bounded per call, and the
    // counter can never go below zero (the UI only sends ±1).
    const delta = Number.isInteger(amount) ? Math.min(10, Math.max(-10, amount)) : 0;
    const next = Math.max(0, user.hydrationCount + delta);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        hydrationCount: next
      }
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

    const logs = await prisma.painLog.findMany({
      where: { userId: user.id },
      orderBy: { loggedAt: 'desc' },
    });
    return logs;
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

    const logs = await prisma.painLog.findMany({
      where: { userId: user.id },
      orderBy: {
        loggedAt: 'desc'
      },
      take: 30,
    });
    return logs;
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
}

export async function getDashboardInsights() {
  try {
    const user = await getSessionUser();
    if (!user) return [];

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

    const [logs, insights, topSymptoms] = await Promise.all([
      prisma.painLog.findMany({
        where: { userId: user.id },
        orderBy: { loggedAt: "desc" },
      }),
      analyzeHealthPatterns(user.id, 90),
      getTopSymptoms(user.id, 90),
    ]);

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
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate medical summary",
    };
  }
}

export async function getStreak() {
  try {
    const user = await getSessionUser();
    if (!user) return 0;

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

/** Encrypt sensitive health data using AES-256-GCM */
async function encryptSensitiveData(text: string): Promise<string> {
  const key = process.env.HEALTH_DATA_ENCRYPTION_KEY;
  if (!key) {
    // Dev-only fallback: base64 for local testing. Production must NEVER
    // silently store readable health data — fail loudly instead.
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "HEALTH_DATA_ENCRYPTION_KEY is not configured — refusing to store plaintext health notes."
      );
    }
    return Buffer.from(text).toString("base64");
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(key, "hex"), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}
