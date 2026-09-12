import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzePainPatterns, type SymptomPatternLog, type CyclePatternLog, type PainPatternLog } from "@/lib/insightEngine";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const patientId = (await params).id;

    // 1. Authorization
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // The doctor flag is a hard DB field (see src/lib/auth/rbac.ts) —
    // resolve it server-side rather than trusting the JWT/session shape.
    const doctor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (doctor?.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden: Doctor role required" }, { status: 403 });
    }

    const hasConsultation = await prisma.consultation.findFirst({
      where: {
        doctorId: session.user.id,
        patientId: patientId,
      },
    });

    if (!hasConsultation) {
      return NextResponse.json({ error: "Forbidden: No consultation with this patient" }, { status: 403 });
    }

    // 2. Patient existence check
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // 3. Data Processing
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Use toDateKey for SymptomLog since it uses string dates (YYYY-MM-DD)
    const dateKey = thirtyDaysAgo.toISOString().split("T")[0];

    const [cycles, symptomLogs, painLogs] = await Promise.all([
      prisma.menstrualCycle.findMany({
        where: { userId: patientId },
        orderBy: { startDate: "desc" },
        take: 3,
      }),
      prisma.symptomLog.findMany({
        where: {
          userId: patientId,
          date: { gte: dateKey },
        },
      }),
      prisma.painLog.findMany({
        where: {
          userId: patientId,
          loggedAt: { gte: thirtyDaysAgo },
        },
        orderBy: { loggedAt: "asc" },
      }),
    ]);

    // Map to Insight Engine shapes
    const mappedCycles: CyclePatternLog[] = cycles.map((c) => ({
      id: c.id,
      phase: c.phase,
      startDate: c.startDate,
      endDate: c.endDate,
    }));


    const mappedSymptoms: SymptomPatternLog[] = symptomLogs.map((s) => ({
      symptom: s.symptom,
      date: s.date,
      severity: s.severity,
      category: s.category,
      area: s.area,
    }));

    const mappedPain: PainPatternLog[] = painLogs.map((p) => ({
      id: p.id,
      painLevel: p.painLevel,
      moodTag: p.moodTag,
      notes: p.notes,
      loggedAt: p.loggedAt,
    }));

    // Get insights from insight engine
    const insights = analyzePainPatterns(mappedPain, mappedSymptoms, mappedCycles, 30);

    // Calculate average severity for categories
    const categories = ["PHYSICAL", "COGNITIVE", "MOOD"] as const;
    const summary = {} as Record<string, number>;

    for (const cat of categories) {
      const catLogs = symptomLogs.filter((s) => s.category === cat);
      const avg = catLogs.length > 0
        ? catLogs.reduce((sum, log) => sum + log.severity, 0) / catLogs.length
        : 0;
      summary[`${cat.toLowerCase()}Avg`] = parseFloat(avg.toFixed(2));
    }

    // Identify top 3 most severe pain areas
    const areaSums = new Map<string, { sum: number; count: number }>();
    symptomLogs.forEach((s) => {
      if (s.area) {
        const current = areaSums.get(s.area) || { sum: 0, count: 0 };
        areaSums.set(s.area, { sum: current.sum + s.severity, count: current.count + 1 });
      }
    });

    const hotspots = Array.from(areaSums.entries())
      .map(([area, { sum, count }]) => ({
        area,
        severity: parseFloat((sum / count).toFixed(2)),
      }))
      .sort((a, b) => b.severity - a.severity)
      .slice(0, 3);

    // 4. Format Response
    return NextResponse.json({
      currentPhase: cycles[0]?.phase || "UNKNOWN",
      alerts: insights.map((i) => ({
        id: i.id,
        message: i.message,
        severity: i.severity,
      })),
      topHotspots: hotspots,
      summary: {
        physicalAvg: summary.physicalAvg,
        cognitiveAvg: summary.cognitiveAvg,
        moodAvg: summary.moodAvg,
      },
    });
  } catch (error) {
    console.error("[HEALTH_CORRELATIONS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
