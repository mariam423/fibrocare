import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { HealthLog } from "@/lib/types";
import type { Insight } from "@/lib/insightEngine";

export interface ReportData {
  userName: string;
  avgPain: number;
  flareUpDays: number;
  topSymptoms: string[];
  insights: Insight[];
  logs: HealthLog[];
}

const PERIOD_DAYS = 90;

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
  h: number
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
    doc.text("Not enough data to plot.", plotX + plotW / 2, plotY + plotH / 2, {
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

export async function generateMedicalReport(data: ReportData): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;

  // ---------- Header band ----------
  doc.setFillColor(88, 28, 135);
  doc.rect(0, 0, pageW, 96, "F");
  doc.setTextColor(255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("FibroCare", margin, 46);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Medical Health Summary", margin, 64);
  doc.setFontSize(8);
  doc.setTextColor(230);
  doc.text("Generated for review with your care team", margin, 78);

  const periodEnd = new Date();
  const periodStart = new Date(periodEnd);
  periodStart.setDate(periodStart.getDate() - PERIOD_DAYS);

  let y = 118;
  doc.setTextColor(60);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Patient", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.userName, margin + 60, y);
  doc.setFont("helvetica", "bold");
  doc.text("Report date", pageW - margin - 160, y);
  doc.setFont("helvetica", "normal");
  doc.text(
    new Date().toLocaleDateString(),
    pageW - margin - 100,
    y
  );
  y += 18;
  doc.setFont("helvetica", "bold");
  doc.text("Reporting period", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${periodStart.toLocaleDateString()}  –  ${periodEnd.toLocaleDateString()}`,
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
  doc.setFont("helvetica", "bold");
  doc.text("1. Executive Summary", margin, y);
  y += 18;

  const summaryRows: [string, string][] = [
    ["Average pain (90 days)", `${data.avgPain.toFixed(1)} / 10`],
    ["Flare-up days (pain ≥ 7)", String(data.flareUpDays)],
    ["Primary symptoms", data.topSymptoms.join(", ") || "None recorded"],
    ["Entries in period", String(data.logs.length)],
  ];

  doc.setFontSize(10);
  summaryRows.forEach(([label, value]) => {
    doc.setTextColor(90);
    doc.setFont("helvetica", "normal");
    doc.text(label, margin + 12, y);
    doc.setTextColor(30);
    doc.setFont("helvetica", "bold");
    doc.text(value, margin + 200, y);
    y += 15;
  });

  y += 8;

  // ---------- Pain trend chart ----------
  doc.setTextColor(40);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("2. Pain Trend (last 30 days)", margin, y);
  y += 14;
  const chartH = 150;
  drawTrendChart(doc, buildDailySeries(data.logs), margin + 20, y, contentW - 40, chartH);
  y += chartH + 30;

  // ---------- Correlation summary ----------
  const correlation = data.insights.find((i) => i.type === "correlation");
  if (y + 70 > pageH - 80) {
    doc.addPage();
    y = 60;
  }
  doc.setTextColor(40);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("3. Correlation Summary", margin, y);
  y += 18;
  doc.setTextColor(70);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (correlation) {
    const wrapped = doc.splitTextToSize(
      `The strongest relationship found in your logs: ${correlation.message}`,
      contentW
    );
    doc.text(wrapped, margin + 12, y);
    y += wrapped.length * 12;
  } else {
    doc.text(
      "No statistically meaningful symptom–pain relationships were detected with the current data. Continue logging symptoms for sharper correlations.",
      margin + 12,
      y
    );
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
  doc.setFont("helvetica", "bold");
  doc.text("4. Key Health Insights", margin, y);
  y += 16;

  const severityColor: Record<Insight["severity"], [number, number, number]> = {
    critical: [220, 38, 38],
    warning: [217, 119, 6],
    info: [22, 163, 74],
  };

  if (data.insights.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      "Log your pain and symptoms for at least 5 days to unlock personalized insights.",
      margin + 12,
      y
    );
    y += 30;
  } else {
    data.insights.forEach((insight) => {
      const lines = doc.splitTextToSize(insight.message, contentW - 90) as string[];
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
      doc.setFont("helvetica", "bold");
      doc.text(SEVERITY_LABEL[insight.severity], margin + 8, y + 14);
      doc.setTextColor(50);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(insight.title, margin + 66, y + 14);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(70);
      doc.setFontSize(9);
      doc.text(lines, margin + 66, y + 28);
      y += blockH + 12;
    });
  }

  // ---------- Annex: full log history ----------
  doc.addPage();
  doc.setFillColor(88, 28, 135);
  doc.rect(0, 0, pageW, 56, "F");
  doc.setTextColor(255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Annex A — Full Log History", margin, 34);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Raw entries for ${data.logs.length} logs within the reporting period.`,
    margin,
    46
  );

  autoTable(doc, {
    startY: 72,
    margin: { left: margin, right: margin },
    head: [["Date", "Pain", "Mood", "Symptoms / Notes"]],
    body: data.logs.map((log) => [
      new Date(log.loggedAt).toLocaleDateString(),
      `${log.painLevel}/10`,
      log.moodTag,
      log.notes || "",
    ]),
    theme: "grid",
    headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [246, 244, 252] },
    styles: { fontSize: 8, cellPadding: 4 },
    didDrawPage: () => {
      doc.setFontSize(7);
      doc.setTextColor(140);
      doc.text(
        "Generated by FibroCare · For informational purposes, not a medical diagnosis.",
        margin,
        pageH - 20
      );
    },
  });

  return doc.output("blob");
}
