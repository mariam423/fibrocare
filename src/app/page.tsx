"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Heart,
  Wind,
  Droplets,
  ClipboardList,
  ChevronRight,
  Smile,
  Frown,
  Zap,
  Loader2,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHealth } from "@/context/HealthContext";
import { QuickPresets, type Preset } from "@/components/logging/QuickPresets";
import { EmojiGrid } from "@/components/logging/EmojiGrid";
import { FluidSlider } from "@/components/logging/FluidSlider";
import { EmpatheticToast } from "@/components/ui/EmpatheticToast";
import { RecoveryPanel } from "@/components/support/RecoveryCards";
import AppHeader from "@/components/layout/AppHeader";
import { useDashboard } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";

const WELLNESS_TIPS = {
  low: [
    "Try a gentle walk in nature",
    "Practice mindful breathing for 5 minutes",
    "Stay hydrated and keep moving lightly",
    "Read a relaxing book",
  ],
  medium: [
    "Try some gentle neck and shoulder stretches",
    "Prioritize a short, restorative nap",
    "A warm compress on sore areas might help",
    "Try a guided meditation session",
  ],
  high: [
    "Focus on deep, slow breathing",
    "Gentle resting in a comfortable position",
    "Avoid strenuous activity and listen to your body",
    "Sip warm herbal tea and dim the lights",
  ],
};

function getWellnessTip(level: number) {
  const category = level <= 3 ? "low" : level <= 6 ? "medium" : "high";
  const tips = WELLNESS_TIPS[category as keyof typeof WELLNESS_TIPS];
  return tips[Math.floor(Math.random() * tips.length)];
}

const MOOD_OPTIONS = [
  {
    label: "Good Day",
    icon: <Smile className="w-5 h-5" aria-hidden="true" />,
    color:
      "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800",
  },
  {
    label: "Low Energy",
    icon: <Zap className="w-5 h-5" aria-hidden="true" />,
    color:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
  },
  {
    label: "Flare-up",
    icon: <Frown className="w-5 h-5" aria-hidden="true" />,
    color:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  },
];

function PainTrendChart({ data }: { data: { date: string; level: number }[] }) {
  const chartData = useMemo(() => {
    const levelByDate = new Map(data.map((d) => [d.date, d.level]));
    const result: { day: string; level: number | null }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      result.push({
        day: d.toLocaleDateString(undefined, { weekday: "short" }),
        level: levelByDate.has(key) ? (levelByDate.get(key) as number) : null,
      });
    }
    return result;
  }, [data]);

  if (chartData.every((d) => d.level === null)) {
    return (
      <div
        className="flex flex-col items-center justify-center h-40 text-center space-y-2 text-muted-foreground"
        aria-live="polite"
      >
        <ClipboardList className="h-8 w-8 opacity-60" />
        <p className="text-sm font-medium">No pain entries in the last 7 days.</p>
        <p className="text-xs">Log your pain above to start your trend.</p>
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e2e8f0"
            className="dark:stroke-slate-800"
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            dy={10}
          />
          <YAxis
            domain={[0, 10]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#64748b", fontWeight: "bold" }}
            itemStyle={{ color: "#a855f7", fontWeight: "600" }}
          />
          <Area
            type="monotone"
            dataKey="level"
            stroke="#a855f7"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorPain)"
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { isFlareUp, setPainLevel, setTheme } = useHealth();
  const {
    userName,
    hydrationCount,
    streak,
    weeklyTrend,
    insights,
    symptoms,
    lastLogDate,
    painLevel,
    setPainLevel: setLocalPainLevel,
    mood,
    setMood,
    notes,
    setNotes,
    isSaving,
    showSuccess,
    showToast,
    setShowToast,
    logEntry,
    incrementHydration,
    toggleSymptom,
  } = useDashboard();

  const wellnessTip = useMemo(
    () => getWellnessTip(painLevel[0] ?? 3),
    [painLevel]
  );

  const [loggingPreset, setLoggingPreset] = useState<string | null>(null);

  const handlePresetSelect = async (preset: Preset) => {
    setLocalPainLevel([preset.painLevel]);
    setPainLevel(preset.painLevel);
    setMood(preset.label);
    setLoggingPreset(preset.label);
    try {
      await logEntry({
        painLevel: preset.painLevel,
        mood: preset.label,
        symptoms: preset.symptoms,
        notes: "",
      });
    } finally {
      setLoggingPreset(null);
    }
  };

  const handleSliderChange = (value: number[]) => {
    setLocalPainLevel(value);
    setPainLevel(value[0]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <AppHeader />

      <main id="main-content" className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl">
        {/* Welcome Section */}
        <section className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {userName}
          </h1>
          <p className="text-lg text-muted-foreground">
            Take a moment to check in with your body today.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Daily Tracker Widget */}
          <Card className="lg:col-span-2 border-none shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="text-xl">
                How are you feeling today?
              </CardTitle>
              <CardDescription className="text-base">
                Tracking your patterns helps manage flares and improve care.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-10">
              {/* Quick Presets */}
              <div className="space-y-4">
                <QuickPresets
                  onSelect={handlePresetSelect}
                  isLogging={isSaving}
                  loggingPreset={loggingPreset}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <FluidSlider
                    value={painLevel}
                    onValueChange={handleSliderChange}
                  />
                </div>

                <div className="relative group overflow-hidden rounded-2xl border border-border bg-muted p-4 transition-all hover:ring-2 hover:ring-primary/50">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                      <Heart className="h-4 w-4" />
                      Flare-up Support
                    </div>
                    <div className="relative h-32 w-full rounded-lg overflow-hidden shadow-sm">
                      <Image
                        src="https://images.unsplash.com/photo-1516534775060-50782ccd5725?auto=format&fit=crop&w=400&q=80"
                        alt="A calm, supportive setting"
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                    <p className="text-xs text-muted-foreground italic leading-relaxed">
                      &quot;You are stronger than your pain. Take a deep breath
                      and be gentle with yourself.&quot;
                    </p>
                  </div>
                </div>
              </div>

              {/* Mood/Energy Buttons */}
              <fieldset className="space-y-4 border-0 p-0 m-0">
                <legend className="text-lg font-medium mb-4">
                  Current Energy &amp; Mood
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {MOOD_OPTIONS.map((item) => (
                    <Button
                      key={item.label}
                      variant="outline"
                      onClick={() => setMood(item.label)}
                      aria-pressed={mood === item.label}
                      className={`flex items-center justify-center gap-3 py-8 text-lg transition-all ${
                        mood === item.label
                          ? `${item.color} ring-2 ring-offset-2 ring-primary font-semibold`
                          : "bg-card hover:bg-muted"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Button>
                  ))}
                </div>
              </fieldset>

              <div className="space-y-4">
                <label
                  htmlFor="notes"
                  className="text-lg font-medium block"
                >
                  Notes &amp; Symptoms (Optional)
                </label>
                <div className="space-y-6">
                  <EmojiGrid
                    selectedSymptoms={symptoms}
                    onToggle={toggleSymptom}
                  />
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How are you feeling specifically? Any triggers or symptoms?"
                    className="w-full p-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => logEntry()}
                  disabled={isSaving}
                  className="w-full py-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-xl shadow-md hover:shadow-lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Log Today's Entry"
                  )}
                </Button>
                {showSuccess && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="text-center text-primary font-medium animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    &#10003; Log saved successfully!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats & Tips Section */}
          <div className="space-y-6">
            {/* Dynamic Wellness Tip */}
            <Card className="border-none shadow-sm bg-muted">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Wind className="h-6 w-6" />
                  <CardTitle className="text-base">Daily Wellness Tip</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-foreground text-base leading-relaxed">
                  {wellnessTip}
                </p>
                <Link href="/resources">
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary flex items-center gap-1 text-base"
                  >
                    Explore More <ChevronRight className="h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pain Trend Chart */}
            <Card className="border-none shadow-sm bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 font-semibold">
                  <ClipboardList className="h-6 w-6" />
                  <CardTitle className="text-base">Pain Trend (7 Days)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <PainTrendChart data={weeklyTrend} />
                <p className="text-center text-xs text-muted-foreground">
                  Tracking your daily peaks helps identify triggers.
                </p>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="border-none shadow-sm bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Zap className="h-6 w-6" />
                  <CardTitle className="text-base">AI Insights</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Patterns detected from your recent logs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Log at least 5 days of pain and symptoms to unlock personalized insights.
                  </p>
                ) : (
                  insights.slice(0, 3).map((insight) => (
                    <div
                      key={insight.id}
                      className={cn(
                        "rounded-xl border p-3",
                        insight.severity === "critical" &&
                          "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900",
                        insight.severity === "warning" &&
                          "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900",
                        insight.severity === "info" &&
                          "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900"
                      )}
                    >
                      <p className="text-sm font-semibold">{insight.title}</p>
                      <p className="mt-1 text-xs opacity-80">{insight.message}</p>
                    </div>
                  ))
                )}
                <Link href="/reports" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    View Full Report
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Hydration Tracker */}
            <Card className="border-none shadow-sm bg-muted">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-semibold">
                  <Droplets className="h-6 w-6" />
                  <CardTitle className="text-base">Hydration</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-foreground text-base leading-relaxed">
                    Daily Water Intake
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => incrementHydration(-1)}
                      aria-label="Decrease water intake"
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      &minus;
                    </Button>
                    <span
                      className="text-xl font-bold text-teal-600 dark:text-teal-400 min-w-[2ch] text-center"
                      aria-live="polite"
                    >
                      {hydrationCount}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => incrementHydration(1)}
                      aria-label="Increase water intake"
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div
                  className="flex items-center gap-3"
                  role="img"
                  aria-label={`${hydrationCount} glasses of water out of 8`}
                >
                  <div className="h-3 flex-1 bg-teal-200 dark:bg-teal-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, (hydrationCount / 8) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Goal: 8
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Flare-up Support */}
            {isFlareUp && (
              <Card className="border-none shadow-sm bg-primary/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-primary">
                    Gentle Support for Your Flare
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RecoveryPanel
                    onZen={() => router.push("/zen")}
                    onSensitive={() => setTheme("Sensitive")}
                  />
                </CardContent>
              </Card>
            )}

            {/* Logs Summary */}
            <Card className="border-none shadow-sm bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Activity className="h-6 w-6" />
                  <CardTitle className="text-base">Log Summary</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Daily check-in history.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-base">
                  <span className="text-muted-foreground">Last Log</span>
                  <span className="font-medium">{lastLogDate}</span>
                </div>
                <div className="flex justify-between items-center text-base">
                  <span className="text-muted-foreground">Current Streak</span>
                  <span className="font-medium">{streak} Days</span>
                </div>
                <Link href="/health-logs">
                  <Button
                    variant="outline"
                    className="w-full mt-2 text-base py-6"
                  >
                    View All Logs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {showToast && (
        <EmpatheticToast
          message="It looks like a tough day. Would you like to switch to Calming Mode and take 3 minutes for yourself?"
          onClose={() => setShowToast(false)}
          actions={[
            {
              label: "Calming Mode",
              onClick: () => {
                setTheme("Sensitive");
                setShowToast(false);
              },
            },
            {
              label: "Zen Portal",
              onClick: () => {
                router.push("/zen");
                setShowToast(false);
              },
            },
          ]}
        />
      )}
    </div>
  );
}
