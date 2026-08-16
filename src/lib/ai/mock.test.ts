import { describe, expect, it } from "vitest";
import {
  mockChatReply,
  mockDoctorQuestions,
  mockNarration,
  mockReflection,
  mockStreamResponse,
} from "@/lib/ai/mock";
import type { HealthSnapshot } from "@/lib/ai/schemas";
import {
  parseJsonEventStream,
  readUIMessageStream,
  uiMessageChunkSchema,
  type UIMessage,
  type UIMessageChunk,
} from "ai";

/** Full, valid snapshot — tests override just the field they exercise. */
function makeSnapshot(
  overrides: Partial<HealthSnapshot> = {}
): HealthSnapshot {
  return {
    currentPain: 4,
    avgPain7d: 4.2,
    avgPain30d: 4.1,
    flareDays30d: 1,
    logCount30d: 12,
    topSymptoms: ["fatigue", "pain", "stiffness"],
    streakDays: 5,
    mood: "Low Energy",
    lastLogAt: new Date().toISOString(),
    trend: "stable",
    ...overrides,
  };
}

const INSIGHTS = [
  {
    title: "High Average Pain",
    message: "Your average pain is elevated.",
    severity: "warning" as const,
  },
];

/**
 * Decode a mock response exactly like the client: SSE body → schema-validated
 * chunks (DefaultChatTransport.processResponseStream) → readUIMessageStream.
 * Returns the assembled assistant text.
 */
async function decodeMockStream(
  text: string,
  messageId?: string | null
): Promise<string> {
  const res = mockStreamResponse(text, messageId);
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toContain("text/event-stream");

  const body = res.body;
  if (!body) throw new Error("mock response has no body");

  const parsed = parseJsonEventStream({
    stream: body,
    schema: uiMessageChunkSchema,
  });
  const chunks = new ReadableStream<UIMessageChunk>({
    async start(controller) {
      const reader = parsed.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!value.success) throw value.error;
          controller.enqueue(value.value);
        }
      } finally {
        controller.close();
      }
    },
  });

  let last: UIMessage | undefined;
  for await (const message of readUIMessageStream({ stream: chunks })) {
    last = message;
  }
  return (last?.parts ?? [])
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

describe("mockStreamResponse", () => {
  it("streams a response the SDK client decodes back to the exact text", async () => {
    const text = "Hello there — a gently streamed mock reply for you.";
    expect(await decodeMockStream(text)).toBe(text);
  });

  it("echoes the pending message id in the start chunk", async () => {
    const raw = await mockStreamResponse("hi", "msg-42").text();
    expect(raw).toContain('"messageId":"msg-42"');
  });

  it("omits messageId from the start chunk when none is provided", async () => {
    const raw = await mockStreamResponse("hi", null).text();
    expect(raw).not.toContain("messageId");
    const rawUndefined = await mockStreamResponse("hi").text();
    expect(rawUndefined).not.toContain("messageId");
  });

  it("handles an empty reply gracefully (fallback chunk path)", async () => {
    expect(await decodeMockStream("")).toBe("");
  });
});

describe("mockChatReply", () => {
  it("escalates crisis mentions instead of problem-solving", () => {
    const reply = mockChatReply(
      makeSnapshot(),
      "Maya",
      "I want to end my life tonight"
    );
    expect(reply).toContain("988");
    expect(reply).toContain("care team");
  });

  it("prioritises a safety-first rest reply when pain is 7+", () => {
    const reply = mockChatReply(
      makeSnapshot({ currentPain: 8, avgPain7d: 6.7 }),
      "Maya",
      "help me plan a gentle day"
    );
    expect(reply).toContain("8/10");
    expect(reply).toContain("permission to do less");
    expect(reply).not.toContain("activity blocks");
  });

  it("answers flare-up questions with pacing advice and symptom context", () => {
    const reply = mockChatReply(
      makeSnapshot(),
      "Maya",
      "What helps most during a flare-up?"
    );
    expect(reply).toContain("During a flare");
    expect(reply).toContain("fatigue, pain, stiffness");
  });

  it("still answers flare questions when no symptoms are logged", () => {
    const reply = mockChatReply(
      makeSnapshot({ topSymptoms: [] }),
      "Maya",
      "what helps during a flare?"
    );
    expect(reply).toContain("During a flare");
  });

  it("recommends the zen calming mode for sleep/fatigue questions", () => {
    const reply = mockChatReply(
      makeSnapshot(),
      "Maya",
      "I'm so tired and can't sleep"
    );
    expect(reply).toContain("/zen");
    expect(reply).toContain("sleep");
  });

  it("suggests gentle movement for movement questions", () => {
    const reply = mockChatReply(
      makeSnapshot({ currentPain: 3 }),
      "Maya",
      "is gentle movement okay today?"
    );
    expect(reply).toContain("gentle");
    expect(reply).toContain("set the pace");
  });

  it("references logged data and the trend for data questions", () => {
    const reply = mockChatReply(
      makeSnapshot({ trend: "rising" }),
      "Maya",
      "Any patterns in my logs this week?"
    );
    expect(reply).toContain("recent logs");
    expect(reply).toContain("trend is rising");
    expect(reply).toContain("fatigue");
  });

  it("omits the trend when the snapshot has none", () => {
    const reply = mockChatReply(
      makeSnapshot({ trend: null }),
      "Maya",
      "patterns in my logs?"
    );
    expect(reply).not.toContain("trend is");
  });

  it("omits the symptom clause in data answers when none are logged", () => {
    const reply = mockChatReply(
      makeSnapshot({ topSymptoms: [], trend: "stable" }),
      "Maya",
      "patterns in my logs this week?"
    );
    expect(reply).toContain("recent logs");
    expect(reply).not.toContain("among your most frequent symptoms");
  });

  it("proposes a paced day plan for planning questions", () => {
    const reply = mockChatReply(
      makeSnapshot(),
      "Maya",
      "help me plan my day"
    );
    expect(reply).toContain("activity blocks");
  });

  it("falls back to a warm open question for unmatched messages", () => {
    const reply = mockChatReply(makeSnapshot(), "Maya", "How are you?");
    expect(reply).toContain("I'm here with you");
    expect(reply).toContain("Tell me what today feels like");
  });

  it("keeps the default reply warm even with no symptom data", () => {
    const reply = mockChatReply(
      makeSnapshot({ topSymptoms: [] }),
      "Maya",
      "How are you?"
    );
    expect(reply).toContain("I'm here with you");
    expect(reply).not.toContain("Symptoms like");
  });

  it("addresses the user by first name when known", () => {
    const reply = mockChatReply(makeSnapshot(), "Maya Johnson", "How are you?");
    expect(reply).toContain(", Maya.");
  });

  it("skips the name when the user is anonymous", () => {
    const reply = mockChatReply(makeSnapshot(), "there", "How are you?");
    expect(reply).toContain("I'm here with you.");
    expect(reply).not.toContain(", there");
    const noName = mockChatReply(makeSnapshot(), "", "How are you?");
    expect(noName).toContain("I'm here with you.");
  });

  it("handles days with no pain logged", () => {
    const reply = mockChatReply(
      makeSnapshot({ currentPain: null }),
      "Maya",
      "How are you?"
    );
    expect(reply).toContain("haven't logged pain");
  });

  it("omits the 7-day average when unavailable", () => {
    const reply = mockChatReply(
      makeSnapshot({ currentPain: 5, avgPain7d: null }),
      "Maya",
      "How are you?"
    );
    expect(reply).toContain("5/10 pain today");
    expect(reply).not.toContain("7-day average");
  });

  it("acknowledges the logging streak when present and omits it when zero", () => {
    const withStreak = mockChatReply(makeSnapshot(), "Maya", "How are you?");
    expect(withStreak).toContain("5-day logging streak");
    const noStreak = mockChatReply(
      makeSnapshot({ streakDays: 0 }),
      "Maya",
      "How are you?"
    );
    expect(noStreak).not.toContain("streak");
  });
});

describe("mockNarration", () => {
  it("leads with the current pain and explains detected patterns", () => {
    const reply = mockNarration(
      makeSnapshot({ currentPain: 8, streakDays: 5 }),
      INSIGHTS,
      "Maya"
    );
    expect(reply).toContain("you're at 8/10 pain");
    expect(reply).toContain("high average pain");
    expect(reply).toContain("5-day logging streak");
  });

  it("is honest when there are not enough logged days", () => {
    const reply = mockNarration(
      makeSnapshot({ currentPain: null, streakDays: 0 }),
      [],
      "Maya"
    );
    expect(reply).toContain("haven't logged pain today");
    expect(reply).toContain("aren't enough logged days");
    expect(reply).not.toContain("streak");
  });

  it("names a symptom for the gentle action when available", () => {
    const reply = mockNarration(
      makeSnapshot({ topSymptoms: ["fatigue"] }),
      INSIGHTS,
      "Maya"
    );
    expect(reply).toContain("(fatigue)");
  });

  it("omits the symptom suggestion when none are logged", () => {
    const reply = mockNarration(
      makeSnapshot({ topSymptoms: [] }),
      INSIGHTS,
      "Maya"
    );
    expect(reply).not.toContain("(");
  });
});

describe("mockReflection", () => {
  it("quotes a short note back verbatim and nudges gently", () => {
    const reply = mockReflection(
      "Exhausted after work today",
      makeSnapshot(),
      "Maya"
    );
    expect(reply).toContain("Exhausted after work today");
    expect(reply).toContain("worth gently noticing");
    expect(reply).toContain("fatigue and pain");
  });

  it("truncates very long notes", () => {
    const longNote = "word ".repeat(80).trim(); // > 140 chars
    const reply = mockReflection(longNote, makeSnapshot(), "Maya");
    expect(reply).toContain("…");
  });

  it("keeps the reflection generic when no symptoms are logged", () => {
    const reply = mockReflection(
      "Tough day",
      makeSnapshot({ topSymptoms: [] }),
      "Maya"
    );
    expect(reply).toContain("hard night's sleep");
    expect(reply).not.toContain("fatigue");
  });
});

describe("mockDoctorQuestions", () => {
  it("asks about medication fit when average pain is high", () => {
    const { questions } = mockDoctorQuestions(
      makeSnapshot({ avgPain30d: 6.7 }),
      []
    );
    const meds = questions.find((q) => q.question.includes("medications"));
    expect(meds).toBeDefined();
    expect(meds?.reason).toContain("6.7");
  });

  it("uses the 7-day average when the 30-day average is missing", () => {
    const { questions } = mockDoctorQuestions(
      makeSnapshot({ avgPain30d: null, avgPain7d: 6.5 }),
      []
    );
    expect(questions.some((q) => q.reason.includes("6.5"))).toBe(true);
  });

  it("skips the medication question when pain is well managed", () => {
    const { questions } = mockDoctorQuestions(
      makeSnapshot({ avgPain30d: null, avgPain7d: null, flareDays30d: 0 }),
      []
    );
    expect(
      questions.some((q) => q.question.includes("medications"))
    ).toBe(false);
  });

  it("asks about flare drivers when flares were logged", () => {
    const { questions } = mockDoctorQuestions(
      makeSnapshot({ flareDays30d: 3 }),
      []
    );
    expect(
      questions.some((q) => q.question.includes("flare days"))
    ).toBe(true);
  });

  it("asks about fatigue/sleep when they are top symptoms", () => {
    const { questions } = mockDoctorQuestions(
      makeSnapshot({ topSymptoms: ["fatigue", "pain"] }),
      []
    );
    expect(
      questions.some((q) => q.question.toLowerCase().includes("fatigue"))
    ).toBe(true);
  });

  it("also triggers the sleep question when sleep alone is a top symptom", () => {
    const { questions } = mockDoctorQuestions(
      makeSnapshot({ topSymptoms: ["sleep"] }),
      []
    );
    expect(
      questions.some((q) => q.question.toLowerCase().includes("fatigue"))
    ).toBe(true);
  });

  it("asks about safe movement when pain/stiffness are top symptoms", () => {
    const { questions } = mockDoctorQuestions(
      makeSnapshot({ topSymptoms: ["stiffness"] }),
      []
    );
    expect(
      questions.some((q) => q.question.includes("movement or stretching"))
    ).toBe(true);
  });

  it("grounds a question in a detected insight when present", () => {
    const { questions } = mockDoctorQuestions(
      makeSnapshot({ avgPain30d: null, avgPain7d: null, flareDays30d: 0 }),
      INSIGHTS
    );
    expect(
      questions.some((q) => q.question.includes("high average pain"))
    ).toBe(true);
  });

  it("always returns at least one question and fills gaps with fallbacks", () => {
    const { questions } = mockDoctorQuestions(
      makeSnapshot({
        avgPain30d: null,
        avgPain7d: null,
        flareDays30d: 0,
        topSymptoms: ["nausea"],
      }),
      []
    );
    expect(questions.length).toBeGreaterThanOrEqual(2);
    expect(
      questions.some((q) => q.question.includes("logging differently"))
    ).toBe(true);
    for (const q of questions) {
      expect(q.question.trim().length).toBeGreaterThan(0);
      expect(q.reason.trim().length).toBeGreaterThan(0);
    }
  });

  it("does not pad with fallbacks when enough data questions exist", () => {
    const { questions } = mockDoctorQuestions(
      makeSnapshot({
        avgPain30d: 6.7,
        flareDays30d: 3,
        topSymptoms: ["fatigue", "stiffness"],
      }),
      INSIGHTS
    );
    expect(
      questions.some((q) => q.question.includes("logging differently"))
    ).toBe(false);
    expect(questions.length).toBeLessThanOrEqual(6);
    expect(questions.length).toBeGreaterThanOrEqual(3);
  });
});
