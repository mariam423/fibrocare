"use server";

/**
 * Server actions for Pro features: Doctor Hub publishing and
 * Consultation messaging. All actions verify session and role
 * before performing mutations.
 */

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { hasPermission, type UserRole } from "@/lib/auth/rbac";
import { getModel, isAiConfigured, isMockMode } from "@/lib/ai/provider";
import {
  buildDoctorPublishingPrompt,
  buildClinicalSummaryPrompt,
  buildDoctorResponseDraftPrompt,
  buildSymptomStructurePrompt,
} from "@/lib/ai/doctor-prompts";
import {
  doctorArticleSchema,
  clinicalSummarySchema,
  doctorResponseDraftSchema,
  symptomStructureSchema,
} from "@/lib/ai/doctor-schemas";

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                    */
/* ------------------------------------------------------------------ */

type SessionUser = { id: string; name?: string | null; email?: string | null };

async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user as SessionUser;
}

export async function getUserRole() {
  try {
    const user = await getSessionUser();
    if (!user) return { success: true as const, role: "guest" as const };
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    return { success: true as const, role: (dbUser?.role ?? "free_user") as UserRole };
  } catch {
    return { success: true as const, role: "free_user" as const };
  }
}

async function requireDoctor() {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false as const, error: "You must be signed in." };
  }
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || !hasPermission(dbUser.role as UserRole, "doctor:publish")) {
    return {
      ok: false as const,
      error: "You must be a verified doctor to access this feature.",
    };
  }
  return { ok: true as const, user, role: dbUser.role as UserRole };
}

async function requireConsultationAccess(consultationId: string) {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false as const, error: "You must be signed in." };
  }
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
  });
  if (!consultation) {
    return { ok: false as const, error: "Consultation not found." };
  }
  if (consultation.patientId !== user.id && consultation.doctorId !== user.id) {
    return { ok: false as const, error: "You do not have access to this consultation." };
  }
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const isDoctor = dbUser?.role === "doctor";
  return { ok: true as const, consultation, userId: user.id, isDoctor };
}

/* ------------------------------------------------------------------ */
/*  Doctor Hub actions                                                  */
/* ------------------------------------------------------------------ */

export async function createDoctorPost(input: {
  title: string;
  content: string;
  tags?: string;
}) {
  try {
    const auth = await requireDoctor();
    if (!auth.ok) return { success: false as const, error: auth.error };

    const title = input.title.trim();
    const content = input.content.trim();
    const tags = (input.tags ?? "").trim();

    if (title.length < 5 || title.length > 120) {
      return { success: false as const, error: "Title must be between 5 and 120 characters." };
    }
    if (content.length < 20) {
      return { success: false as const, error: "Content must be at least 20 characters." };
    }

    const post = await prisma.doctorPost.create({
      data: {
        title,
        content,
        tags,
        authorId: auth.user.id,
        verifiedStatus: "pending",
      },
    });

    revalidatePath("/pro/doctor");
    return {
      success: true as const,
      data: {
        id: post.id,
        title: post.title,
        content: post.content,
        tags: post.tags,
        verifiedStatus: post.verifiedStatus,
      },
    };
  } catch (error) {
    console.error("Error creating doctor post:", error);
    return { success: false as const, error: "Failed to create post." };
  }
}

export async function getDoctorPosts(options?: {
  status?: string;
  authorId?: string;
  limit?: number;
}) {
  try {
    const where: Record<string, unknown> = {};
    if (options?.status) where.verifiedStatus = options.status;
    if (options?.authorId) where.authorId = options.authorId;

    const posts = await prisma.doctorPost.findMany({
      where,
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 50,
    });

    return { success: true as const, data: posts };
  } catch (error) {
    console.error("Error fetching doctor posts:", error);
    return { success: false as const, error: "Failed to fetch posts." };
  }
}

export async function getDoctorPostById(id: string) {
  try {
    const post = await prisma.doctorPost.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } } },
    });
    if (!post) return { success: false as const, error: "Post not found." };
    return { success: true as const, data: post };
  } catch (error) {
    console.error("Error fetching doctor post:", error);
    return { success: false as const, error: "Failed to fetch post." };
  }
}

export async function aiPublishingAssistant(rawNotes: string) {
  try {
    const auth = await requireDoctor();
    if (!auth.ok) return { success: false as const, error: auth.error };

    const notes = rawNotes.trim();
    if (notes.length < 10) {
      return {
        success: false as const,
        error: "Please provide at least a brief description of your article idea.",
      };
    }

    if (!isAiConfigured()) {
      return {
        success: false as const,
        error: "AI is not configured. Please set up an AI provider to use this feature.",
      };
    }

    const model = getModel();
    if (!model) {
      return { success: false as const, error: "AI model unavailable. Please try again later." };
    }

    if (isMockMode()) {
      return {
        success: true as const,
        data: {
          title: `Understanding ${notes.slice(0, 60)}`,
          content: `## Overview\n\n${notes}\n\n## Key Points\n\n- Fibromyalgia affects widespread pain processing\n- Consistent management strategies help reduce flare frequency\n- Always consult your care team before making changes\n\n## Practical Steps\n\n1. Track your symptoms daily\n2. Maintain a consistent sleep schedule\n3. Use gentle heat for muscle tension\n4. Stay hydrated\n\n> **Disclaimer:** This article is for informational purposes only and does not replace direct clinical judgment.`,
          tags: ["fibromyalgia", "patient-guidance"],
          summary: `An article addressing ${notes.slice(0, 80)}`,
        },
      };
    }

    const prompt = buildDoctorPublishingPrompt(notes);
    const { generateObject } = await import("ai");
    const result = await generateObject({
      model,
      schema: doctorArticleSchema,
      prompt,
    });

    return { success: true as const, data: result.object };
  } catch (error) {
    console.error("Error in AI publishing assistant:", error);
    return { success: false as const, error: "Failed to generate article. Please try again." };
  }
}

/* ------------------------------------------------------------------ */
/*  Consultation actions                                                */
/* ------------------------------------------------------------------ */

export async function createConsultation(input: {
  doctorId: string;
  subject: string;
}) {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false as const, error: "You must be signed in." };

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || !hasPermission(dbUser.role as UserRole, "consultation:write")) {
      return {
        success: false as const,
        error: "You need an active Pro subscription to start consultations.",
      };
    }

    const doctor = await prisma.user.findUnique({ where: { id: input.doctorId } });
    if (!doctor || doctor.role !== "doctor") {
      return { success: false as const, error: "Selected doctor is not verified." };
    }

    const subject = input.subject.trim();
    if (subject.length < 3 || subject.length > 200) {
      return { success: false as const, error: "Subject must be between 3 and 200 characters." };
    }

    const consultation = await prisma.consultation.create({
      data: {
        patientId: user.id,
        doctorId: input.doctorId,
        subject,
      },
    });

    revalidatePath("/pro/consultations");
    return {
      success: true as const,
      data: {
        id: consultation.id,
        subject: consultation.subject,
        status: consultation.status,
        patientId: consultation.patientId,
        doctorId: consultation.doctorId,
      },
    };
  } catch (error) {
    console.error("Error creating consultation:", error);
    return { success: false as const, error: "Failed to create consultation." };
  }
}

export async function getConsultations() {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false as const, error: "You must be signed in." };

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return { success: false as const, error: "User not found." };

    const isDoctor = dbUser.role === "doctor";

    const consultations = await prisma.consultation.findMany({
      where: isDoctor ? { doctorId: user.id } : { patientId: user.id },
      include: {
        patient: { select: { id: true, name: true } },
        doctor: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return { success: true as const, data: consultations };
  } catch (error) {
    console.error("Error fetching consultations:", error);
    return { success: false as const, error: "Failed to fetch consultations." };
  }
}

export async function getConsultationMessages(consultationId: string) {
  try {
    const auth = await requireConsultationAccess(consultationId);
    if (!auth.ok) return { success: false as const, error: auth.error };

    const messages = await prisma.consultationMessage.findMany({
      where: { consultationId },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    });

    return { success: true as const, data: messages };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { success: false as const, error: "Failed to fetch messages." };
  }
}

export async function sendMessage(consultationId: string, content: string) {
  try {
    const auth = await requireConsultationAccess(consultationId);
    if (!auth.ok) return { success: false as const, error: auth.error };

    const text = content.trim();
    if (text.length < 1 || text.length > 5000) {
      return { success: false as const, error: "Message must be between 1 and 5000 characters." };
    }

    const message = await prisma.consultationMessage.create({
      data: {
        consultationId,
        senderId: auth.userId,
        content: text,
      },
    });

    await prisma.consultation.update({
      where: { id: consultationId },
      data: { updatedAt: new Date() },
    });

    revalidatePath(`/pro/consultations/${consultationId}`);
    return {
      success: true as const,
      data: { id: message.id, content: message.content, createdAt: message.createdAt },
    };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false as const, error: "Failed to send message." };
  }
}

/* ------------------------------------------------------------------ */
/*  AI Copilot actions                                                  */
/* ------------------------------------------------------------------ */

export async function generateClinicalSummary(consultationId: string) {
  try {
    const auth = await requireConsultationAccess(consultationId);
    if (!auth.ok) return { success: false as const, error: auth.error };
    if (!auth.isDoctor) {
      return { success: false as const, error: "Only doctors can access clinical summaries." };
    }

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { patient: { select: { id: true, name: true } } },
    });
    if (!consultation) return { success: false as const, error: "Consultation not found." };

    // Gather patient's 30-day health data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await prisma.painLog.findMany({
      where: { userId: consultation.patientId, loggedAt: { gte: thirtyDaysAgo } },
      orderBy: { loggedAt: "desc" },
    });

    const symptoms = await prisma.symptomLog.findMany({
      where: { userId: consultation.patientId, createdAt: { gte: thirtyDaysAgo } },
    });

    const painLevels = logs.map((l) => l.painLevel);
    const avgPain7d =
      painLevels.length > 0
        ? Math.round((painLevels.slice(0, 7).reduce((a, b) => a + b, 0) / Math.min(painLevels.length, 7)) * 10) / 10
        : null;
    const avgPain30d =
      painLevels.length > 0
        ? Math.round((painLevels.reduce((a, b) => a + b, 0) / painLevels.length) * 10) / 10
        : null;
    const flareDays30d = painLevels.filter((p) => p >= 7).length;

    const symptomCounts = new Map<string, number>();
    for (const s of symptoms) {
      symptomCounts.set(s.symptom, (symptomCounts.get(s.symptom) ?? 0) + 1);
    }
    const topSymptoms = [...symptomCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([s]) => s);

    const medicationRegex =
      /\b(duloxetine|pregabalin|milnacipran|gabapentin|cymbalta|lyrica|savella|ibuprofen|acetaminophen|tylenol|advil|naproxen)\b/gi;
    const medications = new Set<string>();
    const recentNotes: string[] = [];
    for (const log of logs.slice(0, 10)) {
      if (log.notes) {
        recentNotes.push(log.notes.slice(0, 200));
        const matches = log.notes.match(medicationRegex);
        if (matches) matches.forEach((m) => medications.add(m.toLowerCase()));
      }
    }

    let trend: string = "insufficient data";
    if (painLevels.length >= 4) {
      const mid = Math.floor(painLevels.length / 2);
      const firstHalf = painLevels.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
      const secondHalf = painLevels.slice(mid).reduce((a, b) => a + b, 0) / (painLevels.length - mid);
      if (secondHalf - firstHalf > 0.5) trend = "rising";
      else if (firstHalf - secondHalf > 0.5) trend = "falling";
      else trend = "stable";
    }

    const healthData = {
      avgPain7d,
      avgPain30d,
      flareDays30d,
      logCount30d: logs.length,
      topSymptoms,
      streakDays: 0,
      trend,
      medications: [...medications],
      recentNotes: recentNotes.slice(0, 5),
    };

    // Data-driven fallback when AI is not available
    const fallbackResult = {
      overview: `Patient has logged ${logs.length} entries over 30 days with an average pain level of ${avgPain30d ?? "N/A"}/10 and ${flareDays30d} flare day(s).`,
      painSummary: `7-day average: ${avgPain7d ?? "N/A"}/10. 30-day average: ${avgPain30d ?? "N/A"}/10. Trend: ${trend}. Flare days (≥7/10): ${flareDays30d}.`,
      medicationSummary: medications.size > 0 ? `Medications mentioned: ${[...medications].join(", ")}.` : "No medications mentioned in recent logs.",
      symptomSummary: topSymptoms.length > 0 ? `Top symptoms: ${topSymptoms.join(", ")}.` : "No symptoms logged in this period.",
      keyConcerns: [
        flareDays30d > 5 ? "Frequent flares (>5 days)" : null,
        avgPain30d && avgPain30d > 6 ? "High average pain" : null,
        trend === "rising" ? "Worsening pain trend" : null,
      ].filter(Boolean) as string[],
      suggestedFocus: "Review current treatment plan and pain management strategies.",
    };

    if (!isAiConfigured()) {
      return { success: true as const, data: fallbackResult };
    }

    const model = getModel();
    if (!model) return { success: false as const, error: "AI model unavailable." };

    if (isMockMode()) {
      return {
        success: true as const,
        data: {
          ...fallbackResult,
          overview: `Patient ${consultation.patient.name} has been actively tracking symptoms with ${logs.length} entries over 30 days. Average pain level is ${avgPain30d ?? "N/A"}/10 with ${flareDays30d} flare day(s).`,
        },
      };
    }

    const prompt = buildClinicalSummaryPrompt(
      consultation.patient.name ?? "Patient",
      healthData
    );

    const { generateObject } = await import("ai");
    const result = await generateObject({ model, schema: clinicalSummarySchema, prompt });
    return { success: true as const, data: result.object };
  } catch (error) {
    console.error("Error generating clinical summary:", error);
    return { success: false as const, error: "Failed to generate clinical summary." };
  }
}

export async function generateDoctorResponseDraft(
  consultationId: string,
  patientMessage: string
) {
  try {
    const auth = await requireConsultationAccess(consultationId);
    if (!auth.ok) return { success: false as const, error: auth.error };
    if (!auth.isDoctor) {
      return { success: false as const, error: "Only doctors can use the response draft feature." };
    }

    const recentMessages = await prisma.consultationMessage.findMany({
      where: { consultationId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const clinicalContext = recentMessages
      .reverse()
      .map((m: { senderId: string; content: string }) =>
        `${m.senderId === auth.userId ? "Doctor" : "Patient"}: ${m.content}`
      )
      .join("\n");

    const fallbackResult = {
      draft: `Thank you for sharing your concerns. Based on what you've described, I'd like to discuss a few points:\n\n1. Your symptom patterns suggest we should review your current management approach\n2. Let's discuss any changes in your pain levels or sleep quality\n3. I recommend we schedule a follow-up to monitor your progress\n\nPlease continue tracking your symptoms and reach out if anything changes.`,
      keyPoints: [
        "Acknowledged patient concerns",
        "Suggested reviewing management approach",
        "Recommended continued tracking",
      ],
      followUpQuestions: [
        "When did you first notice this change?",
        "How has your sleep been recently?",
      ],
    };

    if (!isAiConfigured()) return { success: true as const, data: fallbackResult };

    const model = getModel();
    if (!model) return { success: false as const, error: "AI model unavailable." };

    if (isMockMode()) return { success: true as const, data: fallbackResult };

    const prompt = buildDoctorResponseDraftPrompt(patientMessage, clinicalContext);
    const { generateObject } = await import("ai");
    const result = await generateObject({ model, schema: doctorResponseDraftSchema, prompt });
    return { success: true as const, data: result.object };
  } catch (error) {
    console.error("Error generating response draft:", error);
    return { success: false as const, error: "Failed to generate response draft." };
  }
}

export async function structureSymptoms(rawInput: string) {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false as const, error: "You must be signed in." };

    const input = rawInput.trim();
    if (input.length < 5) {
      return {
        success: false as const,
        error: "Please describe how you're feeling in a few sentences.",
      };
    }

    const fallbackResult = {
      structuredMessage: `Dear Doctor,\n\nI'd like to share some updates about my fibromyalgia symptoms:\n\n${input}\n\nI've been consistently tracking my symptoms in FibroCare and would value your assessment.`,
      categories: [{ label: "Reported Symptoms", details: input }],
      suggestedQuestions: [
        "Should I adjust my current medication?",
        "What lifestyle changes would you recommend?",
      ],
    };

    if (!isAiConfigured()) return { success: true as const, data: fallbackResult };

    const model = getModel();
    if (!model) return { success: false as const, error: "AI model unavailable." };

    if (isMockMode()) return { success: true as const, data: fallbackResult };

    const prompt = buildSymptomStructurePrompt(input);
    const { generateObject } = await import("ai");
    const result = await generateObject({ model, schema: symptomStructureSchema, prompt });
    return { success: true as const, data: result.object };
  } catch (error) {
    console.error("Error structuring symptoms:", error);
    return { success: false as const, error: "Failed to structure symptoms. Please try again." };
  }
}

export async function getVerifiedDoctors() {
  try {
    const doctors = await prisma.user.findMany({
      where: { role: "doctor" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
    return { success: true as const, data: doctors };
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return { success: false as const, error: "Failed to fetch doctors." };
  }
}
