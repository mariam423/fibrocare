import { z } from "zod";

/**
 * Structured medical summary schema.
 *
 * The Server Action returns exactly this validated shape, so the client can
 * render the preview with full confidence in the data (no unsafe casts).
 */
export const medicalSummarySchema = z.object({
  generatedAt: z.string().datetime(),
  periodDays: z.number().int().positive(),
  patientName: z.string().min(1),
  stats: z.object({
    avgPain: z.number().min(0).max(10),
    flareUpDays: z.number().int().min(0),
    totalLogs: z.number().int().min(0),
    topSymptoms: z.array(z.string()),
  }),
  keyInsights: z.array(
    z.object({
      severity: z.enum(["info", "warning", "critical"]),
      title: z.string().min(1),
      message: z.string().min(1),
    })
  ),
  painTrends: z.array(
    z.object({
      date: z.string(),
      level: z.number().int().min(0).max(10),
    })
  ),
  recommendedQuestions: z.array(z.string().min(1)),
});

export type MedicalSummary = z.infer<typeof medicalSummarySchema>;

interface SummaryInput {
  patientName: string;
  logs: Array<{
    painLevel: number;
    loggedAt: string | Date;
  }>;
  insights: Array<{
    id: string;
    title: string;
    message: string;
    severity: "info" | "warning" | "critical";
  }>;
  topSymptoms: string[];
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/**
 * Deterministic "simulated AI" summarizer. Derives key insights, a 7-day
 * pain trend, and empathy-grounded questions for the doctor from the real
 * logs — no model call required, but the output is structured and validated
 * exactly as an LLM response would be.
 */
export function buildMedicalSummary(input: SummaryInput): MedicalSummary {
  const logs = [...input.logs].sort(
    (a, b) =>
      new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
  );

  const avgPain = logs.length
    ? logs.reduce((sum, l) => sum + l.painLevel, 0) / logs.length
    : 0;
  const flareUpDays = logs.filter((l) => l.painLevel >= 7).length;

  // 7-day trend window ending today.
  const trends: Array<{ date: string; level: number }> = [];
  const today = new Date();
  const levelByDay = new Map<string, number>();
  for (const log of logs) {
    levelByDay.set(toDateKey(new Date(log.loggedAt)), log.painLevel);
  }
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = toDateKey(d);
    trends.push({ date: key, level: levelByDay.get(key) ?? 0 });
  }

  const flareShare = logs.length ? flareUpDays / logs.length : 0;
  const symptomSet = new Set(input.topSymptoms);

  const questions: string[] = [];
  if (flareShare >= 0.2) {
    questions.push(
      `We logged ${flareUpDays} flare day${flareUpDays === 1 ? "" : "s"} in the last 30 days. Could we review what may be triggering them and adjust my plan?`
    );
  }
  if (avgPain >= 6) {
    questions.push(
      "My average pain has been high — are my current medications and doses still the right fit?"
    );
  }
  if (symptomSet.has("Fatigue") || symptomSet.has("Sleep Problems")) {
    questions.push(
      "Fatigue and sleep issues keep showing up in my logs — can we explore energy management and sleep strategies?"
    );
  }
  if (symptomSet.has("Headache / Migraine") || symptomSet.has("Light / Noise Sensitivity")) {
    questions.push(
      "Sensory sensitivity appears in my pattern. Are there pacing or environmental changes that could reduce it?"
    );
  }
  questions.push(
    "What movement or physiotherapy level is safe for me right now without worsening symptoms?"
  );
  questions.push(
    "How should I track or log differently so our next review is even more useful?"
  );

  const insights = input.insights
    .slice(0, 4)
    .map((insight) => ({
      severity: insight.severity,
      title: insight.title,
      message: insight.message,
    }));

  return {
    generatedAt: new Date().toISOString(),
    periodDays: 30,
    patientName: input.patientName,
    stats: {
      avgPain: Math.round(avgPain * 10) / 10,
      flareUpDays,
      totalLogs: logs.length,
      topSymptoms: input.topSymptoms.slice(0, 5),
    },
    keyInsights: insights,
    painTrends: trends,
    recommendedQuestions: questions.slice(0, 5),
  };
}
