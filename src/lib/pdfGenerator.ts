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

export async function generateMedicalReport(data: ReportData): Promise<Blob> {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text("FibroCare Medical Summary", 14, 22);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Patient: ${data.userName}`, 14, 30);
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 35);

  // Summary Section
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Executive Summary", 14, 45);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Average Pain Level: ${data.avgPain.toFixed(1)} / 10`, 14, 52);
  doc.text(`Total Flare-up Days: ${data.flareUpDays}`, 14, 58);
  doc.text(`Primary Symptoms: ${data.topSymptoms.join(", ")}`, 14, 64);

  // Insights Section
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Key Health Insights", 14, 75);

  doc.setFontSize(10);
  doc.setTextColor(100);
  data.insights.forEach((insight, i) => {
    const y = 82 + (i * 10);
    doc.text(`• ${insight.title}: ${insight.message}`, 14, y);
  });

  // Logs Table
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Detailed Log History", 14, 22);

  autoTable(doc, {
    startY: 30,
    head: [['Date', 'Pain Level', 'Mood', 'Notes']],
    body: data.logs.map(log => [
      new Date(log.loggedAt).toLocaleDateString(),
      log.painLevel,
      log.moodTag,
      log.notes || ""
    ]),
    theme: 'striped',
    headStyles: { fillColor: [168, 85, 247] } // Purple
  });

  return doc.output("blob");
}
