import { z } from "zod";

export const CycleLogSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  phase: z.enum(["MENSTRUAL", "FOLLICULAR", "OVULATORY", "LUTEAL"]),
  overallSeverity: z.number().int().min(1).max(10).default(5),
  notes: z.string().optional(),
}).refine(data => !data.endDate || data.endDate >= data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"]
});

export const SymptomLogSchema = z.object({
  symptom: z.string().min(3),
  severity: z.number().int().min(1).max(10).default(5),
  category: z.enum(["PHYSICAL", "COGNITIVE", "MOOD"]),
  area: z.enum(["PELVIC", "LOWER_BACK", "WIDESPREAD", "JOINTS", "OTHER"]).optional(),
  date: z.string(), // ISO date string
});

export type CycleLogInput = z.infer<typeof CycleLogSchema>;
export type SymptomLogInput = z.infer<typeof SymptomLogSchema>;
