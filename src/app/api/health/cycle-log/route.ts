import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MenstrualLogSchema } from "@/lib/validations/health";
import { sanitizeUserText } from "@/lib/security/sanitizer";
import { ZodError } from "zod";

/**
 * Daily granular cycle entry (Points 1–8, 14) + read feed for the
 * CycleDashboard. POST upserts on the (userId, cycleId, logDate) unique
 * key so re-saving a day edits the entry instead of duplicating it.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = MenstrualLogSchema.parse(body);

    // Ownership guard: the cycle being linked must belong to the caller.
    const cycle = await prisma.menstrualCycle.findFirst({
      where: {
        id: validatedData.cycleId,
        userId: session.user.id,
      },
      select: { id: true },
    });
    if (!cycle) {
      return NextResponse.json({ error: "Cycle not found" }, { status: 404 });
    }

    // Same sanitization layer every other persisted free-text path uses.
    const notes = validatedData.notes
      ? sanitizeUserText(validatedData.notes, { maxLength: 2000, collapseWhitespace: false })
      : null;
    const flowColor = validatedData.flowColor
      ? sanitizeUserText(validatedData.flowColor, { maxLength: 20, collapseWhitespace: true })
      : null;

    // YYYY-MM-DD string -> the DateTime the table stores (UTC-midnight so
    // the @@unique key stays stable regardless of viewer timezone).
    const logDate = new Date(`${validatedData.logDate}T00:00:00.000Z`);

    const log = await prisma.menstrualLog.upsert({
      where: {
        userId_cycleId_logDate: {
          userId: session.user.id,
          cycleId: validatedData.cycleId,
          logDate,
        },
      },
      update: {
        flowIntensity: validatedData.flowIntensity ?? null,
        hasClots: validatedData.hasClots,
        flowColor,
        crampsSeverity: validatedData.crampsSeverity,
        headacheSeverity: validatedData.headacheSeverity,
        breastTenderness: validatedData.breastTenderness,
        bloatingSeverity: validatedData.bloatingSeverity,
        giDiarrhea: validatedData.giDiarrhea,
        giConstipation: validatedData.giConstipation,
        hormonalAcne: validatedData.hormonalAcne,
        cervicalMucus: validatedData.cervicalMucus ?? null,
        opkResult: validatedData.opkResult ?? null,
        tearfulness: validatedData.tearfulness,
        anxietyLevel: validatedData.anxietyLevel,
        moodVolatility: validatedData.moodVolatility,
        energyLevel: validatedData.energyLevel,
        libidoLevel: validatedData.libidoLevel,
        lightSensitivity: validatedData.lightSensitivity,
        soundSensitivity: validatedData.soundSensitivity,
        notes,
        editedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        cycleId: validatedData.cycleId,
        logDate,
        flowIntensity: validatedData.flowIntensity ?? null,
        hasClots: validatedData.hasClots,
        flowColor,
        crampsSeverity: validatedData.crampsSeverity,
        headacheSeverity: validatedData.headacheSeverity,
        breastTenderness: validatedData.breastTenderness,
        bloatingSeverity: validatedData.bloatingSeverity,
        giDiarrhea: validatedData.giDiarrhea,
        giConstipation: validatedData.giConstipation,
        hormonalAcne: validatedData.hormonalAcne,
        cervicalMucus: validatedData.cervicalMucus ?? null,
        opkResult: validatedData.opkResult ?? null,
        tearfulness: validatedData.tearfulness,
        anxietyLevel: validatedData.anxietyLevel,
        moodVolatility: validatedData.moodVolatility,
        energyLevel: validatedData.energyLevel,
        libidoLevel: validatedData.libidoLevel,
        lightSensitivity: validatedData.lightSensitivity,
        soundSensitivity: validatedData.soundSensitivity,
        notes,
      },
    });

    return NextResponse.json(
      { success: true, data: { id: log.id, logDate: log.logDate } },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("[HEALTH_CYCLE_LOG_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/** Feed of the logged-in user's recent daily entries (reverse chronological). */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limitParam = req.nextUrl.searchParams.get("limit");
    const take = Math.min(Math.max(Number(limitParam) || 30, 1), 120);

    const logs = await prisma.menstrualLog.findMany({
      where: { userId: session.user.id },
      orderBy: { logDate: "desc" },
      take,
      select: {
        id: true,
        cycleId: true,
        logDate: true,
        flowIntensity: true,
        hasClots: true,
        flowColor: true,
        crampsSeverity: true,
        headacheSeverity: true,
        breastTenderness: true,
        bloatingSeverity: true,
        giDiarrhea: true,
        giConstipation: true,
        hormonalAcne: true,
        cervicalMucus: true,
        opkResult: true,
        tearfulness: true,
        anxietyLevel: true,
        moodVolatility: true,
        energyLevel: true,
        libidoLevel: true,
        lightSensitivity: true,
        soundSensitivity: true,
        notes: true,
        cycle: { select: { phase: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: logs.map((l) => ({ ...l, logDate: l.logDate.toISOString() })),
    });
  } catch (error) {
    console.error("[HEALTH_CYCLE_LOG_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}