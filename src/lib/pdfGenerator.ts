import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { HealthLog } from "@/lib/types";
import type { Insight } from "@/lib/insightEngine";
import type { ClinicalBrief } from "@/lib/ai/clinical-brief/types";
import type { Locale, TranslationKey } from "@/lib/translations";
import type {
  DiagnosticCheckQuestionId,
  DiagnosticVerdict,
} from "@/lib/resources/diagnosticCheck";
import { translations } from "@/lib/translations";
import { localizeInsight, localizeSymptom } from "@/lib/insightLocalization";
import {
  buildLocalizedDiscussionPoints,
  flareDaysKey,
  localizeBriefHeadline,
  trendKeyByValue,
  velocityKeyByValue,
} from "@/lib/ai/clinical-brief/localize";

export interface ReportData {
  userName: string;
  avgPain: number;
  flareUpDays: number;
  topSymptoms: string[];
  insights: Insight[];
  logs: HealthLog[];
  /** Optional 30-day AI clinical executive brief (deterministic analytics). */
  brief?: ClinicalBrief;
}

const PERIOD_DAYS = 90;

export interface PdfExportOptions {
  /**
   * Base path for the self-hosted Amiri fonts (default "/fonts"). The PWA
   * precache serves these offline; tests override to force a fresh fetch.
   */
  fontsBaseUrl?: string;
}

const DEFAULT_FONTS_BASE_URL = "/fonts";

/** Base64 cache so repeated exports never refetch/re-encode the fonts. */
const fontCache = new Map<string, string>();

async function toBase64(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function loadFontBase64(url: string): Promise<string> {
  const cached = fontCache.get(url);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load PDF font ${url} (${res.status})`);
  }
  const base64 = await toBase64(await res.arrayBuffer());
  fontCache.set(url, base64);
  return base64;
}

/** Embed Amiri (regular + bold) so Arabic text shapes and renders in the PDF. */
async function installArabicFonts(
  doc: jsPDF,
  fontsBaseUrl: string
): Promise<void> {
  const [regular, bold] = await Promise.all([
    loadFontBase64(`${fontsBaseUrl}/Amiri-Regular.ttf`),
    loadFontBase64(`${fontsBaseUrl}/Amiri-Bold.ttf`),
  ]);
  doc.addFileToVFS("Amiri-Regular.ttf", regular);
  doc.addFileToVFS("Amiri-Bold.ttf", bold);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  doc.addFont("Amiri-Bold.ttf", "Amiri", "bold");
}

function makeT(locale: Locale) {
  const dict = translations[locale];
  return (
    key: TranslationKey,
    params?: Record<string, string | number>
  ): string => {
    let text = dict[key] ?? translations.en[key] ?? key;
    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.replaceAll(`{${name}}`, String(value));
      }
    }
    return text;
  };
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

const SEVERITY_LABEL: Record<Insight["severity"], string> = {
  critical: "CRITICAL",
  warning: "WATCH",
  info: "NOTE",
};

/** Aggregate logs into per-day average pain series (oldest → newest). */
function buildDailySeries(logs: HealthLog[]) {
  const acc = new Map<string, { sum: number; count: number }>();
  for (const log of logs) {
    const key = toDateKey(new Date(log.loggedAt));
    const entry = acc.get(key) ?? { sum: 0, count: 0 };
    entry.sum += log.painLevel;
    entry.count += 1;
    acc.set(key, entry);
  }
  return [...acc.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, v]) => ({ date, value: v.sum / v.count }));
}

function drawTrendChart(
  doc: jsPDF,
  series: { date: string; value: number }[],
  x: number,
  y: number,
  w: number,
  h: number,
  noDataLabel: string
) {
  const maxLevel = 10;
  const padLeft = 16;
  const padBottom = 14;
  const plotW = w - padLeft;
  const plotH = h - padBottom;
  const plotX = x + padLeft;
  const plotY = y;

  // Chart frame
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  doc.rect(plotX, plotY, plotW, plotH);

  // Y-axis gridlines + labels
  doc.setFontSize(7);
  for (let level = 0; level <= maxLevel; level += 2) {
    const gy = plotY + plotH - (level / maxLevel) * plotH;
    doc.setDrawColor(230);
    doc.setLineWidth(0.15);
    doc.line(plotX, gy, plotX + plotW, gy);
    doc.setTextColor(120);
    doc.text(String(level), plotX - 3, gy + 1.5, { align: "right" });
  }

  if (series.length < 2) {
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(noDataLabel, plotX + plotW / 2, plotY + plotH / 2, {
      align: "center",
    });
    return;
  }

  const px = (i: number) => plotX + (i / (series.length - 1)) * plotW;
  const py = (value: number) =>
    plotY + plotH - (Math.min(maxLevel, Math.max(0, value)) / maxLevel) * plotH;

  const pts = series.map((s, i) => ({ x: px(i), y: py(s.value) }));

  // Area fill (bottom-left → across curve → bottom-right → close)
  const bottomLeft = { x: plotX, y: plotY + plotH };
  const bottomRight = { x: plotX + plotW, y: plotY + plotH };
  let cur = bottomLeft;
  const seg: [number, number][] = [];
  const segTo = (tx: number, ty: number) => {
    seg.push([tx - cur.x, ty - cur.y]);
    cur = { x: tx, y: ty };
  };
  segTo(pts[0].x, pts[0].y);
  pts.slice(1).forEach((p) => segTo(p.x, p.y));
  segTo(bottomRight.x, bottomRight.y);
  segTo(bottomLeft.x, bottomLeft.y);

  doc.setFillColor(233, 225, 251);
  doc.setDrawColor(233, 225, 251);
  doc.lines(seg, bottomLeft.x, bottomLeft.y, [1, 1], "F");

  // Line stroke
  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(1.2);
  doc.lines(
    pts
      .map((p, i) => (i === 0 ? [0, 0] : [p.x - pts[i - 1].x, p.y - pts[i - 1].y]))
      .slice(1),
    pts[0].x,
    pts[0].y,
    [1, 1],
    "S"
  );

  // Data points + x labels
  const labelIndexes = [0, Math.floor(series.length / 2), series.length - 1];
  doc.setFillColor(124, 58, 237);
  labelIndexes.forEach((i) => {
    doc.circle(pts[i].x, pts[i].y, 0.8, "F");
  });
  doc.setFontSize(7);
  doc.setTextColor(120);
  labelIndexes.forEach((i) => {
    const [, mm, dd] = series[i].date.split("-");
    doc.text(`${mm}/${dd}`, pts[i].x - 4, plotY + plotH + 6);
  });
}

/**
 * Generate the clinical summary PDF.
 *
 * `locale === "ar"` renders a fully Arabic, right-to-left document: an
 * embedded Amiri font provides the glyphs, jsPDF shapes/joins the Arabic
 * letters and reorders bidi runs, and every label/value pair is mirrored.
 * The English path is untouched (helvetica, LTR, identical strings).
 */
export async function generateMedicalReport(
  data: ReportData,
  locale: Locale = "en",
  options: PdfExportOptions = {}
): Promise<Blob> {
  const rtl = locale === "ar";
  const t = makeT(locale);
  const fontsBaseUrl = options.fontsBaseUrl ?? DEFAULT_FONTS_BASE_URL;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;

  if (rtl) {
    await installArabicFonts(doc, fontsBaseUrl);
    doc.setLanguage("ar");
    doc.viewerPreferences({ Direction: "R2L" });
  }

  const FONT = rtl ? "Amiri" : "helvetica";

  /**
   * Draw a section heading. In RTL the leading number ("1. العنوان") is
   * drawn as its own right-aligned run at the page edge so it sits on the
   * right (where an RTL reader expects it) while the Arabic title flows to
   * its left with embedded numbers intact.
   */
  const drawHeading = (text: string) => {
    if (!rtl) {
      drawText(text, margin, y);
      return;
    }
    const m = text.match(/^(\d+)\.\s*([\s\S]*)$/);
    if (!m) {
      drawText(text, margin, y);
      return;
    }
    const numWidth = doc.getStringUnitWidth(`${m[1]}.`) * doc.getFontSize() + 12;
    doc.text(m[2], pageW - margin - numWidth, y, { align: "right" });
    doc.text(`${m[1]}.`, pageW - margin, y, { align: "right" });
  };

  /**
   * Draw text at the LTR position `enX` and mirror it horizontally for RTL.
   * jsPDF's bidi engine shapes and reorders each string contextually, so
   * Arabic lines flow right-to-left while embedded numbers stay intact.
   */
  const drawText = (
    text: string | string[],
    enX: number,
    y: number,
    enAlign: "left" | "right" | "center" = "left"
  ) => {
    if (enAlign === "center") {
      doc.text(text, enX, y, { align: "center" });
    } else if (rtl) {
      doc.text(text, pageW - enX, y, {
        align: enAlign === "left" ? "right" : "left",
      });
    } else if (enAlign === "right") {
      doc.text(text, enX, y, { align: "right" });
    } else {
      doc.text(text, enX, y);
    }
  };



  // ---------- Header band ----------
  doc.setFillColor(88, 28, 135);
  doc.rect(0, 0, pageW, 96, "F");
  doc.setTextColor(255);
  doc.setFontSize(22);
  doc.setFont(FONT, "bold");
  drawText("FibroCare", margin, 46);
  doc.setFontSize(11);
  doc.setFont(FONT, "normal");
  drawText(t("pdf.title"), margin, 64);
  doc.setFontSize(8);
  doc.setTextColor(230);
  drawText(t("pdf.subtitle"), margin, 78);

  const periodEnd = new Date();
  const periodStart = new Date(periodEnd);
  periodStart.setDate(periodStart.getDate() - PERIOD_DAYS);
  const fmtDate = (d: Date) => d.toLocaleDateString(rtl ? "ar" : undefined);

  let y = 118;
  doc.setTextColor(60);
  doc.setFontSize(10);
  doc.setFont(FONT, "bold");
  drawText(t("pdf.patient"), margin, y);
  doc.setFont(FONT, "normal");
  drawText(data.userName, margin + 60, y);
  doc.setFont(FONT, "bold");
  drawText(t("pdf.reportDate"), pageW - margin - 160, y);
  doc.setFont(FONT, "normal");
  drawText(fmtDate(new Date()), pageW - margin - 100, y);
  y += 18;
  doc.setFont(FONT, "bold");
  drawText(t("pdf.reportingPeriod"), margin, y);
  doc.setFont(FONT, "normal");
  drawText(
    t("pdf.periodRange", { start: fmtDate(periodStart), end: fmtDate(periodEnd) }),
    margin + 60,
    y
  );
  y += 20;

  // ---------- Executive summary ----------
  doc.setDrawColor(200);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 22;
  doc.setTextColor(40);
  doc.setFontSize(14);
  doc.setFont(FONT, "bold");
  drawHeading(t("pdf.executiveSummary"));
  y += 18;

  const summaryRows: [string, string][] = [
    [t("pdf.avgPain"), `${data.avgPain.toFixed(1)} / 10`],
    [t("pdf.flareDays"), String(data.flareUpDays)],
    [
      t("pdf.primarySymptoms"),
      rtl
        ? data.topSymptoms
            .map((symptom) => localizeSymptom(symptom, t))
            .join("، ")
        : data.topSymptoms.join(", ") || "None recorded",
    ],
    [t("pdf.entries"), String(data.logs.length)],
  ];

  doc.setFontSize(10);
  summaryRows.forEach(([label, value]) => {
    doc.setTextColor(90);
    doc.setFont(FONT, "normal");
    drawText(label, margin + 12, y);
    doc.setTextColor(30);
    doc.setFont(FONT, "bold");
    drawText(value, margin + 200, y);
    y += 15;
  });

  y += 8;

  // ---------- AI Clinical Executive Brief (optional) ----------
  if (data.brief) {
    const brief = data.brief;
    doc.setTextColor(40);
    doc.setFontSize(12);
    doc.setFont(FONT, "bold");
    drawText(t("pdf.briefTitle"), margin, y);
    y += 15;

    doc.setFontSize(9);
    doc.setTextColor(70);
    doc.setFont(FONT, "normal");
    // English keeps the raw engine headline byte-identical; Arabic renders
    // the localized template through the shared brief localization helper.
    // "Δ" has no glyph in Amiri, so it is dropped from the PDF delta.
    const headline = rtl
      ? localizeBriefHeadline(brief, locale, t).replaceAll("Δ", "")
      : brief.headline;
    const briefLines = doc.splitTextToSize(headline, contentW) as string[];
    drawText(briefLines, margin, y);
    y += briefLines.length * 11 + 4;

    const flare = brief.flareFrequency;
    const pain = brief.painProfile;
    const velocityDelta = pain.velocityDelta;
    // "Δ" has no glyph in Amiri, so the Arabic PDF shows the signed delta
    // alone; English keeps the Δ symbol byte-identical to before.
    const deltaPart =
      velocityDelta !== null
        ? rtl
          ? ` (${velocityDelta > 0 ? "+" : ""}${velocityDelta})`
          : ` (Δ ${velocityDelta > 0 ? "+" : ""}${velocityDelta})`
        : "";
    const medsValue =
      brief.patientReportedMedications.length > 0
        ? brief.patientReportedMedications.join(", ")
        : rtl
          ? t("pdf.noMedsMentioned")
          : "None mentioned in logs";

    const briefRows: [string, string][] = [
      [
        t("reports.brief.flareFrequency"),
        rtl
          ? `${t(flareDaysKey(flare.flareDays), { count: flare.flareDays })} · ${t(
              "reports.brief.ratePerMonth",
              { perMonth: flare.perMonth }
            )} · ${t(trendKeyByValue[flare.trend])}`
          : `${flare.flareDays} flare day(s) · ~${flare.perMonth}/month · trend: ${flare.trend}`,
      ],
      [
        t("reports.brief.velocity"),
        rtl
          ? `${t(velocityKeyByValue[pain.velocity])}${deltaPart} · ${t("pdf.avg7d")} ${
              pain.average7d ?? t("pdf.na")
            } / 10`
          : `${pain.velocity}${deltaPart} · 7-day mean ${pain.average7d ?? "n/a"} / 10`,
      ],
      [
        t("reports.brief.functional"),
        rtl
          ? `${brief.functionalCapacity.loggingAdherencePct}% ${t(
              "reports.brief.adherence"
            )} · ${t("reports.brief.streakDays", {
              count: brief.functionalCapacity.loggingStreakDays,
            })}`
          : `${brief.functionalCapacity.loggingAdherencePct}% logging adherence · ${brief.functionalCapacity.loggingStreakDays}-day streak`,
      ],
      [t("reports.brief.medications"), medsValue],
    ];
    if (brief.topTriggers.length > 0) {
      briefRows.push([
        t("reports.brief.detectedTriggers"),
        brief.topTriggers.map((tr) => `${tr.factor} (${tr.evidence})`).join("; "),
      ]);
    }
    briefRows.push([
      t("reports.brief.discussion"),
      rtl
        ? buildLocalizedDiscussionPoints(brief, t)
            .map((p, i) => `${i + 1}. ${p}`)
            .join("  ")
        : brief.suggestedDiscussionPoints.map((p, i) => `${i + 1}. ${p}`).join("  "),
    ]);

    // RTL mirrors the two columns: the bold label becomes the rightmost column.
    autoTable(doc, {
      startY: y,
      head: [],
      body: rtl ? briefRows.map(([label, value]) => [value, label]) : briefRows,
      theme: "plain",
      styles: {
        font: FONT,
        fontSize: 8.5,
        cellPadding: 3,
        textColor: 60,
        ...(rtl ? { halign: "right" as const } : {}),
      },
      columnStyles: rtl
        ? {
            0: { cellWidth: contentW - 130 },
            1: { cellWidth: 130, fontStyle: "bold", textColor: 90 },
          }
        : {
            0: { cellWidth: 130, fontStyle: "bold", textColor: 90 },
            1: { cellWidth: contentW - 130 },
          },
      margin: { left: margin, right: margin },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    doc.setFontSize(7.5);
    doc.setTextColor(130);
    const caveat = rtl
      ? t("reports.brief.caveat", {
          logged: Math.round(
            (brief.functionalCapacity.loggingAdherencePct * brief.periodDays) / 100
          ),
          total: brief.periodDays,
          adherence: brief.functionalCapacity.loggingAdherencePct,
        })
      : brief.dataCaveat;
    const caveatLines = doc.splitTextToSize(caveat, contentW) as string[];
    drawText(caveatLines, margin, y);
    y += caveatLines.length * 9 + 10;
  }

  // ---------- Pain trend chart ----------
  doc.setTextColor(40);
  doc.setFontSize(14);
  doc.setFont(FONT, "bold");
  drawHeading(t("pdf.chartTitle"));
  y += 14;
  const chartH = 150;
  drawTrendChart(
    doc,
    buildDailySeries(data.logs),
    margin + 20,
    y,
    contentW - 40,
    chartH,
    t("pdf.notEnoughData")
  );
  y += chartH + 30;

  // ---------- Correlation summary ----------
  const correlation = data.insights.find((i) => i.type === "correlation");
  if (y + 70 > pageH - 80) {
    doc.addPage();
    y = 60;
  }
  doc.setTextColor(40);
  doc.setFontSize(14);
  doc.setFont(FONT, "bold");
  drawHeading(t("pdf.correlationTitle"));
  y += 18;
  doc.setTextColor(70);
  doc.setFontSize(10);
  doc.setFont(FONT, "normal");
  if (correlation) {
    const localized = rtl ? localizeInsight(correlation, locale, t) : null;
    const wrapped = doc.splitTextToSize(
      rtl
        ? t("pdf.correlationText", { message: localized!.message })
        : `The strongest relationship found in your logs: ${correlation.message}`,
      contentW
    );
    drawText(wrapped, margin + 12, y);
    y += wrapped.length * 12;
  } else {
    drawText(t("pdf.noCorrelation"), margin + 12, y);
    y += 30;
  }

  // ---------- Key insights ----------
  if (y + 40 > pageH - 120) {
    doc.addPage();
    y = 60;
  }
  y += 12;
  doc.setTextColor(40);
  doc.setFontSize(14);
  doc.setFont(FONT, "bold");
  drawHeading(t("pdf.insightsTitle"));
  y += 16;

  const severityColor: Record<Insight["severity"], [number, number, number]> = {
    critical: [220, 38, 38],
    warning: [217, 119, 6],
    info: [22, 163, 74],
  };

  if (data.insights.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(120);
    drawText(t("pdf.insightsEmpty"), margin + 12, y);
    y += 30;
  } else {
    data.insights.forEach((insight) => {
      const localized = rtl ? localizeInsight(insight, locale, t) : null;
      const message = localized ? localized.message : insight.message;
      const title = localized ? localized.title : insight.title;
      const lines = doc.splitTextToSize(message, contentW - 90) as string[];
      const blockH = lines.length * 12 + 14;
      if (y + blockH > pageH - 50) {
        doc.addPage();
        y = 60;
      }
      const [r, g, b] = severityColor[insight.severity];
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(1);
      doc.rect(margin, y, contentW, blockH, "S");
      doc.setTextColor(r, g, b);
      doc.setFontSize(8);
      doc.setFont(FONT, "bold");
      drawText(
        rtl ? t(`reports.severity.${insight.severity}` as TranslationKey) : SEVERITY_LABEL[insight.severity],
        margin + 8,
        y + 14
      );
      doc.setTextColor(50);
      doc.setFontSize(10);
      doc.setFont(FONT, "bold");
      drawText(title, margin + 66, y + 14);
      doc.setFont(FONT, "normal");
      doc.setTextColor(70);
      doc.setFontSize(9);
      drawText(lines, margin + 66, y + 28);
      y += blockH + 12;
    });
  }

  // ---------- Annex: full log history ----------
  doc.addPage();
  doc.setFillColor(88, 28, 135);
  doc.rect(0, 0, pageW, 56, "F");
  doc.setTextColor(255);
  doc.setFontSize(14);
  doc.setFont(FONT, "bold");
  drawText(t("pdf.annexTitle"), margin, 34);
  doc.setFontSize(8);
  doc.setFont(FONT, "normal");
  drawText(t("pdf.annexSubtitle", { count: data.logs.length }), margin, 46);

  // RTL mirrors the table: the date column moves to the right edge.
  const annexHead = rtl
    ? [t("pdf.colSymptoms"), t("pdf.colMood"), t("pdf.colPain"), t("pdf.colDate")]
    : ["Date", "Pain", "Mood", "Symptoms / Notes"];
  const annexBody = data.logs.map((log) => {
    const row = [
      fmtDate(new Date(log.loggedAt)),
      `${log.painLevel}/10`,
      log.moodTag,
      log.notes || "",
    ];
    return rtl ? [...row].reverse() : row;
  });

  autoTable(doc, {
    startY: 72,
    margin: { left: margin, right: margin },
    head: [annexHead],
    body: annexBody,
    theme: "grid",
    headStyles: { font: FONT, fillColor: [124, 58, 237], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [246, 244, 252] },
    styles: { font: FONT, fontSize: 8, cellPadding: 4, ...(rtl ? { halign: "right" as const } : {}) },
    didDrawPage: () => {
      doc.setFontSize(7);
      doc.setTextColor(140);
      if (rtl) {
        doc.text(t("pdf.footer"), pageW - margin, pageH - 20, {
          align: "right",
        });
      } else {
        doc.text(
          "Generated by FibroCare · For informational purposes, not a medical diagnosis.",
          margin,
          pageH - 20
        );
      }
    },
  });

  return doc.output("blob");
}

/* ------------------------------------------------------------------ */
/* AI Diagnostic Readiness Checker — exportable doctor-visit PDF       */
/* ------------------------------------------------------------------ */

export interface DiagnosticCheckPdfData {
  verdict: DiagnosticVerdict;
  metCount: number;
  total: number;
  /** Per-question answers in display order (widespread → exclusion). */
  lines: Array<{ id: DiagnosticCheckQuestionId; met: boolean }>;
}

const CHECK_LINE_KEYS: Record<DiagnosticCheckQuestionId, TranslationKey> = {
  widespread: "diagnosis.check.summary.line1",
  severity: "diagnosis.check.summary.line2",
  duration: "diagnosis.check.summary.line3",
  exclusion: "diagnosis.check.summary.line4",
};

const CHECK_VERDICT_KEYS: Record<DiagnosticVerdict, TranslationKey> = {
  likely: "diagnosis.check.verdict.likely",
  possible: "diagnosis.check.verdict.possible",
  unlikely: "diagnosis.check.verdict.unlikely",
};

const CHECK_VERDICT_COLOR: Record<
  DiagnosticVerdict,
  [number, number, number]
> = {
  likely: [16, 163, 74], // emerald
  possible: [217, 119, 6], // amber
  unlikely: [100, 116, 139], // slate
};

/**
 * Generate a compact, printable one-page summary of the ACR readiness
 * check, intended to be handed to a doctor. `locale === "ar"` renders a
 * fully Arabic, right-to-left document (embedded Amiri, mirrored layout)
 * with the same shaping/bidi guarantees as the main medical report.
 */
export async function generateDiagnosticCheckPdf(
  data: DiagnosticCheckPdfData,
  locale: Locale = "en",
  options: PdfExportOptions = {}
): Promise<Blob> {
  const rtl = locale === "ar";
  const t = makeT(locale);
  const fontsBaseUrl = options.fontsBaseUrl ?? DEFAULT_FONTS_BASE_URL;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;

  if (rtl) {
    await installArabicFonts(doc, fontsBaseUrl);
    doc.setLanguage("ar");
    doc.viewerPreferences({ Direction: "R2L" });
  }

  const FONT = rtl ? "Amiri" : "helvetica";

  const drawText = (
    text: string | string[],
    enX: number,
    y: number,
    enAlign: "left" | "right" | "center" = "left"
  ) => {
    if (enAlign === "center") {
      doc.text(text, enX, y, { align: "center" });
    } else if (rtl) {
      doc.text(text, pageW - enX, y, {
        align: enAlign === "left" ? "right" : "left",
      });
    } else if (enAlign === "right") {
      doc.text(text, enX, y, { align: "right" });
    } else {
      doc.text(text, enX, y);
    }
  };

  // ---------- Header band ----------
  doc.setFillColor(88, 28, 135);
  doc.rect(0, 0, pageW, 92, "F");
  doc.setTextColor(255);
  doc.setFontSize(20);
  doc.setFont(FONT, "bold");
  drawText("FibroCare", margin, 42);
  doc.setFontSize(11);
  doc.setFont(FONT, "normal");
  drawText(t("diagnosis.check.title"), margin, 62);
  doc.setFontSize(8);
  doc.setTextColor(230);
  const subtitleLines = doc.splitTextToSize(
    t("diagnosis.check.subtitle"),
    contentW
  ) as string[];
  drawText(subtitleLines, margin, 78);

  // ---------- Meta line ----------
  let y = 116;
  doc.setTextColor(60);
  doc.setFontSize(9);
  doc.setFont(FONT, "bold");
  drawText(t("pdf.reportDate"), margin, y);
  doc.setFont(FONT, "normal");
  drawText(
    new Date().toLocaleDateString(rtl ? "ar" : undefined),
    margin + 66,
    y
  );
  y += 26;

  // ---------- Verdict banner ----------
  const [vr, vg, vb] = CHECK_VERDICT_COLOR[data.verdict];
  doc.setFillColor(vr, vg, vb);
  doc.roundedRect(margin, y, contentW, 46, 6, 6, "F");
  doc.setTextColor(255);
  doc.setFontSize(11);
  doc.setFont(FONT, "bold");
  const verdictLines = doc.splitTextToSize(
    t(CHECK_VERDICT_KEYS[data.verdict]),
    contentW - 20
  ) as string[];
  drawText(verdictLines, margin + 10, y + 16);
  doc.setFontSize(8);
  doc.setFont(FONT, "normal");
  drawText(
    `${data.metCount}/${data.total} ${t("diagnosis.check.criteriaLabel")}`,
    margin + 10,
    y + 32
  );
  y += 46 + 22;

  // ---------- Exportable summary ----------
  doc.setTextColor(40);
  doc.setFontSize(13);
  doc.setFont(FONT, "bold");
  drawText(t("diagnosis.check.summaryTitle"), margin, y);
  y += 18;

  const yesNo = (met: boolean) =>
    t(met ? "diagnosis.check.yes" : "diagnosis.check.no");

  doc.setFontSize(10);
  data.lines.forEach((line) => {
    // The summary line keys embed an {answer} param ("…: Yes") — substitute
    // it so the exported PDF reads the same as the copyable summary.
    const text = t(CHECK_LINE_KEYS[line.id], { answer: yesNo(line.met) });
    doc.setTextColor(70);
    doc.setFont(FONT, "normal");
    const lineText = doc.splitTextToSize(text, contentW - 60) as string[];
    drawText(lineText, margin, y);
    y += lineText.length * 13 + 8;
  });

  y += 10;

  // ---------- Disclaimer + footer ----------
  const disclaimerLines = doc.splitTextToSize(
    t("diagnosis.check.disclaimer"),
    contentW
  ) as string[];
  if (y + disclaimerLines.length * 10 + 20 > pageH - 40) {
    doc.addPage();
    y = 60;
  }
  doc.setFontSize(8);
  doc.setTextColor(130);
  doc.setFont(FONT, "normal");
  drawText(disclaimerLines, margin, y);
  y += disclaimerLines.length * 10 + 6;

  doc.setFontSize(7);
  doc.setTextColor(150);
  if (rtl) {
    doc.text(t("pdf.footer"), pageW - margin, pageH - 20, {
      align: "right",
    });
  } else {
    doc.text(t("pdf.footer"), margin, pageH - 20);
  }

  return doc.output("blob");
}
