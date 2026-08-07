"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Download,
  Loader2,
  TrendingUp,
  Flame,
  ClipboardList,
  AlertTriangle,
  Info,
} from "lucide-react";
import { generateMedicalReport } from "@/lib/pdfGenerator";
import { getReportData } from "@/app/actions";
import type { Insight } from "@/lib/insightEngine";
import AppHeader from "@/components/layout/AppHeader";
import { cn } from "@/lib/utils";

interface ReportSnapshot {
  userName: string;
  logs: { id: string; painLevel: number; moodTag: string; notes: string | null; loggedAt: string | Date }[];
  insights: Insight[];
  topSymptoms: string[];
  avgPain: number;
  flareUpDays: number;
}

const severityStyle: Record<Insight["severity"], string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  info: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const severityLabel: Record<Insight["severity"], string> = {
  critical: "Critical",
  warning: "Watch",
  info: "Note",
};

export default function ReportsPage() {
  const [snapshot, setSnapshot] = useState<ReportSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getReportData()
      .then((data) => {
        if (cancelled || !data) return;
        setSnapshot({
          userName: data.user.name,
          logs: data.logs,
          insights: data.insights,
          topSymptoms: data.topSymptoms,
          avgPain: data.avgPain,
          flareUpDays: data.flareUpDays,
        });
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setError("Could not load report data.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleExport = async () => {
    if (!snapshot) return;
    setIsGenerating(true);
    try {
      const blob = await generateMedicalReport({
        userName: snapshot.userName,
        avgPain: snapshot.avgPain,
        flareUpDays: snapshot.flareUpDays,
        topSymptoms: snapshot.topSymptoms,
        insights: snapshot.insights,
        logs: snapshot.logs,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FibroCare-Report-${snapshot.userName}.pdf`;
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
            A 90-day summary of your pain, flares, symptoms, and patterns — ready for your specialist.
          </p>
        </section>

        {isLoading && (
          <Card className="border-none shadow-lg ring-1 ring-border bg-card">
            <CardContent className="flex items-center justify-center py-16 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-muted-foreground">Analyzing your health data…</p>
            </CardContent>
          </Card>
        )}

        {error && !isLoading && (
          <p role="alert" className="text-center text-red-600 font-medium">
            {error}
          </p>
        )}

        {!isLoading && snapshot && (
          <>
            {/* Preview stats */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Report snapshot">
              <Card className="border-none shadow-sm ring-1 ring-border bg-card">
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="p-2 rounded-lg bg-primary/15 text-primary">
                    <TrendingUp className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Avg Pain · 90 days</p>
                    <p className="text-2xl font-bold">
                      {snapshot.avgPain.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">/ 10</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm ring-1 ring-border bg-card">
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="p-2 rounded-lg bg-orange-100 text-orange-700">
                    <Flame className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Flare-up days</p>
                    <p className="text-2xl font-bold">{snapshot.flareUpDays}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm ring-1 ring-border bg-card">
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
                    <ClipboardList className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Top symptoms</p>
                    <p className="text-sm font-semibold leading-snug">
                      {snapshot.topSymptoms.join(", ") || "None recorded"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Insights preview */}
            <Card className="border-none shadow-lg ring-1 ring-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" aria-hidden="true" />
                  Key Insights
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {snapshot.insights.length > 0
                    ? "Data-driven observations from your logs."
                    : "Log at least 5 days of pain + symptoms to unlock personalized insights."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {snapshot.insights.length === 0 ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Info className="h-4 w-4" aria-hidden="true" />
                    <span>No insights yet — keep logging consistently.</span>
                  </div>
                ) : (
                  snapshot.insights.map((insight) => (
                    <div
                      key={insight.id}
                      className={cn("rounded-xl border p-4", severityStyle[insight.severity])}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{insight.title}</p>
                        <span className="text-[11px] font-bold uppercase tracking-wide">
                          {severityLabel[insight.severity]}
                        </span>
                      </div>
                      <p className="mt-1 text-sm opacity-80">{insight.message}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Download */}
            <Card className="border-none shadow-lg ring-1 ring-border bg-card">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto p-4 rounded-full bg-primary/15 w-fit">
                  <FileText className="h-12 w-12 text-primary" aria-hidden="true" />
                </div>
                <CardTitle className="text-2xl">Clinical Summary PDF</CardTitle>
                <CardDescription className="text-base">
                  Includes the 30-day pain trend chart, correlation summary, key insights, and the full
                  log annex.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-8">
                <Button
                  onClick={handleExport}
                  disabled={isGenerating || snapshot.logs.length === 0}
                  className="px-8 py-6 text-lg bg-primary hover:bg-primary/90 rounded-xl"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                      Generating Report…
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" aria-hidden="true" />
                      Download PDF Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
