"use server";

/**
 * Server actions for the Fog Shield (src/app/fog-shield).
 *
 * Fibro-fog / cognitive-fatigue episode logging. Every mutation:
 *  1. verifies the session;
 *  2. refuses to run while the privacy PIN lock is engaged;
 *  3. validates with a zod schema, then sanitizes free text;
 *  4. encrypts brain-dump text at rest (AES-256-GCM) — it is never stored
 *     plaintext and never returned to the client except decrypted for its
 *     owner through these actions;
 *  5. writes strictly scoped to the session user's `id`;
 *  6. revalidates only the Fog Shield path and returns a typed result union.
 */

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { isActionLocked } from "@/lib/security/privacyPin";
import {
  decryptSensitiveData,
  encryptSensitiveData,
} from "@/lib/security/atRest";
import { sanitizeUserText } from "@/lib/security/sanitizer";
import {
  FOG_TRIGGERS_MAX,
  FogLogInputSchema,
  type FogLogInput,
} from "@/lib/validations/health";
import type { FogLogEntry } from "@/lib/types";

export type FogActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
}

/** Decrypt + shape one FibroFogLog row for the client. */
async function toFogLogEntry(row: {
  id: string;
  intensity: number;
  triggers: string[];
  brainDumpText: string | null;
  copingToolUsed: string;
  createdAt: Date;
}): Promise<FogLogEntry> {
  return {
    id: row.id,
    intensity: row.intensity,
    triggers: row.triggers,
    brainDumpText: row.brainDumpText
      ? (await decryptSensitiveData(row.brainDumpText)) ?? null
      : null,
    copingToolUsed: row.copingToolUsed as FogLogEntry["copingToolUsed"],
    createdAt: row.createdAt,
  };
}

/**
 * Save a fog episode (with any brain-dump text). `copingToolUsed` records
 * which grounding module the patient reached for, so the history reads as a
 * story ("fog 8/10 → exhale 4-7-8") rather than a bare symptom.
 */
export async function saveFogLog(
  input: FogLogInput
): Promise<FogActionResult<{ log: FogLogEntry }>> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: "You must be signed in." };
    if (await isActionLocked(user)) {
      return { success: false, error: "Unlock FibroCare to save your fog log." };
    }

    const parsed = FogLogInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Please complete the fog log correctly." };
    }
    const data = parsed.data;

    // Triggers: sanitize each label (strip tags/control chars), drop empties,
    // then re-cap to the schema ceiling so nothing oversized lands in TEXT[].
    const triggers = data.triggers
      .map((t) => sanitizeUserText(t, { maxLength: 40, collapseWhitespace: true }))
      .filter((t) => t.length > 0)
      .slice(0, FOG_TRIGGERS_MAX);

    // Brain dumps keep their line structure (collapseWhitespace: false) so a
    // chaotic "everything at once" offload survives intact; length is capped.
    const dumped = data.brainDumpText?.trim();
    const safeDump =
      dumped && dumped.length > 0
        ? sanitizeUserText(dumped, { maxLength: 4000, collapseWhitespace: false })
        : null;

    const row = await prisma.fibroFogLog.create({
      data: {
        userId: user.id,
        intensity: data.intensity,
        triggers,
        brainDumpText: safeDump ? await encryptSensitiveData(safeDump) : null,
        copingToolUsed: data.copingToolUsed,
      },
    });

    revalidatePath("/fog-shield");
    return { success: true, data: { log: await toFogLogEntry(row) } };
  } catch (error) {
    console.error("Error saving fog log:", error);
    return {
      success: false,
      error: "Failed to save your fog log. Please try again.",
    };
  }
}

/** Recent fog logs for the patient (locked → empty, never an error). */
export async function getFogLogs(
  limit = 25
): Promise<FogActionResult<{ logs: FogLogEntry[] }>> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: true, data: { logs: [] } };
    if (await isActionLocked(user)) return { success: true, data: { logs: [] } };

    const take = Number.isInteger(limit)
      ? Math.min(60, Math.max(1, limit))
      : 25;
    const rows = await prisma.fibroFogLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take,
    });

    const logs = await Promise.all(rows.map(toFogLogEntry));
    return { success: true, data: { logs } };
  } catch (error) {
    console.error("Error fetching fog logs:", error);
    return { success: true, data: { logs: [] } };
  }
}

export interface FogStats {
  /** Total logged episodes. */
  count: number;
  /** Mean self-reported intensity over all episodes. */
  averageIntensity: number | null;
  /** Mean intensity across the most recent 14 episodes ("current fog"). */
  recentAverage: number | null;
}

/** Lightweight trend for the Fog Shield hero (count + mean intensities). */
export async function getFogStats(): Promise<FogActionResult<{ stats: FogStats }>> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: true, data: { stats: emptyStats() } };
    if (await isActionLocked(user)) {
      return { success: true, data: { stats: emptyStats() } };
    }

    const rows = await prisma.fibroFogLog.findMany({
      where: { userId: user.id },
      select: { intensity: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 14,
    });
    const all = await prisma.fibroFogLog.count({ where: { userId: user.id } });

    const avg = (xs: number[]) =>
      xs.length === 0 ? null : xs.reduce((s, v) => s + v, 0) / xs.length;

    return {
      success: true,
      data: {
        stats: {
          count: all,
          averageIntensity: avg(rows.map((r) => r.intensity)),
          recentAverage: avg(rows.map((r) => r.intensity)),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching fog stats:", error);
    return { success: true, data: { stats: emptyStats() } };
  }
}

function emptyStats(): FogStats {
  return { count: 0, averageIntensity: null, recentAverage: null };
}