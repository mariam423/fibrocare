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

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: newName },
    });

    revalidatePath("/");
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

    await prisma.painLog.create({
      data: {
        painLevel: finalPainLevel,
        moodTag,
        notes,
        userId: user.id,
      },
    });

    // Persist preset/manual symptoms for today (idempotent upserts)
    const date = toIsoDateKey(new Date());
    for (const symptom of symptoms) {
      await prisma.symptomLog.upsert({
        where: {
          userId_symptom_date: { userId: user.id, symptom, date },
        },
        update: {},
        create: { symptom, date, userId: user.id },
      });
    }

    revalidatePath("/");

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

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name, email },
    });

    revalidatePath("/");
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

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        hydrationCount: {
          increment: amount
        }
      }
    });

    revalidatePath("/");
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
    revalidatePath("/");
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

    if (active) {
      await prisma.symptomLog.create({
        data: { symptom, date, userId: user.id },
      });
    } else {
      await prisma.symptomLog.deleteMany({
        where: { userId: user.id, symptom, date },
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error toggling symptom:", error);
    return { success: false, error: "Failed to update symptom" };
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

    // This is a simplified streak calculation
    // In a real app, we'd iterate through the dates and ensure there are no gaps

    // For the purpose of this demo, let's just count unique days in the last N logs
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
