import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  analyzePainPatterns,
  type SymptomPatternLog,
  type CyclePatternLog,
  type PainPatternLog,
} from "@/lib/insightEngine";
import { deriveCycleSummary } from "@/lib/health/cycleSummary";
import { buildFlareForecast } from "@/lib/health/flareForecast";

/**
 * Dashboard correlations feed for CycleStatusWidget + CareRecommendationCard.
 *
 * Response contract (the shape the widgets consume):
 *   success: true
 *   data.cycle:           derived cycle view | null (null → user has no cycle logged)
 *   data.recommendations: insight engine output (empty until ≥5 pain logs)
 *   data.hasSymptoms:     whether any symptom log exists in the window
 *                         (lets the UI distinguish "log a cycle first" from
 *                         "log symptoms first")
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Most recent 3 cycles (desc) — same ordering the insight engine expects.
    const cycles = await prisma.menstrualCycle.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
      take: 3,
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [symptoms, painLogs] = await Promise.all([
      prisma.symptomLog.findMany({
        where: { userId, date: { gte: toDateKey(thirtyDaysAgo) } },
      }),
      prisma.painLog.findMany({
        where: { userId, loggedAt: { gte: thirtyDaysAgo } },
        orderBy: { loggedAt: "asc" },
      }),
    ]);

    // Map DB rows onto the insight-engine's minimal shapes.
    const mappedCycles: CyclePatternLog[] = cycles.map((c) => ({
      id: c.id,
      phase: c.phase,
      startDate: c.startDate,
      endDate: c.endDate,
    }));

    const mappedSymptoms: SymptomPatternLog[] = symptoms.map((s) => ({
      symptom: s.symptom,
      date: s.date,
      severity: s.severity,
      category: s.category,
      area: s.area ?? undefined,
    }));

    const mappedPain: PainPatternLog[] = painLogs.map((p) => ({
      id: p.id,
      painLevel: p.painLevel,
      moodTag: p.moodTag,
      notes: p.notes,
      loggedAt: p.loggedAt,
    }));

    const insights = analyzePainPatterns(mappedPain, mappedSymptoms, mappedCycles, 30);

    // Predictive view: pre-period flare risk + proactive advice.
    const recentAvgPain =
      mappedPain.length > 0
        ? mappedPain.reduce((s, p) => s + p.painLevel, 0) / mappedPain.length
        : 0;
    const forecast = buildFlareForecast({
      cycles: mappedCycles,
      symptomLogs: mappedSymptoms,
      recentAvgPain,
    });

    return NextResponse.json({
      success: true,
      data: {
        cycle: deriveCycleSummary(mappedCycles),
        recommendations: insights.map((i) => ({
          id: i.id,
          title: i.title,
          message: i.message,
          priority: i.severity, // "info" | "warning" | "critical"
          type: i.type,
        })),
        forecast,
        hasSymptoms: symptoms.length > 0,
      },
    });
  } catch (error) {
    console.error("[HEALTH_CORRELATIONS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/** UTC YYYY-MM-DD key — mirrors the insight engine's day bucketing. */
function toDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}
