import { describe, expect, it } from "vitest";
import { bdiTokens, splitBdi } from "./text";

describe("splitBdi — percentages and number ranges", () => {
  it("wraps a simple percentage as one token", () => {
    expect(bdiTokens("Affects 2-4% of the population")).toEqual(["2-4%"]);
  });

  it("wraps a trailing percentage without dropping the % sign", () => {
    // Regression: the old tokenizer backtracked off the trailing % (a \b
    // after "%" fails), leaving the percent sign outside the <bdi>.
    expect(bdiTokens("Symptoms present for 10% of days")).toEqual(["10%"]);
    expect(bdiTokens("Humidity is at 70%")).toEqual(["70%"]);
  });

  it("wraps a hyphenated range as one token", () => {
    expect(bdiTokens("Hold each stretch for 15-30 seconds")).toEqual([
      "15-30",
    ]);
    expect(bdiTokens("Add 1-2 minutes per week")).toEqual(["1-2"]);
  });

  it("wraps standalone numbers in a list", () => {
    expect(bdiTokens("Pain in at least 7 of 19 areas")).toEqual(["7", "19"]);
  });

  it("wraps numbers embedded in sentences", () => {
    expect(bdiTokens("Symptoms last 3 months or more")).toEqual(["3"]);
    expect(bdiTokens("Aim for 8-10 glasses of water daily")).toEqual([
      "8-10",
    ]);
  });

  it("wraps decimal numbers", () => {
    expect(bdiTokens("Score 2.5 out of 5")).toEqual(["2.5", "5"]);
  });

  it("wraps a range with a percent sign on the second number", () => {
    expect(bdiTokens("Loss of 5-10% is normal")).toEqual(["5-10%"]);
  });
});

describe("splitBdi — medical acronyms", () => {
  it("wraps the ACR diagnostic acronyms", () => {
    expect(bdiTokens("WPI and SSS scoring")).toEqual(["WPI", "SSS"]);
  });

  it("wraps blood-test acronyms", () => {
    expect(bdiTokens("CBC, ESR, and thyroid tests")).toEqual(["CBC", "ESR"]);
  });

  it("wraps acronyms inside parentheses and after colons", () => {
    expect(bdiTokens("Complete Blood Count (CBC): checks anemia")).toEqual([
      "CBC",
    ]);
  });

  it("wraps guideline and therapy acronyms", () => {
    expect(bdiTokens("Per ACR and NHS guidance")).toEqual(["ACR", "NHS"]);
    expect(bdiTokens("Cognitive Behavioral Therapy (CBT)")).toEqual(["CBT"]);
    expect(bdiTokens("IBS and PTSD commonly co-occur")).toEqual([
      "IBS",
      "PTSD",
    ]);
  });

  it("wraps plural acronyms", () => {
    expect(bdiTokens("Acetaminophen or NSAIDs")).toEqual(["NSAIDs"]);
  });
});

describe("splitBdi — mixed and edge cases", () => {
  it("wraps Latin digits inside Arabic sentences", () => {
    expect(bdiTokens("يؤثر على 2-4% من السكان")).toEqual(["2-4%"]);
    expect(bdiTokens("ألم في 7 من 19 منطقة")).toEqual(["7", "19"]);
    expect(bdiTokens("فحص CBC يتحقق من فقر الدم")).toEqual(["CBC"]);
  });

  it("does not wrap pure Arabic text", () => {
    const text = "التهاب العضلات الليفية حالة مزمنة";
    expect(splitBdi(text).every((s) => !s.bdi)).toBe(true);
    expect(bdiTokens(text)).toEqual([]);
  });

  it("does not wrap plain English words", () => {
    const text = "Fibromyalgia is a chronic condition";
    expect(splitBdi(text).every((s) => !s.bdi)).toBe(true);
  });

  it("keeps plain text around wrapped tokens intact", () => {
    const segments = splitBdi("Pain in 7 of 19 areas.");
    expect(segments.map((s) => s.text).join("")).toBe("Pain in 7 of 19 areas.");
    expect(segments.filter((s) => s.bdi).map((s) => s.text)).toEqual([
      "7",
      "19",
    ]);
  });

  it("returns a single non-bdi segment for empty or token-free input", () => {
    expect(splitBdi("")).toEqual([]);
    expect(splitBdi("no tokens here")).toEqual([
      { text: "no tokens here", bdi: false },
    ]);
  });

  it("concatenates back to the original string for any input", () => {
    const samples = [
      "2-4% of the population",
      "WPI and SSS, plus CBC and ESR",
      "يؤثر على 2-4% من السكان وفقًا لـ ACR",
      "Hold 15-30 seconds, repeat 2-3 times",
      "Humidity 70%, pressure dropping",
      "",
      "plain words only",
    ];
    for (const sample of samples) {
      expect(splitBdi(sample).map((s) => s.text).join("")).toBe(sample);
    }
  });
});
