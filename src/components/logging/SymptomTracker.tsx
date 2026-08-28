"use client";

/**
 * Comprehensive Symptom Checklist — designed to sit inside the daily
 * check-in card as a detailed, category-based symptom tracker for
 * fibromyalgia patients who need to remember all symptoms for doctor visits.
 *
 * State is persisted to localStorage so symptoms survive page refreshes
 * and can be reviewed before a medical appointment.
 */

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  MapPinIcon,
  BatteryLowIcon,
  BrainIcon,
  WaveIcon,
  Activity01Icon,
  SparklesIcon,
  ChevronDownIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Stethoscope02Icon,
} from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { DoctorSummaryReport } from "./DoctorSummaryReport";

/* ─── Types ──────────────────────────────────────────────────────── */

interface SymptomItem {
  id: string;
  tKey: TranslationKey;
}

interface SymptomCategory {
  id: string;
  tKey: TranslationKey;
  icon: IconSvgElement;
  color: string;
  bgColor: string;
  borderColor: string;
  items: SymptomItem[];
}

/* ─── Constants ──────────────────────────────────────────────────── */

const STORAGE_KEY_SYMPTOMS = "fibrocare:symptomTracker";
const STORAGE_KEY_NOTES = "fibrocare:symptomTrackerNotes";

const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  {
    id: "pain",
    tKey: "symptomTracker.category.pain",
    icon: MapPinIcon,
    color: "text-rose-400",
    bgColor: "bg-rose-400/10",
    borderColor: "border-rose-400/30",
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
    icon: BrainIcon,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/30",
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
    icon: BatteryLowIcon,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/30",
    items: [
      { id: "post-post-shower", tKey: "symptomTracker.postExertional.postShower" },
      { id: "post-post-meal", tKey: "symptomTracker.postExertional.postMeal" },
      { id: "post-exhaustion-going-out", tKey: "symptomTracker.postExertional.exhaustionGoingOut" },
    ],
  },
  {
    id: "headFaceJaw",
    tKey: "symptomTracker.category.headFaceJaw",
    icon: WaveIcon,
    color: "text-violet-400",
    bgColor: "bg-violet-400/10",
    borderColor: "border-violet-400/30",
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
    icon: SparklesIcon,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    borderColor: "border-cyan-400/30",
    items: [
      { id: "sense-light-noise", tKey: "symptomTracker.sensory.lightNoise" },
      { id: "sense-ibs-digestive", tKey: "symptomTracker.sensory.ibsDigestive" },
      { id: "sense-palpitations", tKey: "symptomTracker.sensory.palpitationsDizziness" },
      { id: "sense-mood-anxiety", tKey: "symptomTracker.sensory.moodAnxiety" },
    ],
  },
];

/* ─── Animation variants ─────────────────────────────────────────── */

const accordionVariants: Variants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: "auto", opacity: 1 },
};

/* ─── Component ──────────────────────────────────────────────────── */

interface SymptomTrackerProps {
  patientName?: string;
}

export function SymptomTracker({ patientName }: SymptomTrackerProps) {
  const { t } = useLanguage();

  const [checked, setChecked] = useLocalStorage<string[]>(
    STORAGE_KEY_SYMPTOMS,
    []
  );
  const [notes, setNotes] = useLocalStorage<string>(STORAGE_KEY_NOTES, "");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showReport, setShowReport] = useState(false);

  const totalChecked = checked.length;

  const handleToggle = useCallback((symptomId: string) => {
    setChecked((prev) =>
      prev.includes(symptomId)
        ? prev.filter((s) => s !== symptomId)
        : [...prev, symptomId]
    );
  }, [setChecked]);

  const handleToggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const clearAll = useCallback(() => {
    setChecked([]);
  }, [setChecked]);

  const expandAll = useCallback(() => {
    setExpandedCategories(SYMPTOM_CATEGORIES.map((c) => c.id));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedCategories([]);
  }, []);

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNotes(e.target.value);
    },
    [setNotes]
  );

  const categoryCheckedCount = useCallback(
    (category: SymptomCategory) =>
      category.items.filter((item) => checked.includes(item.id)).length,
    [checked]
  );

  return (
    <>
      <section className="border-t border-border pt-8 space-y-5">
        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <HugeiconsIcon
                icon={Activity01Icon}
                className="h-4 w-4 text-primary"
                aria-hidden="true"
              />
            </span>
            <div className="min-w-0">
              <label className="text-lg font-medium block">
                {t("symptomTracker.title")}
              </label>
              <p className="text-xs text-muted-foreground truncate">
                {t("symptomTracker.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={expandedCategories.length === SYMPTOM_CATEGORIES.length ? collapseAll : expandAll}
              className="p-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label={expandedCategories.length === SYMPTOM_CATEGORIES.length ? t("symptomTracker.collapseAll") : t("symptomTracker.expandAll")}
            >
              <HugeiconsIcon
                icon={expandedCategories.length === SYMPTOM_CATEGORIES.length ? ArrowUp01Icon : ArrowDown01Icon}
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* ── Checked count badge ────────────────────── */}
        {totalChecked > 0 && (
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 dark:bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
              <HugeiconsIcon icon={Activity01Icon} className="h-3 w-3" aria-hidden="true" />
              {t("symptomTracker.totalChecked").replace("{count}", String(totalChecked))}
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-muted-foreground hover:text-rose-400 transition-colors"
            >
              {t("symptomTracker.clearAll")}
            </button>
          </div>
        )}

        {/* ── Category accordions ────────────────────── */}
        <div className="space-y-3">
          {SYMPTOM_CATEGORIES.map((category) => {
            const isExpanded = expandedCategories.includes(category.id);
            const checkedCount = categoryCheckedCount(category);
            const IconComp = category.icon;

            return (
              <div
                key={category.id}
                className={cn(
                  "rounded-2xl border transition-all duration-300",
                  isExpanded
                    ? cn(category.borderColor, "bg-card/80 backdrop-blur-md")
                    : "border-border bg-muted/40 hover:bg-muted/60"
                )}
              >
                {/* Category header */}
                <button
                  type="button"
                  onClick={() => handleToggleCategory(category.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 text-start transition-colors rounded-2xl",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  )}
                  aria-expanded={isExpanded}
                >
                  <span className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                    isExpanded ? category.bgColor : "bg-muted"
                  )}>
                    <HugeiconsIcon
                      icon={IconComp}
                      className={cn("h-4 w-4", isExpanded ? category.color : "text-muted-foreground")}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-sm font-semibold block truncate">
                      {t(category.tKey)}
                    </span>
                    {checkedCount > 0 && (
                      <span className="text-[11px] text-muted-foreground">
                        {checkedCount}/{category.items.length}
                      </span>
                    )}
                  </span>
                  {checkedCount > 0 && (
                    <span className={cn(
                      "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                      category.bgColor, category.color
                    )}>
                      {checkedCount}
                    </span>
                  )}
                  <HugeiconsIcon
                    icon={ChevronDownIcon}
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-300",
                      isExpanded && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </button>

                {/* Category items */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      variants={accordionVariants}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1">
                        <p className="text-[11px] font-medium text-muted-foreground mb-2.5 uppercase tracking-wider">
                          {t("symptomTracker.selectSymptoms")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {category.items.map((item) => {
                            const isActive = checked.includes(item.id);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleToggle(item.id)}
                                aria-pressed={isActive}
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
                                  "border transition-all duration-200",
                                  "active:scale-[0.96]",
                                  isActive
                                    ? cn(
                                        "border-primary/50 bg-primary/15 text-primary",
                                        "shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                                      )
                                    : "border-border bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border/80"
                                )}
                              >
                                {isActive && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                                )}
                                {t(item.tKey)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* ── Notes ──────────────────────────────────── */}
        <div className="space-y-2">
          <label htmlFor="symptom-tracker-notes" className="text-sm font-medium block">
            {t("symptomTracker.notes")}
          </label>
          <textarea
            id="symptom-tracker-notes"
            value={notes}
            onChange={handleNotesChange}
            placeholder={t("symptomTracker.notesPlaceholder")}
            className="w-full p-4 rounded-xl border border-border bg-muted/60 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 backdrop-blur-md resize-none"
            rows={3}
          />
        </div>

        {/* ── Generate Report Button ─────────────────── */}
        <motion.button
          type="button"
          onClick={() => setShowReport(true)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full flex items-center justify-center gap-2.5 rounded-xl py-4 text-sm font-semibold",
            "bg-primary/90 text-primary-foreground shadow-md hover:bg-primary transition-colors",
            "active:scale-[0.98] min-h-14"
          )}
        >
          <HugeiconsIcon icon={Stethoscope02Icon} className="h-5 w-5" aria-hidden="true" />
          {t("symptomTracker.generateReport")}
        </motion.button>
      </section>

      {/* ── Doctor Summary Report Dialog ──────────── */}
      <DoctorSummaryReport
        open={showReport}
        onClose={() => setShowReport(false)}
        checkedSymptomIds={checked}
        notes={notes}
        patientName={patientName}
      />
    </>
  );
}
