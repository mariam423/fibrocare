import { describe, expect, it } from "vitest";
import {
  IncrementalGuardrail,
  enforceWarmTherapyGuardrail,
  sanitizeArabicLeaks,
  sanitizeWarmTherapy,
  stripForeignScripts,
  createGuardrailStreamTransform,
} from "./guardrails";
import { parseUiMessageSseText } from "./sse";
import {
  parseJsonEventStream,
  readUIMessageStream,
  uiMessageChunkSchema,
  type UIMessage,
  type UIMessageChunk,
} from "ai";

describe("sanitizeWarmTherapy", () => {
  it("rewrites English cold-therapy phrases to warm equivalents", () => {
    expect(sanitizeWarmTherapy("Try an ice pack for 15 minutes.")).toBe(
      "Try a warm compress for 15 minutes."
    );
    expect(sanitizeWarmTherapy("Cold packs can numb the area.")).toBe(
      "warm compress can numb the area."
    );
  });

  it("prefers the longest match so 'cold compresses' is not half-replaced", () => {
    expect(sanitizeWarmTherapy("cold compresses help some people")).toBe(
      "warm compress help some people"
    );
  });

  it("rewrites Arabic cold-therapy phrases", () => {
    expect(sanitizeWarmTherapy("ضع كمادة باردة على العضلات")).toBe(
      "ضع كمادة دافئة على العضلات"
    );
    expect(sanitizeWarmTherapy("جرب حمام بارد لتهدئة الجسم")).toBe(
      "جرب حمام دافئ لتهدئة الجسم"
    );
  });

  it("is idempotent on already-compliant text", () => {
    const compliant = "A warm compress or a warm bath helps most.";
    expect(sanitizeWarmTherapy(compliant)).toBe(compliant);
  });

  it("leaves unrelated text untouched", () => {
    expect(sanitizeWarmTherapy("Stay hydrated and pace yourself.")).toBe(
      "Stay hydrated and pace yourself."
    );
  });
});

describe("enforceWarmTherapyGuardrail", () => {
  it("appends an English warm line when tension has no warm measure", () => {
    const out = enforceWarmTherapyGuardrail("Your muscles seem tense today.");
    expect(out).toContain("muscles seem tense");
    expect(out).toContain("warm compress or a warm bath");
  });

  it("appends an Arabic warm line for Arabic replies", () => {
    const out = enforceWarmTherapyGuardrail("لاحظت توتر العضلات اليوم.");
    expect(out).toContain("الكمادات الدافئة أو الحمام الدافئ");
  });

  it("does not append when a warm measure is already mentioned", () => {
    const text =
      "Muscle stiffness often eases with a warm compress before stretching.";
    expect(enforceWarmTherapyGuardrail(text)).toBe(text);
  });

  it("does not append when nothing about tension is discussed", () => {
    expect(enforceWarmTherapyGuardrail("Hope you sleep well tonight!")).toBe(
      "Hope you sleep well tonight!"
    );
  });

  it("checks the rule AFTER rewriting, so rewritten warmth counts", () => {
    // "ice pack" becomes "warm compress" — that satisfies the warm mention.
    const out = enforceWarmTherapyGuardrail(
      "For muscle stiffness, place an ice pack on the spot."
    );
    expect(out).toContain("place a warm compress");
    expect(out).not.toContain("For easing that muscle tension specifically");
  });
});

describe("IncrementalGuardrail streaming invariant", () => {
  function streamThrough(text: string, sizes: number[]): string {
    const g = new IncrementalGuardrail();
    let out = "";
    let offset = 0;
    let i = 0;
    while (offset < text.length) {
      const size = sizes[i % sizes.length];
      out += g.push(text.slice(offset, offset + size));
      offset += size;
      i++;
    }
    return out + g.flush();
  }

  it("equals the one-shot guardrail output across tiny deltas", () => {
    const reply =
      "When your muscles feel tense, many people find gentle stretching helps. Avoid ice packs; try heat instead. Rest well!";
    const expected = enforceWarmTherapyGuardrail(reply);
    const streamed = streamThrough(reply, [3, 7, 1, 11]);
    expect(streamed).toBe(expected);
  });

  it("handles a rewrite phrase split exactly across two deltas", () => {
    const g = new IncrementalGuardrail();
    const a = g.push("Use an ice pa");
    const b = g.push("ck tonight.");
    const c = g.flush();
    expect(a + b + c).toBe("Use a warm compress tonight.");
    expect(a.length).toBeLessThan("Use an ice pa".length); // held back safely
  });

  it("holds back forming prefixes at chunk boundaries", () => {
    const g = new IncrementalGuardrail();
    const a = g.push("Apply col");
    expect(a).toBe("");
    const b = g.push("d compress later.");
    const c = g.flush();
    expect(a + b + c).toContain("warm compress");
  });

  it("appends the mandated sentence only once, at flush time", () => {
    const reply = "Tension in the shoulders is common during flares.";
    const g = new IncrementalGuardrail();
    let out = "";
    for (const ch of reply) out += g.push(ch);
    const tail = g.flush();
    expect(tail).toContain("warm compress");
    expect((out + tail).match(/warm compress/g)?.length).toBe(1);
  });

  it("passes through plain text unchanged when no rules apply", () => {
    const streamed = streamThrough("Just a calm evening message.", [4]);
    expect(streamed).toBe("Just a calm evening message.");
  });
});

describe("createGuardrailStreamTransform", () => {
  async function transformSse(input: string): Promise<string> {
    const body = new Response(input).body;
    if (!body) throw new Error("test stream has no body");
    const transformed = body.pipeThrough(createGuardrailStreamTransform());
    const reader = transformed.getReader();
    const decoder = new TextDecoder();
    let output = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      output += decoder.decode(value, { stream: true });
    }
    return output;
  }

  it("flushes every independently keyed text block in a multi-step stream", async () => {
    const input = [
      'data: {"type":"start","messageId":"m1"}',
      'data: {"type":"text-start","id":"text-1"}',
      'data: {"type":"text-delta","id":"text-1","delta":"First part."}',
      'data: {"type":"text-end","id":"text-1"}',
      'data: {"type":"text-start","id":"text-2"}',
      'data: {"type":"text-delta","id":"text-2","delta":"Second part must not disappear."}',
      'data: {"type":"text-end","id":"text-2"}',
      'data: {"type":"finish","finishReason":"stop"}',
    ].join("\n\n") + "\n\n";

    const output = await transformSse(input);
    expect(parseUiMessageSseText(output)).toBe(
      "First part.Second part must not disappear."
    );
  });

  it("produces a UI-message stream the AI SDK client can decode", async () => {
    const input = [
      'data: {"type":"start","messageId":"m1"}',
      'data: {"type":"text-start","id":"text-1"}',
      'data: {"type":"text-delta","id":"text-1","delta":"A tense muscle needs support."}',
      'data: {"type":"text-end","id":"text-1"}',
      'data: {"type":"finish"}',
    ].join("\n\n") + "\n\n";
    const output = await transformSse(input);
    const parsed = parseJsonEventStream({
      stream: new Response(output).body!,
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
    const text = (last?.parts ?? [])
      .filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join("");
    expect(text).toContain("a warm compress or a warm bath");
  });

  it("keeps tool-step frames after the completed text part", async () => {
    const input = [
      'data: {"type":"text-start","id":"text-1"}',
      'data: {"type":"text-delta","id":"text-1","delta":"Before tool."}',
      'data: {"type":"text-end","id":"text-1"}',
      'data: {"type":"start-step"}',
      'data: {"type":"text-start","id":"text-2"}',
      'data: {"type":"text-delta","id":"text-2","delta":"After tool."}',
      'data: {"type":"text-end","id":"text-2"}',
      'data: {"type":"finish-step"}',
      'data: {"type":"finish"}',
    ].join("\n\n") + "\n\n";
    const output = await transformSse(input);
    const events = output
      .split("\n\n")
      .filter(Boolean)
      .map((event) => JSON.parse(event.slice(6)) as { type: string });

    expect(events.map((event) => event.type)).toEqual([
      "text-start",
      "text-delta",
      "text-end",
      "start-step",
      "text-start",
      "text-delta",
      "text-end",
      "finish-step",
      "finish",
    ]);
  });
});

describe("sanitizeArabicLeaks — Arabic-mode lexical repair", () => {
  it("repairs observed live code-switches into the Arabic glossary", () => {
    expect(sanitizeArabicLeaks("مزاجكِ logged كـ «متوتر»")).toBe(
      "مزاجكِ سُجِّل كـ «متوتر»"
    );
    expect(sanitizeArabicLeaks("لديكِ streak قوي هذا الشهر")).toBe(
      "لديكِ سلسلة التسجيل قوي هذا الشهر"
    );
    expect(sanitizeArabicLeaks("جرّبي وضع /zen للاسترخاء")).toBe(
      "جرّبي وضع صفحة التهدئة وتمارين التنفس للاسترخاء"
    );
    // Brief's exact examples: Spanish, French, raw English UI terms.
    expect(sanitizeArabicLeaks("الألم aumento هذا الأسبوع")).toBe(
      "الألم ارتفاع هذا الأسبوع"
    );
    expect(sanitizeArabicLeaks("النوم souvent متقطع")).toBe(
      "النوم غالبًا متقطع"
    );
    expect(sanitizeArabicLeaks("الضغط élevé صباحًا")).toBe(
      "الضغط مرتفع صباحًا"
    );
    expect(sanitizeArabicLeaks("mood و trend مستقران")).toBe(
      "المزاج و الاتجاه مستقران"
    );
  });

  it("never matches inside a longer Latin word (boundary safety)", () => {
    expect(sanitizeArabicLeaks("the logger utility")).toBe(
      "the logger utility"
    );
    expect(sanitizeArabicLeaks("feeling moody today")).toBe(
      "feeling moody today"
    );
  });

  it("prefers longest entries so phrases are replaced whole", () => {
    expect(sanitizeArabicLeaks("symptoms كثيرة هذا الأسبوع")).toBe(
      "أعراض كثيرة هذا الأسبوع"
    );
    expect(sanitizeArabicLeaks("logging streak قوي")).toBe(
      "سلسلة التسجيل اليومي قوي"
    );
  });

  it("leaves English-only text alone in EN mode (default guardrail)", () => {
    const g = new IncrementalGuardrail();
    let out = g.push("mood logged streak trend");
    out += g.flush();
    // Warm-therapy append fires only for tension talk; this has none.
    expect(out).toBe("mood logged streak trend");
  });

  it("streams Arabic repairs across chunk edges with the leak table on", () => {
    const prefix = "سجلتِ خمسة أيام متتالية هذا الأسبوع ومزاجكِ ";
    const full = prefix + "logged بشكل جيد";
    const g = new IncrementalGuardrail({ arabicLeaks: true });
    let out = "";
    out += g.push(full.slice(0, prefix.length + 2)); // cut inside "lo…"
    out += g.push(full.slice(prefix.length + 2));
    out += g.flush();
    expect(out).toContain("سُجِّل");
    expect(out).not.toContain("logged");
    expect(out.startsWith(prefix)).toBe(true);
  });

  it("keeps the warm-therapy rule active alongside leak repair", () => {
    const g = new IncrementalGuardrail({ arabicLeaks: true });
    let out = g.push("لاحظت توتر العضلات اليوم بشكل واضح");
    out += g.flush();
    expect(out).toContain("الكمادات الدافئة أو الحمام الدافئ"); // AR append
  });

  it("strips scripts that can never be legitimate in this app", () => {
    // Russian / Korean / Hebrew / CJK runs vanish (brief flags Hebrew ע).
    expect(stripForeignScripts("الشهر حول مستقر")).toBe(
      "الشهر حول مستقر"
    );
    const korean = stripForeignScripts("또한 الأعراض خفيفة");
    expect(korean).not.toContain("또한");
    expect(korean).toContain("الأعراض خفيفة");
    const russian = stripForeignScripts("الشهر حول مستقر".replace("حول", "вокруг"));
    expect(russian).toBe("الشهر مستقر");
    expect(stripForeignScripts("حروف ע غريبة")).not.toContain("ע");
    // Latin survives: medication names must never be deleted.
    expect(stripForeignScripts("تناول Lyrica قبل النوم 10mg")).toBe(
      "تناول Lyrica قبل النوم 10mg"
    );
  });
});
