/**
 * Structured Memory Layer for the AI Care Companion.
 *
 * Two layers, both Zod-validated at the boundary:
 *
 *  - SHORT-TERM memory: the current thread's conversation history. The client
 *    sends raw UI messages; we validate, normalize, and compact them into a
 *    bounded window (per-message + whole-window character budgets) so the
 *    thread never bloats the prompt as it grows.
 *
 *  - LONG-TERM memory: the patient's 30-day health snapshot (pain averages,
 *    symptoms, flare trend, streak) extended with medications mentioned in
 *    recent notes and current weather context. Built server-side from Prisma,
 *    never trusted from the client.
 */

import { z } from "zod";
import type { ModelMessage } from "ai";
import { prisma } from "@/lib/prisma";
import { healthSnapshotSchema, type HealthSnapshot } from "@/lib/ai/schemas";
import { buildHealthSnapshot } from "@/lib/ai/context";
import { deterministicWeather } from "@/lib/weather";

/* ------------------------------------------------------------------ */
/* Short-term memory (thread history)                                  */
/* ------------------------------------------------------------------ */

/** Per-message cap — a single pasted essay can't eat the whole budget. */
const MAX_MESSAGE_CHARS = 1500;
/** Whole-window cap — the thread's total prompt footprint is bounded. */
const MAX_WINDOW_CHARS = 8000;
/** Turn cap — beyond this, older turns are dropped whole. */
const MAX_MESSAGES = 12;

/** What the client is allowed to send for a thread message. */
const rawUiMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.unknown().optional(),
  parts: z
    .array(
      z.object({
        type: z.string().optional(),
        text: z.string().optional(),
      })
    )
    .optional(),
});

export const shortTermMessageSchema = z.object({
  role: z.union([z.literal("user"), z.literal("assistant")]),
  text: z.string().min(1).max(MAX_MESSAGE_CHARS),
});

export type ShortTermMessage = z.infer<typeof shortTermMessageSchema>;

export interface ShortTermMemory {
  messages: ModelMessage[];
  lastUserText: string;
}

function textOf(raw: z.infer<typeof rawUiMessageSchema>): string {
  if (typeof raw.content === "string") return raw.content;
  return (raw.parts ?? [])
    .filter((p) => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text as string)
    .join("");
}

/**
 * Validate and compact a raw UI-message payload into short-term memory.
 *
 * Guarantees (token-bloat controls):
 *  - only `user` / `assistant` roles survive (no injected system messages);
 *  - empty messages are dropped;
 *  - each message is truncated to MAX_MESSAGE_CHARS;
 *  - at most MAX_MESSAGES most-recent messages are kept;
 *  - the window is further trimmed, oldest-first, to MAX_WINDOW_CHARS.
 */
export function buildShortTermMemory(raw: unknown[]): ShortTermMemory {
  const parsed: ShortTermMessage[] = [];

  for (const item of raw) {
    const result = rawUiMessageSchema.safeParse(item);
    if (!result.success) continue;
    const text = textOf(result.data).trim().slice(0, MAX_MESSAGE_CHARS);
    if (!text) continue;
    parsed.push(shortTermMessageSchema.parse({ role: result.data.role, text }));
  }

  const windowed = parsed.slice(-MAX_MESSAGES);

  // Enforce the whole-window budget, dropping OLDEST messages first so the
  // most recent context (what the user just said) always survives.
  let budget = MAX_WINDOW_CHARS;
  let firstKept = 0;
  for (let i = 0; i < windowed.length; i++) {
    budget -= windowed[i].text.length;
    if (budget < 0) {
      firstKept = i;
      break;
    }
  }
  const kept = windowed.slice(firstKept);

  // A thread that starts with an orphaned assistant reply reads as a
  // continuation the model never saw — drop leading assistant turns.
  const start = kept.findIndex((m) => m.role === "user");
  const messages = (start === -1 ? [] : kept.slice(start)).map((m) =>
    m.role === "user"
      ? ({ role: "user", content: [{ type: "text", text: m.text }] } as ModelMessage)
      : ({ role: "assistant", content: [{ type: "text", text: m.text }] } as ModelMessage)
  );

  let lastUserText = "";
  for (let i = parsed.length - 1; i >= 0; i--) {
    if (parsed[i].role === "user") {
      lastUserText = parsed[i].text;
      break;
    }
  }

  return { messages, lastUserText };
}

/* ------------------------------------------------------------------ */
/* Long-term memory (30-day patient context)                           */
/* ------------------------------------------------------------------ */

/**
 * Common fibromyalgia-relevant medications (brand + generic spellings),
 * normalized to their generic name. Used only to surface what the patient
 * themselves wrote in their own notes — never to suggest or confirm meds.
 */
const MEDICATION_PATTERNS: Array<{ match: RegExp; name: string }> = [
  { match: /\bamitriptyline\b/i, name: "amitriptyline" },
  { match: /\bduloxetine\b|\bcymbalta\b/i, name: "duloxetine" },
  { match: /\bmilnacipran\b|\bsavella\b/i, name: "milnacipran" },
  { match: /\bpregabalin\b|\blyrica\b/i, name: "pregabalin" },
  { match: /\bgabapentin\b|\bneurontin\b/i, name: "gabapentin" },
  { match: /\bcyclobenzaprine\b|\bflexeril\b/i, name: "cyclobenzaprine" },
  { match: /\btramadol\b/i, name: "tramadol" },
  { match: /\bnaltrexone\b/i, name: "naltrexone" },
  { match: /\bparacetamol\b|\btylenol\b|\bacetaminophen\b/i, name: "paracetamol/acetaminophen" },
  { match: /\bnaproxen\b/i, name: "naproxen" },
  { match: /\bibuprofen\b|\badvil\b|\bnurofen\b/i, name: "ibuprofen" },
  { match: /\bmelatonin\b/i, name: "melatonin" },
];

/** Weather context actually persisted nowhere — described honestly, never invented. */
export const weatherContextSchema = z.object({
  summary: z.string(),
  source: z.enum(["live", "estimated"]),
});

export const longTermMemorySchema = healthSnapshotSchema.extend({
  /** Generic med names the patient mentioned in their own 30-day notes. */
  medications: z.array(z.string()),
  /** Current local weather (live when configured, otherwise labeled estimate). */
  weather: weatherContextSchema.nullable(),
});

export type LongTermMemory = z.infer<typeof longTermMemorySchema>;
export type { HealthSnapshot };

/** Patient-reported generic med names found in their own 30-day notes. */
export async function buildMedicationMentions(userId: string): Promise<string[]> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const noteRows = await prisma.painLog.findMany({
    where: { userId, loggedAt: { gte: since }, notes: { not: null } },
    orderBy: { loggedAt: "desc" },
    take: 60,
    select: { notes: true },
  });

  const found = new Set<string>();
  for (const { notes } of noteRows) {
    if (!notes) continue;
    for (const { match, name } of MEDICATION_PATTERNS) {
      if (match.test(notes)) found.add(name);
    }
  }
  return [...found].slice(0, 6);
}

async function buildWeatherContext(): Promise<LongTermMemory["weather"]> {
  const apiKey = process.env.OPENWEATHER_API_KEY?.trim();
  const city = process.env.OPENWEATHER_CITY?.trim() || "London";

  if (apiKey) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&units=metric&appid=${apiKey}`;
      const res = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const data = await res.json();
        const main = data?.main as { temp?: number; humidity?: number } | undefined;
        if (main && typeof main.temp === "number") {
          return {
            summary: `${Math.round(main.temp)}°C, ${
              typeof main.humidity === "number" ? `${Math.round(main.humidity)}% humidity` : "humidity unknown"
            }`,
            source: "live",
          };
        }
      }
    } catch {
      // fall through to the labeled estimate
    }
  }

  const est = deterministicWeather(new Date());
  return {
    summary: `${est.temperature}°C, ${est.humidity}% humidity (estimated)`,
    source: "estimated",
  };
}

/**
 * Build the long-term memory: the validated 30-day snapshot extended with
 * medication mentions and current weather context. Safe to call per request —
 * all queries are bounded.
 */
export async function buildLongTermMemory(userId: string): Promise<LongTermMemory> {
  const [snapshot, medications, weather] = await Promise.all([
    buildHealthSnapshot(userId),
    buildMedicationMentions(userId),
    buildWeatherContext(),
  ]);

  return longTermMemorySchema.parse({ ...snapshot, medications, weather });
}
