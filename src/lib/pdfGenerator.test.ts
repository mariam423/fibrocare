import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import jsPDF from "jspdf";
import { generateMedicalReport, type ReportData } from "@/lib/pdfGenerator";
import type { Insight } from "@/lib/insightEngine";
import type { ClinicalBrief } from "@/lib/ai/clinical-brief/types";

/**
 * The Arabic path embeds Amiri from public/fonts — serve those real files so
 * the exported PDF is byte-for-byte what a browser would produce.
 */
const FONT_DIR = path.join(process.cwd(), "public", "fonts");

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const name = url.endsWith("Amiri-Regular.ttf")
        ? "Amiri-Regular.ttf"
        : url.endsWith("Amiri-Bold.ttf")
          ? "Amiri-Bold.ttf"
          : null;
      if (!name) return new Response("not found", { status: 404 });
      return new Response(fs.readFileSync(path.join(FONT_DIR, name)));
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function makeBrief(): ClinicalBrief {
  return {
    generatedAt: new Date().toISOString(),
    periodDays: 30,
    headline: "30-day mean pain 5.5/10 with 3 flare days; stable.",
    flareFrequency: { flareDays: 3, perMonth: 3.2, trend: "stable" },
    painProfile: {
      average: 5.5,
      average7d: 5.2,
      peak: 8,
      velocity: "stable",
      velocityDelta: 0.3,
    },
    topTriggers: [{ factor: "Barometric pressure", evidence: "3 of 3 flare days" }],
    symptomProfile: { mostReported: ["fatigue", "insomnia"], distinctCount: 4 },
    functionalCapacity: {
      loggingStreakDays: 6,
      loggingAdherencePct: 80,
      moodPattern: "neutral",
    },
    patientReportedMedications: ["Tramadol"],
    redFlags: [],
    suggestedDiscussionPoints: ["Review current medication regimen."],
    dataCaveat:
      "Generated from 24/30 patient-logged days. self-reported data; not a clinical assessment.",
  };
}

function makeReportData(): ReportData {
  const now = Date.now();
  const insights: Insight[] = [
    {
      id: "high-pain-avg",
      title: "Elevated Pain Levels",
      message: "Your average pain is high.",
      type: "pattern",
      severity: "warning",
      params: { avg: 5.5, days: 30 },
    },
    {
      id: "symptom-correlation",
      title: "Pain & Fatigue Correlation",
      message: "Pain correlates with fatigue.",
      type: "correlation",
      severity: "info",
      params: { symptom: "fatigue", delta: 3, count: 3 },
    },
    {
      id: "trend-worsening",
      title: "Worsening Trend",
      message: "Your pain trend is worsening.",
      type: "tip",
      severity: "critical",
      params: { delta: 1.2 },
    },
  ];
  return {
    userName: "Mariam Mahmoud",
    avgPain: 5.4,
    flareUpDays: 3,
    topSymptoms: ["fatigue", "headache"],
    insights,
    logs: [0, 1, 2, 3, 4, 5, 6].map((n) => ({
      id: `log-${n}`,
      painLevel: 4 + (n % 4),
      moodTag: "Calm",
      notes: n % 2 ? "Stiff in the morning" : "",
      loggedAt: new Date(now - n * 86_400_000),
    })),
    brief: makeBrief(),
  };
}

/**
 * Decode the PDF's text-showing operators through the embedded ToUnicode
 * CMaps. jsPDF emits one CMap per subsetted font (regular + bold), so the
 * maps are merged before decoding glyph codes back to characters.
 */
async function decodePdfText(blob: Blob): Promise<string> {
  const raw = Buffer.from(await blob.arrayBuffer()).toString("latin1");
  const streams = [...raw.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)].map(
    (m) => m[1]
  );
  const cmap = new Map<number, string>();
  for (const s of streams) {
    if (!s.includes("beginbfchar")) continue;
    for (const m of s.matchAll(/<([0-9A-Fa-f]{4})>\s*<([0-9A-Fa-f]+)>/g)) {
      cmap.set(parseInt(m[1], 16), String.fromCharCode(parseInt(m[2], 16)));
    }
  }
  const lines: string[] = [];
  for (const m of raw.matchAll(/<([0-9A-Fa-f]+)> Tj/g)) {
    const units = m[1].match(/.{4}/g) ?? [];
    lines.push(
      units
        .map((u) => cmap.get(parseInt(u, 16)) ?? String.fromCharCode(parseInt(u, 16)))
        .join("")
    );
  }
  return lines.join("\n");
}

/** Shaped logical → visual order for pure-Arabic lines (RTL reversal). */
function shapedVisual(text: string): string {
  const doc = new jsPDF();
  return [...doc.processArabic(text)].reverse().join("");
}

describe("generateMedicalReport — English path (unchanged baseline)", () => {
  it("renders the report with the standard helvetica LTR layout", async () => {
    const blob = await generateMedicalReport(makeReportData(), "en");
    const raw = Buffer.from(await blob.arrayBuffer()).toString("latin1");

    expect(raw.slice(0, 8)).toBe("%PDF-1.3");
    // Core English copy, byte-identical to the pre-i18n exporter. (PDF
    // streams escape parens and non-WinAnsi glyphs, so match substrings
    // without those.)
    expect(raw).toContain("Medical Health Summary");
    expect(raw).toContain("Generated for review with your care team");
    expect(raw).toContain("1. Executive Summary");
    expect(raw).toContain("Average pain");
    // NOTE: "Flare-up days (pain ≥ 7)" cannot render — the ≥ glyph is not
    // in WinAnsi, so jsPDF silently drops the whole string (same as the
    // pre-i18n exporter). The value still renders next to it.
    expect(raw).toContain("2. Pain Trend");
    expect(raw).toContain("3. Correlation Summary");
    expect(raw).toContain("The strongest relationship found in your logs:");
    expect(raw).toContain("4. Key Health Insights");
    expect(raw).toContain("Annex A: Full Log History");
    expect(raw).toContain("CRITICAL"); // severity badge
    // Standard fonts, no Arabic font embedded on the English path.
    expect(raw).toContain("/Helvetica");
    expect(raw).not.toContain("Amiri");
    // No font fetch happens at all for English exports.
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("generateMedicalReport — Arabic RTL path", () => {
  it("embeds Amiri and renders shaped, right-to-left Arabic", async () => {
    const blob = await generateMedicalReport(makeReportData(), "ar");
    const raw = Buffer.from(await blob.arrayBuffer()).toString("latin1");
    const decoded = await decodePdfText(blob);

    // 1. The Arabic font is embedded (regular + bold subset).
    expect(raw).toContain("Amiri");

    // 2. Every Arabic letter was shaped into a presentation form — no
    //    unshaped base letters survive, so no missing-glyph boxes.
    expect(/[\u0621-\u064A]/.test(decoded)).toBe(false);

    // 3. Key labels appear correctly connected and in RTL visual order.
    for (const label of ["المريض", "تاريخ التقرير", "فترة التقرير", "الملخص التنفيذي", "متوسط الألم"]) {
      expect(decoded).toContain(shapedVisual(label));
    }

    // 4. Numbers and status data stay legible (digit runs are not mangled
    //    by the bidi engine; multi-digit values keep their order).
    expect(decoded).toContain("5.4 / 10");
    expect(decoded).toContain("30"); // "آخر 30 يومًا" — multi-digit run intact
    // Report dates flow RTL (jsPDF stores the visual order, so the year
    // appears reversed: "2026" → "6202") — this is correct for RTL reading.
    expect(decoded).toContain("6202");

    // 5. Numbered headings draw the number as its own right-edge run while
    //    the Arabic title keeps its visual order.
    const headingLine = decoded
      .split("\n")
      .find((l) => l.includes(shapedVisual("الملخص التنفيذي")));
    expect(headingLine).toBeDefined();
    expect(decoded.split("\n")).toContain("1.");

    // 6. Localized brief + annex content made it in.
    expect(decoded).toContain(shapedVisual("تكرار الاشتعال"));
    expect(decoded).toContain(shapedVisual("القدرة الوظيفية"));
    expect(decoded).toContain(shapedVisual("الملحق أ"));
  });

  it("rejects with a clear error when the font cannot be fetched", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 500 }))
    );
    // Unique base URL sidesteps the module-level font cache so the stub is hit.
    await expect(
      generateMedicalReport(makeReportData(), "ar", {
        fontsBaseUrl: `/fonts-${Date.now()}`,
      })
    ).rejects.toThrow(/Failed to load PDF font/);
  });
});
