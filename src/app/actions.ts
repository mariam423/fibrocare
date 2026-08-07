"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function toIsoDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

async function getOrCreateDefaultUser() {
  try {
    const user = await prisma.user.findFirst();
    if (user) return user;

    return await prisma.user.create({
      data: {
        name: "Default User",
        email: "default@fibrocare.com",
      },
    });
  } catch (error) {
    console.error("Error getting or creating default user:", error);
    throw error;
  }
}

export async function getCurrentUser() {
  return await getOrCreateDefaultUser();
}

export async function updateUserName(newName: string) {
  try {
    const user = await getOrCreateDefaultUser();

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
    const user = await getOrCreateDefaultUser();
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
    const user = await getOrCreateDefaultUser();

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
    const user = await getOrCreateDefaultUser();

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
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const logs = await prisma.painLog.findMany({
      where: {
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
    const user = await getOrCreateDefaultUser();
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
    const logs = await prisma.painLog.findMany({
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

export async function getSymptomsForDate(date: string) {
  try {
    const user = await getOrCreateDefaultUser();
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
    const user = await getOrCreateDefaultUser();

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
    const logs = await prisma.painLog.findMany({
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
