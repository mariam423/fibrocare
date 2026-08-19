/**
 * Mock-mode AI responses (no API key required).
 *
 * When `AI_MOCK_MODE` is enabled (or defaults on in local dev without a key)
 * the AI routes serve deterministic, health-snapshot-grounded replies through
 * the exact same UI-message wire protocol as the live SDK, so the client
 * components stream and render them identically. The copy follows the same
 * empathy rules as the real system prompts — no empty empathy, no invented
 * data, crisis text escalates to help lines.
 */

import { createUIMessageStreamResponse, type UIMessageChunk } from "ai";
import type {
  DoctorQuestions,
  HealthSnapshot,
} from "@/lib/ai/schemas";

/** Small delay between word chunks so the reply *feels* like streaming. */
const CHUNK_DELAY_MS = 14;

/**
 * Emits `text` as a UI-message stream that the AI SDK client
 * (`useChat` / `readUIMessageStream`) decodes exactly like a live response.
 */
export function mockStreamResponse(
  text: string,
  messageId?: string | null
): Response {
  const id = "mock-response";
  const pieces = text.match(/\S+\s*|\s+/g) ?? [text];

  const chunks: UIMessageChunk[] = [
    { type: "start", messageId: messageId ?? undefined },
    { type: "start-step" },
    { type: "text-start", id },
    ...pieces.map(
      (delta): UIMessageChunk => ({ type: "text-delta", id, delta })
    ),
    { type: "text-end", id },
    { type: "finish-step" },
    { type: "finish", finishReason: "stop" },
  ];

  const stream = new ReadableStream<UIMessageChunk>({
    async start(controller) {
      try {
        for (const chunk of chunks) {
          controller.enqueue(chunk);
          if (chunk.type === "text-delta") {
            await new Promise((r) => setTimeout(r, CHUNK_DELAY_MS));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return createUIMessageStreamResponse({ stream });
}

/** Crisis / self-harm keywords — must escalate, never problem-solve. */
const CRISIS_PATTERN =
  /suicid|kill myself|self-?harm|hurt myself|want to die|end (my )?life|emergency/;

/** Topic detection for the chat companion's canned-but-contextual replies. */
const TOPICS: Array<{ pattern: RegExp; pick: (s: HealthSnapshot) => string }> = [
  {
    pattern: /flare|pain(ful|ing)?|hurt|ache|agon/i,
    pick: () => `flare`,
  },
  {
    pattern: /sleep|insomnia|tired|fatigue|exhaust|rest/i,
    pick: () => `sleep`,
  },
  {
    pattern: /mov(e|ement)|walk|stretch|exercise|active|gentle/i,
    pick: () => `movement`,
  },
  {
    pattern: /pattern|data|log|trend|insight|symptom|week/i,
    pick: () => `data`,
  },
  {
    pattern: /plan|schedule|routine|pace|day|energy|spoon/i,
    pick: () => `plan`,
  },
];

function firstName(userName: string): string {
  const name = userName.trim().split(/\s+/)[0];
  return name && name !== "there" ? `, ${name}` : "";
}

function painLine(s: HealthSnapshot): string {
  if (s.currentPain === null) return "You haven't logged pain today yet";
  return `You logged ${s.currentPain}/10 pain today${
    s.avgPain7d !== null ? ` (7-day average ${s.avgPain7d}/10)` : ""
  }`;
}

function streakLine(s: HealthSnapshot): string {
  return s.streakDays > 0
    ? `That ${s.streakDays}-day logging streak is real consistency — chronic illness makes that genuinely hard, and you're doing it.`
    : "";
}

/** Contextual chat reply grounded in the user's live health snapshot. */
export function mockChatReply(
  snapshot: HealthSnapshot,
  userName: string,
  userMessage: string
): string {
  const name = firstName(userName);
  const msg = userMessage.toLowerCase();

  if (CRISIS_PATTERN.test(msg)) {
    return `That sounds incredibly heavy to be carrying right now${name}, and it's important you don't carry it alone. Please reach out to your care team, call a crisis line (in the US/Canada, 988), or contact emergency services right away — you matter, and the people who care about you need to know how hard this is. I'm staying right here with you.`;
  }

  if (snapshot.currentPain !== null && snapshot.currentPain >= 7) {
    return `That level of pain is a lot to sit with${name}. ${painLine(snapshot)}. ${streakLine(snapshot)} Right now the kindest thing is rest and comfort: a warm compress or gentle stretch, hydration, and permission to do less today. If it doesn't ease, checking in with your care team is a reasonable step — you never need to "push through".`;
  }

  const topic = TOPICS.find((t) => t.pattern.test(msg));
  switch (topic?.pick(snapshot)) {
    case "flare":
      return `${painLine(snapshot)}. During a flare, shrink the day down to its essentials: rest between efforts, warm comfort measures, and gentle movement only if it feels okay${snapshot.topSymptoms.length ? ` — I can see ${snapshot.topSymptoms.slice(0, 3).join(", ")} have been showing up in your logs` : ""}. ${streakLine(snapshot)}`;
    case "sleep":
      return `Sleep and fibromyalgia often fight each other, and that's exhausting${name}. A gentle wind-down — same bedtime, dim lights, no screens an hour before, and a slow breathing exercise (the Calming Mode on the /zen page is built for this) — tends to help more than trying to force sleep. Have your nights been restless lately?`;
    case "movement":
      return `Movement with fibromyalgia is about listening, not pushing${name}. Short, low-effort options — a 5-minute gentle walk, light stretching, or slow breathing — usually beat a big workout on a flare-prone day. ${painLine(snapshot)}. Start smaller than you think you need, and let your body set the pace.`;
    case "data":
      return `Looking at your recent logs: ${painLine(snapshot).toLowerCase()}${snapshot.trend ? `, and your 7-day pain trend is ${snapshot.trend}` : ""}${snapshot.topSymptoms.length ? `, with ${snapshot.topSymptoms.slice(0, 3).join(", ")} among your most frequent symptoms` : ""}. ${streakLine(snapshot)} Want me to help spot a pattern — say, what happens on higher-pain days?`;
    case "plan":
      return `A gentle day plan works best when it has built-in rest${name}. Try three short "activity blocks" (light tasks, gentle movement, a pleasant thing) separated by rest — and a hard stop on effort, not a goal. ${painLine(snapshot)}. What part of your day tends to drain the most energy?`;
    default:
      return `I'm here with you${name}. ${painLine(snapshot)}${snapshot.topSymptoms.length ? ` Symptoms like ${snapshot.topSymptoms.slice(0, 3).join(", ")} have been in your recent logs` : ""}. ${streakLine(snapshot)} Tell me what today feels like — I'd rather hear about your day than guess at it.`;
  }
}

/** Warm narration of detected patterns (mock version of the insight route). */
export function mockNarration(
  snapshot: HealthSnapshot,
  insights: Array<{ title: string; message: string; severity: string }>,
  userName: string,
  missingLogsFallback?: string
): string {
  const name = firstName(userName);
  const headline =
    snapshot.currentPain !== null
      ? `Right now you're at ${snapshot.currentPain}/10 pain`
      : `You haven't logged pain today`;
  const insightLines =
    insights.length > 0
      ? insights
          .slice(0, 2)
          .map((i) => `One thing your data shows: ${i.title.toLowerCase()} — ${i.message}`)
          .join(" ")
      : (missingLogsFallback ?? "There aren't enough logged days yet to spot firm patterns, and that's okay — every log adds to the picture.");

  return `${headline}${name}, and here's what your last 30 days say in plain words. ${insightLines} ${
    snapshot.streakDays > 0
      ? `You've also kept a ${snapshot.streakDays}-day logging streak, which gives this analysis real footing. `
      : ""
  }A gentle action for today: pick one small thing that usually eases your worst symptom${
    snapshot.topSymptoms[0] ? ` (${snapshot.topSymptoms[0]})` : ""
  } and give it 10 quiet minutes. You're gathering useful information just by showing up.`;
}

/** Empathetic reflection on a journal note (mock version of the reflect route). */
export function mockReflection(
  note: string,
  snapshot: HealthSnapshot,
  userName: string
): string {
  const name = firstName(userName);
  const firstLine = note.split(/\n/)[0].trim();
  const snippet =
    firstLine.length > 140 ? firstLine.slice(0, 140) + "…" : firstLine;

  const nudge =
    snapshot.topSymptoms.length > 0
      ? `Given that ${snapshot.topSymptoms
          .slice(0, 2)
          .join(" and ")} have been in your recent logs, it's worth gently noticing whether days like this one tend to follow a hard night's sleep or a busy stretch.`
      : `It's worth gently noticing whether days like this one tend to follow a hard night's sleep or a busy stretch.`;

  return `You wrote: "${snippet}". That's a real, specific snapshot of how today went${name} — and naming it honestly takes energy you may not have had to spare. ${nudge} A small next step: tonight, choose one tiny comfort (a warm drink, slow breathing for two minutes, early lights-out) and treat it as part of your care, not an afterthought. If this kind of day keeps repeating, it's a fair thing to mention to your care team.`;
}

/** Data-grounded doctor questions (mock version of the questions route). */
export function mockDoctorQuestions(
  snapshot: HealthSnapshot,
  insights: Array<{ title: string; message: string; severity: string }>
): DoctorQuestions {
  const q: Array<{ question: string; reason: string }> = [];
  const avg =
    snapshot.avgPain30d !== null
      ? snapshot.avgPain30d
      : snapshot.avgPain7d;

  if (avg !== null && avg >= 6) {
    q.push({
      question: "Given my average pain is around 6/10, are my current medications and doses still the best fit?",
      reason: `My 30-day average pain is ${avg}/10.`,
    });
  }
  if (snapshot.flareDays30d > 0) {
    q.push({
      question: "What might be driving my flare days, and what should I track between appointments to help us find out?",
      reason: `I had ${snapshot.flareDays30d} flare day(s) in the last 30 days.`,
    });
  }
  if (snapshot.topSymptoms.includes("fatigue") || snapshot.topSymptoms.includes("sleep")) {
    q.push({
      question: "My fatigue is one of my top symptoms — are sleep or other factors treatable contributors, and what's safe to try?",
      reason: `Fatigue/sleep appear in my most frequent symptoms: ${snapshot.topSymptoms.slice(0, 3).join(", ")}.`,
    });
  }
  if (snapshot.topSymptoms.includes("stiffness") || snapshot.topSymptoms.includes("pain")) {
    q.push({
      question: "What movement or stretching is safe on my higher-pain days without making things worse?",
      reason: `Pain/stiffness is among my top logged symptoms.`,
    });
  }
  if (insights.length > 0) {
    q.push({
      question: `About the pattern "${insights[0].title.toLowerCase()}": is this something we should address or just keep monitoring?`,
      reason: insights[0].message,
    });
  }
  if (q.length < 3) {
    q.push({
      question: "What should I be logging differently so our next visit is more useful?",
      reason: "I want my tracking to support better decisions.",
    });
    q.push({
      question: "Which symptoms warrant an urgent call versus waiting until the next appointment?",
      reason: "I want clear guidance on when to reach out.",
    });
  }

  return { questions: q.slice(0, 6) };
}
