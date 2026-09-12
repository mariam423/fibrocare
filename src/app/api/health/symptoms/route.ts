import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SymptomLogSchema } from "@/lib/validations/health";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = SymptomLogSchema.parse(body);

    const symptomLog = await prisma.symptomLog.upsert({
      where: {
        userId_symptom_date: {
          userId: session.user.id,
          symptom: validatedData.symptom,
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
        symptom: validatedData.symptom,
        date: validatedData.date,
        severity: validatedData.severity,
        category: validatedData.category,
        area: validatedData.area,
      },
    });

    return NextResponse.json(symptomLog, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("[HEALTH_SYMPTOMS_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
