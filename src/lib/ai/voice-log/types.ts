/**
 * Zod schemas for Voice-to-Structured Health Log.
 *
 * Spoken or free-text thoughts in ("left shoulder hurts badly, slept
 * poorly") → validated structured fields out (pain score, body locations,
 * sleep quality, symptoms) that can populate the daily check-in form with
 * one click. Both the heuristic offline parser and the LLM path validate
 * against these schemas before anything reaches the UI.
 */

import { z } from "zod";

export const BODY_LOCATIONS = [
  "neck", "shoulders", "left shoulder", "right shoulder", "upper back",
  "lower back", "chest", "arms", "left arm", "right arm", "elbows",
  "wrists", "hands", "hips", "legs", "knees", "left knee", "right knee",
  "ankles", "feet", "jaw", "head", "abdomen", "thighs", "calves",
] as const;

export const KNOWN_SYMPTOMS = [
  "fatigue", "brain fog", "headache", "insomnia", "nausea", "dizziness",
  "stiffness", "numbness", "tingling", "sensitivity to light",
  "sensitivity to noise", "bloating", "anxiety", "low mood", "irritable",
  "unrefreshing sleep", "muscle spasms", "restless legs",
] as const;

export const parsedHealthLogSchema = z.object({
  painScore: z.number().int().min(0).max(10).nullable(),
  bodyLocations: z.array(z.string().min(1)).max(6),
  /** 1 = terrible … 5 = excellent. */
  sleepQuality: z.number().int().min(1).max(5).nullable(),
  symptoms: z.array(z.string().min(1)).max(8),
  mood: z.string().max(40).nullable(),
  energy: z.number().int().min(0).max(10).nullable(),
  /** Tidied-up version of the user's text, for confirmation. */
  notesClean: z.string().min(1).max(600),
  /** How confident the parser is — shown so the user reviews low values. */
  confidence: z.number().min(0).max(1),
});

export type ParsedHealthLog = z.infer<typeof parsedHealthLogSchema>;

export const parseLogResponseSchema = z.object({
  parsed: parsedHealthLogSchema,
  source: z.enum(["llm", "heuristic"]),
});

export type ParseLogResponse = z.infer<typeof parseLogResponseSchema>;
