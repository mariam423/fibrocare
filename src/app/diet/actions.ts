"use server";

/**
 * Server actions for the Dietary & Personal Flare Trigger Tracker.
 *
 * Every mutation verifies the session, refuses to run while the privacy PIN
 * lock is engaged, bounds and sanitizes free text, encrypts sensitive notes
 * at rest, and recomputes the warning snapshot server-side (so the stored
 * `warningsJson` reflects the persisted personal list, not just what the
 * client happened to send).
 */

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { isActionLocked } from "@/lib/security/privacyPin";
import { decryptSensitiveData, encryptSensitiveData } from "@/lib/security/atRest";
import { sanitizeUserText } from "@/lib/security/sanitizer";
import {
  MealLogInputSchema,
  TriggerFoodInputSchema,
  type MealLogInput,
  type TriggerFoodInput,
} from "@/lib/validations/health";
import {
  computeWarnings,
  normalizeFoodName,
  serializeWarnings,
} from "@/lib/diet/triggerEngine";
import {
  analyzeFoodFlareCorrelation,
  type FlareCorrelationReport,
} from "@/lib/diet/flareCorrelation";
import type {
  MealLogEntry,
  MealType,
  TriggerFoodEntry,
} from "@/lib/types";

export type DietActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                    */
/* ------------------------------------------------------------------ */

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
}

/** Local noon as the default eatenAt so "no time picked" never lands in
 *  the evening correlation window no matter the client's timezone. */
function localNoon(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

function isMealType(value: string): value is MealType {
  return (MEAL_TYPES as string[]).includes(value);
}

/** Decrypt and shape one MealLog row for the client. */
async function toMealLogEntry(meal: {
  id: string;
  date: string;
  mealType: string;
  eatenAt: Date;
  energyBefore: number;
  warningsJson: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: { id: string; name: string; amount: string | null }[];
}): Promise<MealLogEntry> {
  return {
    id: meal.id,
    date: meal.date,
    mealType: isMealType(meal.mealType) ? meal.mealType : "snack",
    eatenAt: meal.eatenAt,
    energyBefore: meal.energyBefore,
    warningsJson: meal.warningsJson,
    notes: meal.notes ? (await decryptSensitiveData(meal.notes)) ?? null : null,
    createdAt: meal.createdAt,
    updatedAt: meal.updatedAt,
    items: meal.items.map((i) => ({ id: i.id, name: i.name, amount: i.amount })),
  };
}

/* ------------------------------------------------------------------ */
/*  Meal logging                                                        */
/* ------------------------------------------------------------------ */

export async function saveMealLog(input: MealLogInput): Promise<DietActionResult<{ meal: MealLogEntry }>> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: "You must be signed in." };
    if (await isActionLocked(user)) {
      return { success: false, error: "Unlock FibroCare to log your meal." };
    }

    const parsed = MealLogInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Please complete the meal details correctly." };
    }
    const data = parsed.data;

    // Recompute warnings against the persisted personal trigger list so
    // the stored snapshot always reflects the latest personalized rules.
    const personalTriggers = await prisma.triggerFood.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, severity: true },
    });
    const foods = data.items.map((i) => i.name);
    const warnings = computeWarnings(
      foods,
      personalTriggers.map((t) => ({ id: t.id, name: t.name, severity: t.severity }))
    );
    const warningsJson = serializeWarnings(warnings);

    const encryptedNotes = data.notes ? await encryptSensitiveData(data.notes) : undefined;

    const meal = await prisma.mealLog.create({
      data: {
        userId: user.id,
        date: data.date,
        mealType: data.mealType,
        eatenAt: data.eatenAt ?? localNoon(data.date),
        energyBefore: data.energyBefore,
        warningsJson,
        notes: encryptedNotes,
        items: {
          create: data.items.map((item) => ({
            name: item.name,
            amount: item.amount ?? null,
          })),
        },
      },
      include: { items: true, user: false },
    });

    revalidatePath("/diet");

    return { success: true, data: { meal: await toMealLogEntry(meal) } };
  } catch (error) {
    console.error("Error saving meal log:", error);
    return { success: false, error: "Failed to save your meal. Please try again." };
  }
}

export async function deleteMealLog(mealId: string): Promise<DietActionResult> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: "You must be signed in." };
    if (await isActionLocked(user)) {
      return { success: false, error: "Unlock FibroCare to delete a meal." };
    }

    // Ownership is enforced in the DELETE predicate — never by id alone.
    const deleted = await prisma.mealLog.deleteMany({
      where: { id: mealId, userId: user.id },
    });
    if (deleted.count === 0) {
      return { success: false, error: "That meal could not be found." };
    }

    revalidatePath("/diet");
    return { success: true };
  } catch (error) {
    console.error("Error deleting meal log:", error);
    return { success: false, error: "Failed to delete your meal. Please try again." };
  }
}

export async function getMealLogs(date?: string): Promise<DietActionResult<{ meals: MealLogEntry[] }>> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: true, data: { meals: [] } };
    if (await isActionLocked(user)) return { success: true, data: { meals: [] } };

    const where = {
      userId: user.id,
      ...(date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? { date } : {}),
    };
    const rows = await prisma.mealLog.findMany({
      where,
      include: { items: { orderBy: { id: "asc" } } },
      orderBy: [{ date: "desc" }, { eatenAt: "desc" }],
      take: date ? 50 : 200,
    });

    const meals = await Promise.all(rows.map(toMealLogEntry));
    return { success: true, data: { meals } };
  } catch (error) {
    console.error("Error fetching meal logs:", error);
    return { success: true, data: { meals: [] } };
  }
}

/* ------------------------------------------------------------------ */
/*  Personal trigger list                                               */
/* ------------------------------------------------------------------ */

export async function addTriggerFood(input: TriggerFoodInput): Promise<DietActionResult<{ trigger: TriggerFoodEntry }>> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: "You must be signed in." };
    if (await isActionLocked(user)) {
      return { success: false, error: "Unlock FibroCare to manage your triggers." };
    }

    const parsed = TriggerFoodInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Please enter a valid trigger food." };
    }
    const data = parsed.data;

    // The `name` column stores the normalized key for uniqueness; severity
    // is a bounded integer; free text is sanitized and encrypted at rest.
    const name = normalizeFoodName(sanitizeUserText(data.name, { maxLength: 120 }));
    if (!name) return { success: false, error: "Please enter a trigger food." };

    const severity = Math.min(5, Math.max(1, Math.round(data.severity)));
    const reactionNote = data.reactionNote
      ? await encryptSensitiveData(sanitizeUserText(data.reactionNote, { maxLength: 2000 }))
      : null;

    const trigger = await prisma.triggerFood.upsert({
      where: { userId_name: { userId: user.id, name } },
      update: { severity, reactionNote: reactionNote ?? undefined },
      create: { userId: user.id, name, severity, reactionNote },
    });

    revalidatePath("/diet");

    return {
      success: true,
      data: {
        trigger: {
          id: trigger.id,
          name: trigger.name,
          severity: trigger.severity,
          reactionNote: trigger.reactionNote
            ? (await decryptSensitiveData(trigger.reactionNote)) ?? null
            : null,
          createdAt: trigger.createdAt,
        },
      },
    };
  } catch (error) {
    console.error("Error adding trigger food:", error);
    return { success: false, error: "Failed to add your trigger food. Please try again." };
  }
}

export async function removeTriggerFood(triggerId: string): Promise<DietActionResult> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: "You must be signed in." };
    if (await isActionLocked(user)) {
      return { success: false, error: "Unlock FibroCare to manage your triggers." };
    }

    const deleted = await prisma.triggerFood.deleteMany({
      where: { id: triggerId, userId: user.id },
    });
    if (deleted.count === 0) {
      return { success: false, error: "That trigger could not be found." };
    }

    revalidatePath("/diet");
    return { success: true };
  } catch (error) {
    console.error("Error removing trigger food:", error);
    return { success: false, error: "Failed to remove your trigger. Please try again." };
  }
}

export async function getTriggerFoods(): Promise<DietActionResult<{ triggers: TriggerFoodEntry[] }>> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: true, data: { triggers: [] } };
    if (await isActionLocked(user)) return { success: true, data: { triggers: [] } };

    const rows = await prisma.triggerFood.findMany({
      where: { userId: user.id },
      orderBy: { severity: "desc" },
    });

    const triggers = await Promise.all(
      rows.map(async (t) => ({
        id: t.id,
        name: t.name,
        severity: t.severity,
        reactionNote: t.reactionNote
          ? (await decryptSensitiveData(t.reactionNote)) ?? null
          : null,
        createdAt: t.createdAt,
      }))
    );

    return { success: true, data: { triggers } };
  } catch (error) {
    console.error("Error fetching trigger foods:", error);
    return { success: true, data: { triggers: [] } };
  }
}

/* ------------------------------------------------------------------ */
/*  Next-day flare correlation                                          */
/* ------------------------------------------------------------------ */

export async function getFlareCorrelation(): Promise<DietActionResult<{ report: FlareCorrelationReport }>> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: "You must be signed in." };
    if (await isActionLocked(user)) {
      return { success: true, data: { report: { analyzedDays: 0, baselineNextDayScore: 0, foods: [], timing: { avgHourHighFlare: null, avgHourLowFlare: null, laterEveningLinkedToFlare: false, suggestedBeforeHour: 21 } } } };
    }

    // Pull the last 90 days of signals so the comparison stays recent.
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const [meals, painLogs, symptomLogs] = await Promise.all([
      prisma.mealLog.findMany({
        where: { userId: user.id, createdAt: { gte: since } },
        include: { items: { select: { name: true } } },
        orderBy: { eatenAt: "desc" },
      }),
      prisma.painLog.findMany({
        where: { userId: user.id, loggedAt: { gte: since } },
        select: { loggedAt: true, painLevel: true },
        orderBy: { loggedAt: "asc" },
      }),
      prisma.symptomLog.findMany({
        where: { userId: user.id, createdAt: { gte: since } },
        select: { date: true, symptom: true, severity: true },
        orderBy: { date: "asc" },
      }),
    ]);

    const report = analyzeFoodFlareCorrelation(
      meals.map((m) => ({
        id: m.id,
        date: m.date,
        eatenAt: m.eatenAt,
        items: m.items.map((i) => ({ id: i.name, name: i.name })),
      })),
      painLogs.map((p) => ({ loggedAt: p.loggedAt, painLevel: p.painLevel })),
      symptomLogs.map((s) => ({ date: s.date, symptom: s.symptom, severity: s.severity }))
    );

    return { success: true, data: { report } };
  } catch (error) {
    console.error("Error building flare correlation:", error);
    return { success: false, error: "Failed to analyze your flare patterns." };
  }
}