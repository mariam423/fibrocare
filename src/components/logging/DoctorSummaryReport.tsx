"use client";

/**
 * Doctor Visit Summary Report — a full-screen modal that compiles the
 * patient's checked symptoms and custom notes into a clean, structured,
 * medical-style summary view that can be read, copied, or printed.
 *
 * Props receive the checked symptom IDs and notes from the parent
 * SymptomTracker; no server calls needed.
 */

import React, { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Close,
  Copy01Icon,
  PrinterIcon,
  CheckIcon,
  Stethoscope02Icon,
} from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { useHealth } from "@/context/HealthContext";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────────── */

interface SymptomItem {
  id: string;
  tKey: TranslationKey;
}

interface SymptomCategory {
  id: string;
  tKey: TranslationKey;
  color: string;
  items: SymptomItem[];
}

interface DoctorSummaryReportProps {
  open: boolean;
  onClose: () => void;
  checkedSymptomIds: string[];
  notes: string;
  patientName?: string;
}

/* ─── Constants (mirrored from SymptomTracker) ───────────────────── */

const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  {
    id: "pain",
    tKey: "symptomTracker.category.pain",
    color: "text-rose-400",
    items: [
      { id: "pain-neck-shoulders", tKey: "symptomTracker.pain.neckShoulders" },
      { id: "pain-upper-back", tKey: "symptomTracker.pain.upperBack" },
      { id: "pain-lower-back-hips", tKey: "symptomTracker.pain.lowerBackHips" },
      { id: "pain-arms-elbows", tKey: "symptomTracker.pain.armsElbows" },
      { id: "pain-legs-knees", tKey: "symptomTracker.pain.legsKnees" },
      { id: "pain-chest-wall", tKey: "symptomTracker.pain.chestWall" },
    ],
  },
  {
    id: "physical",
    tKey: "symptomTracker.category.physical",
    color: "text-amber-400",
    items: [
      { id: "phys-severe-fatigue", tKey: "symptomTracker.physical.severeFatigue" },
      { id: "phys-morning-stiffness", tKey: "symptomTracker.physical.morningStiffness" },
      { id: "phys-sleep-disturbances", tKey: "symptomTracker.physical.sleepDisturbances" },
      { id: "phys-numbness-tingling", tKey: "symptomTracker.physical.numbnessTingling" },
      { id: "phys-rls", tKey: "symptomTracker.physical.rls" },
      { id: "phys-burning-cold", tKey: "symptomTracker.physical.burningColdSensations" },
    ],
  },
  {
    id: "postExertional",
    tKey: "symptomTracker.category.postExertional",
    color: "text-orange-400",
    items: [
      { id: "post-post-shower", tKey: "symptomTracker.postExertional.postShower" },
      { id: "post-post-meal", tKey: "symptomTracker.postExertional.postMeal" },
      { id: "post-exhaustion-going-out", tKey: "symptomTracker.postExertional.exhaustionGoingOut" },
    ],
  },
  {
    id: "headFaceJaw",
    tKey: "symptomTracker.category.headFaceJaw",
    color: "text-violet-400",
    items: [
      { id: "head-fibro-fog", tKey: "symptomTracker.head.fibroFog" },
      { id: "head-memory-lapses", tKey: "symptomTracker.head.memoryLapses" },
      { id: "head-tension-headaches", tKey: "symptomTracker.head.tensionHeadaches" },
      { id: "head-tmj-jaw", tKey: "symptomTracker.head.tmjJawPain" },
      { id: "head-facial-tension", tKey: "symptomTracker.head.facialTension" },
    ],
  },
  {
    id: "sensory",
    tKey: "symptomTracker.category.sensory",
    color: "text-cyan-400",
    items: [
      { id: "sense-light-noise", tKey: "symptomTracker.sensory.lightNoise" },
      { id: "sense-ibs-digestive", tKey: "symptomTracker.sensory.ibsDigestive" },
      { id: "sense-palpitations", tKey: "symptomTracker.sensory.palpitationsDizziness" },
      { id: "sense-mood-anxiety", tKey: "symptomTracker.sensory.moodAnxiety" },
    ],
  },
];

/* ─── Helpers ────────────────────────────────────────────────────── */

function formatDate(locale: string): string {
  return new Date().toLocaleDateString(locale === "ar" ? "ar" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildPlainTextReport(
  t: (key: TranslationKey) => string,
  userName: string,
  painLevel: number,
  checkedIds: string[],
  notes: string,
  locale: string
): string {
  const lines: string[] = [];
  const dateStr = formatDate(locale);

  lines.push(t("doctorReport.title").toUpperCase());
  lines.push("=".repeat(40));
  lines.push("");

  lines.push(`${t("doctorReport.patientInfo")}:`);
  lines.push(`  ${userName}`);
  lines.push("");

  lines.push(`${t("doctorReport.date")}: ${dateStr}`);
  lines.push(`${t("doctorReport.painLevel")}: ${painLevel}/10`);
  lines.push("");

  lines.push(`${t("doctorReport.checkedSymptoms")}:`);
  lines.push("-".repeat(30));

  let hasSymptoms = false;
  for (const category of SYMPTOM_CATEGORIES) {
    const matched = category.items.filter((item) =>
      checkedIds.includes(item.id)
    );
    if (matched.length === 0) continue;
    hasSymptoms = true;
    lines.push(`  [${t(category.tKey)}]`);
    for (const item of matched) {
      lines.push(`    - ${t(item.tKey)}`);
    }
    lines.push("");
  }

  if (!hasSymptoms) {
    lines.push(`  ${t("doctorReport.noSymptomsMessage")}`);
    lines.push("");
  }

  lines.push(`${t("doctorReport.notes")}:`);
  lines.push("-".repeat(30));
  if (notes.trim()) {
    lines.push(`  ${notes.trim()}`);
  } else {
    lines.push(`  ${t("doctorReport.noNotesMessage")}`);
  }
  lines.push("");

  lines.push("-".repeat(40));
  lines.push(t("doctorReport.disclaimer"));

  return lines.join("\n");
}

/* ─── Component ──────────────────────────────────────────────────── */

export function DoctorSummaryReport({
  open,
  onClose,
  checkedSymptomIds,
  notes,
  patientName = "Patient",
}: DoctorSummaryReportProps) {
  const { t, locale } = useLanguage();
  const { currentPainLevel } = useHealth();
  const reportRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const userName = patientName;

  const categorizedSymptoms = useMemo(() => {
    const result: Array<{ category: SymptomCategory; matched: SymptomItem[] }> = [];
    for (const category of SYMPTOM_CATEGORIES) {
      const matched = category.items.filter((item) =>
        checkedSymptomIds.includes(item.id)
      );
      if (matched.length > 0) {
        result.push({ category, matched });
      }
    }
    return result;
  }, [checkedSymptomIds]);

  const handleCopy = useCallback(async () => {
    const text = buildPlainTextReport(
      t,
      userName,
      currentPainLevel,
      checkedSymptomIds,
      notes,
      locale
    );
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard API unavailable */
    }
  }, [t, userName, currentPainLevel, checkedSymptomIds, notes, locale]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4 pt-8 sm:pt-16"
          onClick={handleOverlayClick}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label={t("doctorReport.title")}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl mb-8"
          >
            {/* Report card */}
            <div
              ref={reportRef}
              className={cn(
                "rounded-2xl border border-border bg-card shadow-2xl",
                "overflow-hidden print:shadow-none print:border-none"
              )}
            >
              {/* ── Header ──────────────────────────────── */}
              <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                    <HugeiconsIcon
                      icon={Stethoscope02Icon}
                      className="h-5 w-5 text-primary"
                      aria-hidden="true"
                    />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      {t("doctorReport.title")}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {t("doctorReport.subtitle")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors print:hidden"
                  aria-label={t("doctorReport.close")}
                >
                  <HugeiconsIcon icon={Close} className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* ── Patient info ────────────────────────── */}
              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                      {t("doctorReport.patientInfo")}
                    </p>
                    <p className="text-sm font-semibold text-foreground" dir="auto">
                      {userName}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                      {t("doctorReport.date")}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatDate(locale)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                      {t("doctorReport.painLevel")}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      <bdi>{currentPainLevel}</bdi>/10
                    </p>
                  </div>
                </div>

                {/* ── Checked symptoms ───────────────────── */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                    {t("doctorReport.checkedSymptoms")}
                  </h3>

                  {categorizedSymptoms.length > 0 ? (
                    <div className="space-y-3">
                      {categorizedSymptoms.map(({ category, matched }) => (
                        <div
                          key={category.id}
                          className="rounded-xl border border-border bg-muted/30 p-4"
                        >
                          <p className={cn(
                            "text-xs font-bold uppercase tracking-wider mb-2",
                            category.color
                          )}>
                            {t(category.tKey)}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {matched.map((item) => (
                              <span
                                key={item.id}
                                className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-medium text-primary"
                              >
                                <HugeiconsIcon
                                  icon={CheckIcon}
                                  className="h-3 w-3"
                                  aria-hidden="true"
                                />
                                {t(item.tKey)}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        {t("doctorReport.noSymptomsMessage")}
                      </p>
                    </div>
                  )}
                </div>

                {/* ── Notes ──────────────────────────────── */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                    {t("doctorReport.notes")}
                  </h3>
                  {notes.trim() ? (
                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                      <p className="text-sm text-foreground whitespace-pre-wrap" dir="auto">
                        {notes.trim()}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        {t("doctorReport.noNotesMessage")}
                      </p>
                    </div>
                  )}
                </div>

                {/* ── Disclaimer ─────────────────────────── */}
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3">
                  <p className="text-[11px] text-amber-600 dark:text-amber-300 leading-relaxed">
                    {t("doctorReport.disclaimer")}
                  </p>
                </div>
              </div>

              {/* ── Footer actions ──────────────────────── */}
              <div className="flex items-center gap-2 border-t border-border bg-muted/30 px-6 py-4 print:hidden">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200",
                    "border border-border bg-card hover:bg-muted text-foreground",
                    "active:scale-[0.98]"
                  )}
                >
                  <HugeiconsIcon
                    icon={copied ? CheckIcon : Copy01Icon}
                    className={cn("h-4 w-4", copied && "text-emerald-500")}
                    aria-hidden="true"
                  />
                  {copied ? t("doctorReport.copied") : t("doctorReport.copyToClipboard")}
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200",
                    "bg-primary/90 text-primary-foreground hover:bg-primary",
                    "active:scale-[0.98]"
                  )}
                >
                  <HugeiconsIcon icon={PrinterIcon} className="h-4 w-4" aria-hidden="true" />
                  {t("doctorReport.printReport")}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
