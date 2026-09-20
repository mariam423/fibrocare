import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { privacyLockResponse } from "@/lib/security/privacyPin";
import { healthDataRateLimit } from "@/lib/security/healthRateLimit";
import { prisma } from "@/lib/prisma";
import { SymptomLogSchema } from "@/lib/validations/health";
import { sanitizeUserText } from "@/lib/security/sanitizer";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const privacyBlocked = await privacyLockResponse(session.user.id);
    if (privacyBlocked) return privacyBlocked;
    const healthLimited = await healthDataRateLimit(session.user.id);
    if (healthLimited) return healthLimited;

    const body = await req.json();
    const validatedData = SymptomLogSchema.parse(body);

    // Sanitize the user-visible symptom label (same layer as pain-log
    // symptoms) and clamp to the schema ceiling after cleaning.
    const symptom = sanitizeUserText(validatedData.symptom, { maxLength: 120 });
    if (symptom.length < 3) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const symptomLog = await prisma.symptomLog.upsert({
      where: {
        userId_symptom_date: {
          userId: session.user.id,
          symptom,
          date: validatedData.date,
        },
      },
      update: {
        severity: validatedData.severity,
        category: validatedData.category,
        area: validatedData.area,
      },
      create: {
        userId: session.user.id,
        symptom,
        date: validatedData.date,
        severity: validatedData.severity,
        category: validatedData.category,
        area: validatedData.area,
      },
    });

    return NextResponse.json(symptomLog, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("[HEALTH_SYMPTOMS_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
