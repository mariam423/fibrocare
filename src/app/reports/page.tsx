"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Loader2 } from "lucide-react";
import { generateMedicalReport } from "@/lib/pdfGenerator";
import { getCurrentUser, getLatestLogs } from "@/app/actions";
import { analyzeHealthPatterns } from "@/lib/insightEngine";
import AppHeader from "@/components/layout/AppHeader";

export default function ReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      const user = await getCurrentUser();
      const logs = await getLatestLogs();
      const insights = await analyzeHealthPatterns(user.id);

      const avgPain = logs.length
        ? logs.reduce((acc, l) => acc + l.painLevel, 0) / logs.length
        : 0;

      const flareUpDays = logs.filter((l) => l.painLevel >= 7).length;

      const topSymptoms = ["Fatigue", "Fibro Fog"];

      const blob = await generateMedicalReport({
        userName: user.name,
        avgPain,
        flareUpDays,
        topSymptoms,
        insights,
        logs,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FibroCare-Report-${user.name}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <AppHeader backHref="/" backLabel="Back to Dashboard" />

      <main id="main-content" className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-3xl">
        <section className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Medical Reports</h1>
          <p className="text-lg text-muted-foreground">
            Export your health data into a professional format for your specialist.
          </p>
        </section>

        <Card className="border-none shadow-lg ring-1 ring-border bg-card">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto p-4 rounded-full bg-primary/15 w-fit">
              <FileText className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Clinical Summary PDF</CardTitle>
            <CardDescription className="text-base">
              This report includes your 30-day pain averages, flare-up frequency,
              key health insights, and a complete log history.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button
              onClick={handleExport}
              disabled={isGenerating}
              className="px-8 py-6 text-lg bg-primary hover:bg-primary/90 rounded-xl"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download PDF Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
