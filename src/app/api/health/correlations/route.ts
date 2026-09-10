import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch last 3 cycles
    const cycles = await prisma.menstrualCycle.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
      take: 3,
    });

    // Fetch last 30 days of symptom logs
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const symptoms = await prisma.symptomLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Basic Correlation Calculation:
    // Average severity of COGNITIVE symptoms per cycle phase
    const phaseSeverities: Record<string, { sum: number, count: number }> = {
      MENSTRUAL: { sum: 0, count: 0 },
      FOLLICULAR: { sum: 0, count: 0 },
      OVULATORY: { sum: 0, count: 0 },
      LUTEAL: { sum: 0, count: 0 },
    };

    symptoms.forEach(symptom => {
      if (symptom.category === "COGNITIVE") {
        // Find which cycle phase this symptom date falls into
        const symptomDate = new Date(symptom.date);

        const cycle = cycles.find(c => {
          const start = new Date(c.startDate);
          const end = c.endDate ? new Date(c.endDate) : new Date();
          return symptomDate >= start && symptomDate <= end;
        });

        if (cycle) {
          const phase = cycle.phase;
          if (phaseSeverities[phase]) {
            phaseSeverities[phase].sum += symptom.severity;
            phaseSeverities[phase].count += 1;
          }
        }
      }
    });

    const correlations = Object.keys(phaseSeverities).map(phase => ({
      phase,
      avgSeverity: phaseSeverities[phase].count > 0
        ? parseFloat((phaseSeverities[phase].sum / phaseSeverities[phase].count).toFixed(2))
        : null,
      count: phaseSeverities[phase].count
    }));

    return NextResponse.json({
      cycles,
      recentSymptoms: symptoms,
      correlations,
    });
  } catch (error) {
    console.error("[HEALTH_CORRELATIONS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
