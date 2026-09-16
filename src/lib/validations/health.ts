import { z } from "zod";

export const CycleLogSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  phase: z.enum(["MENSTRUAL", "FOLLICULAR", "OVULATORY", "LUTEAL"]),
  overallSeverity: z.number().int().min(1).max(10).default(5),
  // Bound free-text notes before they reach the database (the route
  // sanitizes content; this caps size so oversized payloads fail fast).
  notes: z.string().max(2000).optional(),
}).refine(data => !data.endDate || data.endDate >= data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"]
});

export const SymptomLogSchema = z.object({
  // Cap the symptom label (the server action path caps at 60; this is the
  // shared API ceiling) so nothing oversized reaches the unique index key.
  symptom: z.string().min(3).max(120),
  severity: z.number().int().min(1).max(10).default(5),
  category: z.enum(["PHYSICAL", "COGNITIVE", "MOOD"]),
  area: z.enum(["PELVIC", "LOWER_BACK", "WIDESPREAD", "JOINTS", "OTHER"]).optional(),
  // The whole app buckets symptoms by UTC YYYY-MM-DD string keys
  // (insight engine, correlations ranges) — enforce the exact format.
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be a YYYY-MM-DD string"),
});

export type CycleLogInput = z.infer<typeof CycleLogSchema>;
export type SymptomLogInput = z.infer<typeof SymptomLogSchema>;
