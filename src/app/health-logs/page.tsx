"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  Delete01Icon,
  Loading01Icon,
  ClipboardListIcon,
  Search01Icon,
  TrendingUpDownIcon,
  FireIcon,
  Layers01Icon,
  BadgeCheckIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { DepthCard } from "@/components/ui/DepthCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { SegmentedFilter, type SegmentedFilterOption } from "@/components/ui/SegmentedFilter";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { getAllHealthLogs, deletePainLog } from "../actions";
import type { HealthLog } from "@/lib/types";
import AppHeader from "@/components/layout/AppHeader";
import Link from "next/link";
import { cn } from "@/lib/utils";

function getSeverityBucket(level: number): string {
  if (level <= 3) return "low";
  if (level <= 6) return "moderate";
  return "severe";
}

const SEVERITY_PILL: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/25 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/30",
  moderate:
    "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/25 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/30",
  severe:
    "bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/25 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/30",
};

/** Moods are stored as English labels (energy options / quick presets). */
const STORED_MOOD_KEYS: Record<string, TranslationKey> = {
  "Good Day": "dashboard.energy.goodDay",
  "Low Energy": "dashboard.energy.lowEnergy",
  "Flare-up": "dashboard.energy.flareUp",
  "Calm Day": "logging.presets.calmDay",
  "Mild Flare": "logging.presets.mildFlare",
  "Severe Flare": "logging.presets.severeFlare",
  // Entries written by the resources pages' "add to today's tracker".
  "Self-Care": "logging.mood.selfCare",
};

function formatDateTime(value: string | Date, locale: string): string {
  return new Date(value).toLocaleDateString(locale === "ar" ? "ar" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SkeletonRows() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-zinc-200/60 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.03] p-3"
        >
          <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200 dark:bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded-full bg-zinc-200 dark:bg-white/5" />
            <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-zinc-100 dark:bg-white/[0.03]" />
          </div>
          <div className="h-8 w-8 animate-pulse rounded-lg bg-zinc-100 dark:bg-white/[0.03]" />
        </div>
      ))}
    </div>
  );
}

interface SummaryStat {
  label: string;
  value: string;
  hint: string;
  icon: typeof Layers01Icon;
  accent: string;
}

export default function HealthLogsPage() {
  const { t, locale, dir } = useLanguage();
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const severityFilters = useMemo<SegmentedFilterOption[]>(
    () => [
      { value: "all", label: t("logs.severity.all"), tone: "neutral" },
      { value: "low", label: t("logs.severity.low"), tone: "emerald" },
      { value: "moderate", label: t("logs.severity.moderate"), tone: "amber" },
      { value: "severe", label: t("logs.severity.severe"), tone: "rose" },
    ],
    [t]
  );

  useEffect(() => {
    let cancelled = false;
    getAllHealthLogs()
      .then((data) => {
        if (cancelled) return;
        setLogs(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching logs:", error);
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
    };
  }, []);

  const requestDelete = (id: string) => {
    if (pendingDelete === id) {
      void handleDelete(id);
      return;
    }
    setPendingDelete(id);
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    confirmTimer.current = setTimeout(() => setPendingDelete(null), 3000);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const result = await deletePainLog(id);
      if (result.success) {
        setLogs((prev) => prev.filter((log) => log.id !== id));
        setPendingDelete(null);
      } else {
        console.error(result.error || "Failed to delete log");
      }
    } catch (error) {
      console.error("Error deleting log:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredLogs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesSeverity =
        severityFilter === "all" ||
        getSeverityBucket(log.painLevel) === severityFilter;
      const matchesQuery =
        q.length === 0 ||
        log.moodTag.toLowerCase().includes(q) ||
        (log.notes ?? "").toLowerCase().includes(q);
      return matchesSeverity && matchesQuery;
    });
  }, [logs, severityFilter, query]);

  const stats = useMemo<SummaryStat[]>(() => {
    if (logs.length === 0) return [];
    const avgPain = logs.reduce((sum, l) => sum + l.painLevel, 0) / logs.length;
    const flareDays = logs.filter((l) => l.painLevel >= 7).length;
    return [
      {
        label: t("logs.stat.totalEntries"),
        value: String(logs.length),
        hint: t("logs.stat.totalHint"),
        icon: Layers01Icon,
        accent: "text-primary",
      },
      {
        label: t("logs.stat.avgPain"),
        value: avgPain.toFixed(1),
        hint: t("logs.stat.avgHint"),
        icon: TrendingUpDownIcon,
        accent: "text-amber-600 dark:text-amber-400",
      },
      {
        label: t("logs.stat.flareDays"),
        value: String(flareDays),
        hint: t("logs.stat.flareHint"),
        icon: FireIcon,
        accent: "text-rose-600 dark:text-rose-400",
      },
    ];
  }, [logs, t]);

  const hasFilters = severityFilter !== "all" || query.trim().length > 0;

  return (
    <RouteTransition>
    <div className="min-h-[100dvh] bg-background text-foreground transition-colors duration-500">
      <AppHeader backHref="/dashboard" />

      <main className="pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        {/* Page header */}
        <ScrollReveal as="section" className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="icon-badge h-11 w-11 rounded-xl">
              <HugeiconsIcon icon={ClipboardListIcon} className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {t("logs.pageTitle")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("logs.pageSubtitle")}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Summary stats */}
        {!isLoading && stats.length > 0 && (
          <section aria-label={t("logs.summaryAria")} className="relative">
            {/* Ambient glow orb behind stats */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-40 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" aria-hidden="true" />
            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <DepthCard key={stat.label} delay={index * 0.05} className="h-full">
                  <div className="flex h-full items-center gap-4 rounded-2xl border border-zinc-200/80 dark:border-white/5 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md p-6 shadow-xl transition-all duration-300 ease-out hover:border-emerald-500/20 hover:-translate-y-1">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 backdrop-blur-sm">
                      <HugeiconsIcon icon={stat.icon} className={cn("h-5 w-5", stat.accent)} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </DepthCard>
              ))}
            </div>
          </section>
        )}

        {isLoading ? (
          <DepthCard delay={0.05}>
            <Card className="h-full overflow-hidden border border-zinc-200/80 dark:border-white/5 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl">
              <CardHeader className="border-b border-zinc-200/80 dark:border-white/5 pb-0">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded-full bg-zinc-200 dark:bg-white/5" />
                    <div className="h-3 w-44 animate-pulse rounded-full bg-zinc-100 dark:bg-white/[0.03]" />
                  </div>
                  <div className="h-9 w-24 animate-pulse rounded-xl bg-zinc-100 dark:bg-white/[0.03]" />
                </div>
              </CardHeader>
              <SkeletonRows />
            </Card>
          </DepthCard>
        ) : logs.length === 0 ? (
          <DepthCard delay={0.05}>
          <Card className="h-full text-center py-14 border border-zinc-200/80 dark:border-white/5 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl">
            <CardContent className="flex flex-col items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 backdrop-blur-sm">
                <HugeiconsIcon icon={Calendar01Icon} className="h-7 w-7 text-primary" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-medium text-zinc-900 dark:text-white">{t("logs.empty.title")}</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {t("logs.empty.description")}
                </p>
              </div>
              <Link href="/dashboard">
                <Button variant="outline" className="rounded-xl">
                  {t("logs.empty.cta")}
                </Button>
              </Link>
            </CardContent>
          </Card>
          </DepthCard>
        ) : (
          <DepthCard delay={0.05}>
          <Card className="h-full overflow-hidden border border-zinc-200/80 dark:border-white/5 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl">
            <CardHeader className="border-b border-zinc-200/80 dark:border-white/5 pb-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl text-zinc-900 dark:text-white font-semibold">{t("logs.tableTitle")}</CardTitle>
                  <CardDescription className="mt-1 text-sm text-muted-foreground">
                    {t("logs.showing", { shown: filteredLogs.length, total: logs.length })}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {/* Search */}
                  <div className="relative w-full sm:w-56">
                    <HugeiconsIcon
                      icon={Search01Icon}
                      className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t("logs.searchPlaceholder")}
                      aria-label={t("logs.searchAria")}
                      className="h-10 w-full rounded-xl border border-zinc-300 dark:border-white/10 bg-zinc-100/80 dark:bg-white/5 ps-9 pe-8 text-sm text-zinc-900 dark:text-foreground placeholder:text-muted-foreground outline-none backdrop-blur-md transition-all duration-200 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/25"
                    />
                    {query.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        aria-label={t("logs.clearAria")}
                        className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <HugeiconsIcon icon={Cancel01Icon} className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <SegmentedFilter
                    options={severityFilters}
                    value={severityFilter}
                    onChange={setSeverityFilter}
                    label={t("logs.filterLabel")}
                    className="sm:max-w-md"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-200/80 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02]">
                      <TableHead className="px-5 font-medium text-xs text-muted-foreground">{t("logs.col.date")}</TableHead>
                      <TableHead className="px-3 font-medium text-xs text-muted-foreground">{t("logs.col.pain")}</TableHead>
                      <TableHead className="px-3 font-medium text-xs text-muted-foreground">{t("logs.col.mood")}</TableHead>
                      <TableHead className="px-3 font-medium text-xs text-muted-foreground">{t("logs.col.notes")}</TableHead>
                      <TableHead className="px-5 text-end font-medium text-xs text-muted-foreground">{t("logs.col.action")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow className="border-0">
                        <TableCell colSpan={5} className="py-16 text-center">
                          <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 backdrop-blur-sm">
                              <HugeiconsIcon icon={Search01Icon} className="h-5 w-5 text-primary" aria-hidden="true" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-zinc-900 dark:text-white">{t("logs.noMatch.title")}</p>
                              <p className="text-sm text-muted-foreground">
                                {t("logs.noMatch.description")}
                              </p>
                            </div>
                            {hasFilters && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                                onClick={() => {
                                  setSeverityFilter("all");
                                  setQuery("");
                                }}
                              >
                                {t("logs.clearFilters")}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <AnimatePresence initial={false}>
                      {filteredLogs.map((log) => {
                        const severity = getSeverityBucket(log.painLevel);
                        const isPending = pendingDelete === log.id;
                        const isDeletingRow = isDeleting === log.id;
                        return (
                        <motion.tr
                          key={log.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: dir === "rtl" ? 16 : -16 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          className="group border-zinc-200/80 dark:border-white/5 transition-colors duration-200 hover:bg-zinc-100/50 dark:hover:bg-white/[0.03]"
                        >
                          <TableCell className="px-5 py-4">
                            <div className="flex items-center gap-3">
                                                            <HugeiconsIcon
                                icon={BadgeCheckIcon}
                                className={cn(
                                  "h-4 w-4 shrink-0",
                                  severity === "low" && "text-emerald-500",
                                  severity === "moderate" && "text-amber-500",
                                  severity === "severe" && "text-rose-500"
                                )}
                                aria-hidden="true"
                              />
                              <span className="whitespace-nowrap text-sm text-muted-foreground">
                                {formatDateTime(log.loggedAt, locale)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-4" aria-label={t("logs.painAria", { level: log.painLevel })}>
                            <span className={cn(
                              "inline-flex min-w-14 items-center justify-center rounded-full px-3 py-1 text-sm font-bold tabular-nums",
                              SEVERITY_PILL[severity]
                            )}>
                              {log.painLevel}{t("chart.painLevel")}
                            </span>
                          </TableCell>
                          <TableCell className="px-3 py-4">
                            <span className="whitespace-nowrap text-sm font-medium text-foreground">
                              {STORED_MOOD_KEYS[log.moodTag]
                                ? t(STORED_MOOD_KEYS[log.moodTag])
                                : log.moodTag}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[16rem] px-3 py-4">
                            <span className="block truncate text-sm text-muted-foreground">
                              {log.notes || (
                                <span className="italic text-muted-foreground/60">{t("logs.noNotes")}</span>
                              )}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-4 text-end">
                            {isPending ? (
                              <div className="inline-flex items-center gap-1.5">
                                <span className="hidden text-xs text-muted-foreground sm:inline">
                                  {t("logs.confirm")}
                                </span>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => requestDelete(log.id)}
                                  disabled={isDeletingRow}
                                  aria-label={t("logs.confirmDeleteAria", { date: formatDateTime(log.loggedAt, locale) })}
                                  className="h-8 w-8 rounded-lg p-0"
                                >
                                  {isDeletingRow ? (
                                    <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" aria-hidden="true" />
                                  ) : (
                                    <HugeiconsIcon icon={BadgeCheckIcon} className="h-4 w-4" aria-hidden="true" />
                                  )}
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => requestDelete(log.id)}
                                disabled={isDeletingRow}
                                aria-label={t("logs.deleteAria", { date: formatDateTime(log.loggedAt, locale) })}
                                className="rounded-lg text-muted-foreground transition-all duration-200 hover:bg-red-50 hover:text-red-600 active:scale-[0.94] dark:hover:bg-red-950/40 dark:hover:text-red-400"
                              >
                                {isDeletingRow ? (
                                  <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" aria-hidden="true" />
                                ) : (
                                  <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 opacity-60 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                                )}
                              </Button>
                            )}
                          </TableCell>
                        </motion.tr>
                        );
                      })}
                      </AnimatePresence>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          </DepthCard>
        )}
      </main>
    </div>
    </RouteTransition>
  );
}
