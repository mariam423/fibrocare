import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { privacyLockResponse } from "@/lib/security/privacyPin";
import { healthDataRateLimit } from "@/lib/security/healthRateLimit";
import { prisma } from "@/lib/prisma";
import { CycleLogSchema } from "@/lib/validations/health";
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
    const validatedData = CycleLogSchema.parse(body);

    // Same sanitization layer every other persisted free-text path uses:
    // strips HTML/script/URL-scheme payloads and bounds length (defense in
    // depth on top of the Zod cap — React escaping handles render-time XSS,
    // this keeps stored content clean for exports/AI context).
    const notes = validatedData.notes
      ? sanitizeUserText(validatedData.notes, { maxLength: 2000, collapseWhitespace: false })
      : undefined;

    const cycle = await prisma.menstrualCycle.create({
      data: {
        userId: session.user.id,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        phase: validatedData.phase,
        overallSeverity: validatedData.overallSeverity,
        notes,
      },
    });

    return NextResponse.json(cycle, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("[HEALTH_CYCLE_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
