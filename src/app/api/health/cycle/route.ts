import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CycleLogSchema } from "@/lib/validations/health";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = CycleLogSchema.parse(body);

    const cycle = await prisma.menstrualCycle.create({
      data: {
        userId: session.user.id,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        phase: validatedData.phase,
        overallSeverity: validatedData.overallSeverity,
        notes: validatedData.notes,
      },
    });

    return NextResponse.json(cycle, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("[HEALTH_CYCLE_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
