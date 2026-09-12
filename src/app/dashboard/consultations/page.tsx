"use client";

/**
 * Consultations & Symptom Structuring hub (/dashboard/consultations).
 *
 * A single structured surface that unifies the patient's consultation
 * workflow:
 *
 *  1. AI Symptom Structuring — paste a free-text description, the AI
 *     organizes it into a clear clinical message with categories and
 *     suggested questions (server-validated + sanitized).
 *  2. Clinical Brief preview — the patient's own 30-day AI clinical
 *     executive brief, rendered with the same localized fields as the
 *     reports page, ready to share with a doctor.
 *  3. Secure messaging feed — the patient's consultation threads with
 *     an inline composer per thread; every send goes through
 *     Zod-validated, session-checked server actions.
 *
 * Design: Midnight Emerald glass cards on a soft emerald wash, depth
 * shadows, 3D tilt on the hero cards. Full RTL parity via logical
 * properties, `dir="auto"` on user content, and localized separators.
 */

import React, { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiMagicIcon,
  CheckCircle,
  ClipboardIcon,
  InformationCircleIcon,
  Loading01Icon,
  SentIcon,
  Shield01Icon,
  Time04Icon,
} from "@hugeicons/core-free-icons";
import { RouteTransition } from "@/components/ui/RouteTransition";
import GlobalNavHeader from "@/components/layout/GlobalNavHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { DepthCard } from "@/components/ui/DepthCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useProFeature } from "@/hooks/useProFeature";
import { ProPreviewBanner } from "@/components/pricing/ProFeatureGate";
import { PricingModal } from "@/components/pricing/PricingModal";
import {
  cleanBriefText,
} from "@/lib/ai/clinical-brief/format";
import {
  buildLocalizedDiscussionPoints,
  flareDaysKey,
  localizeBriefHeadline,
  trendKeyByValue,
  velocityKeyByValue,
} from "@/lib/ai/clinical-brief/localize";
import type { ClinicalBrief } from "@/lib/ai/clinical-brief/types";
import {
  getConsultations,
  submitConsultationMessage,
  submitStructuredSymptoms,
  submitSymptomIntake,
} from "@/app/pro/actions";

interface Consultation {
  id: string;
  subject: string;
  status: string;
  updatedAt: Date | string;
  patient: { id: string; name: string | null };
  doctor: { id: string; name: string | null };
  messages: { content: string }[];
}

interface StructuredIntake {
  structuredMessage: string;
  categories: { label: string; details: string }[];
  suggestedQuestions: string[];
}

/** Map a free-form AI category label onto the SymptomCategory enum. */
export function categoryToEnum(label: string): "PHYSICAL" | "COGNITIVE" | "MOOD" {
  const l = label.toLowerCase();
  if (/(mood|anx|depress|emotion|مزاج|قلق|اكتئاب|عاطف)/.test(l)) return "MOOD";
  if (/(cognit|brain|memory|focus|fog|sleep|معرف|ذاكرة|تركيز|دماغ|نوم)/.test(l)) {
    return "COGNITIVE";
  }
  return "PHYSICAL";
}

export default function ConsultationsHubPage() {
  const router = useRouter();
  const { t, locale, dir } = useLanguage();
  const { isPro, canUse } = useProFeature();
  const isRtl = locale === "ar";

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);

  // AI symptom structuring -------------------------------------------------
  const [intakeText, setIntakeText] = useState("");
  const [persistLog, setPersistLog] = useState(false);
  const [structured, setStructured] = useState<StructuredIntake | null>(null);
  const [severities, setSeverities] = useState<Record<string, number>>({});
  const [intakeError, setIntakeError] = useState<string | null>(null);
  const [isStructuring, startStructuring] = useTransition();

  // Review & share (structured submission) ---------------------------------
  const [logToRecord, setLogToRecord] = useState(true);
  const [sendThreadId, setSendThreadId] = useState("");
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, startSubmitting] = useTransition();

  // Clinical brief ---------------------------------------------------------
  const [brief, setBrief] = useState<ClinicalBrief | null>(null);
  const [briefLoading, setBriefLoading] = useState(canUse("reports:clinical-brief"));

  // Messaging --------------------------------------------------------------
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // Pricing modal (Pro upsell) --------------------------------------------
  const [pricingOpen, setPricingOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getConsultations().then((result) => {
      if (!cancelled) {
        if (result.success && result.data) setConsultations(result.data as Consultation[]);
        setLoadingThreads(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!canUse("reports:clinical-brief")) return;
    let cancelled = false;
    fetch("/api/ai/clinical-brief")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.brief) setBrief(data.brief as ClinicalBrief);
      })
      .catch(() => {
        /* graceful: no brief */
      })
      .finally(() => {
        if (!cancelled) setBriefLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canUse]);

  const handleStructure = useCallback(() => {
    if (!intakeText.trim()) return;
    setIntakeError(null);
    setSubmitStatus(null);
    setSubmitError(null);
    startStructuring(async () => {
      const result = await submitSymptomIntake({ raw: intakeText, persist: persistLog });
      if (result.success && result.data) {
        setStructured(result.data);
        setSeverities(
          Object.fromEntries(result.data.categories.map((cat) => [cat.label, 5]))
        );
        setIntakeText("");
      } else {
        setIntakeError(result.error ?? t("consultationsHub.intakeFailed"));
      }
    });
  }, [intakeText, persistLog, t]);

  /** Persist the reviewed severities and/or share the summary with a doctor. */
  const handleStructuredSubmit = useCallback(() => {
    if (!structured) return;
    setSubmitError(null);
    setSubmitStatus(null);
    startSubmitting(async () => {
      const result = await submitStructuredSymptoms({
        persist: logToRecord,
        symptoms: structured.categories.map((cat) => ({
          symptom: cat.label,
          severity: severities[cat.label] ?? 5,
          category: categoryToEnum(cat.label),
        })),
        message: sendThreadId ? structured.structuredMessage : undefined,
        consultationId: sendThreadId || undefined,
      });
      if (result.success && result.data) {
        const parts: string[] = [];
        if (result.data.loggedCount > 0) {
          parts.push(t("consultationsHub.loggedPart", { count: result.data.loggedCount }));
        }
        if (result.data.messageSent) parts.push(t("consultationsHub.sentPart"));
        setSubmitStatus(parts.join(" · "));
        const refreshed = await getConsultations();
        if (refreshed.success && refreshed.data) {
          setConsultations(refreshed.data as Consultation[]);
        }
      } else {
        setSubmitError(result.error ?? t("consultationsHub.submitFailed"));
      }
    });
  }, [structured, logToRecord, sendThreadId, severities, t]);

  const handleSend = useCallback(
    async (consultationId: string) => {
      const content = (drafts[consultationId] ?? "").trim();
      if (!content) return;
      setSendError(null);
      setSendingId(consultationId);
      const result = await submitConsultationMessage({ consultationId, content });
      if (result.success && result.data) {
        setDrafts((prev) => ({ ...prev, [consultationId]: "" }));
        // Refresh the thread list so the preview + ordering update.
        const refreshed = await getConsultations();
        if (refreshed.success && refreshed.data) {
          setConsultations(refreshed.data as Consultation[]);
        }
      } else {
        setSendError(result.error ?? t("consultationsHub.sendFailed"));
      }
      setSendingId(null);
    },
    [drafts, t]
  );

  const openThreads = useMemo(
    () => consultations.filter((c) => c.status === "open"),
    [consultations]
  );

  return (
    <RouteTransition>
      <GlobalNavHeader />
      <main
        dir={dir}
        className="container mx-auto max-w-6xl px-4 pb-16 pt-[calc(env(safe-area-inset-top)+1.5rem)] sm:px-6 sm:pt-[calc(env(safe-area-inset-top)+2rem)]"
      >
        {/* Hero ---------------------------------------------------------- */}
        <ScrollReveal>
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {t("consultationsHub.title")}
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
                {t("consultationsHub.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push("/pro/consultations/new")}>
                {t("consultation.newConsultation")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push("/pro/consultations")}>
                {t("consultationsHub.viewAllThreads")}
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* Pro gate banner for the AI surfaces (messaging itself is RBAC'd server-side) */}
        {!isPro && (
          <div className="mb-6">
            <ProPreviewBanner onUpgrade={() => setPricingOpen(true)} />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* AI Symptom Structuring ------------------------------------- */}
          <ScrollReveal>
            <DepthCard tilt={4}>
              <Card className="border-primary/20 bg-primary/5 shadow-depth-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <HugeiconsIcon icon={AiMagicIcon} className="h-4 w-4 text-primary" aria-hidden="true" />
                    {t("consultationsHub.intakeTitle")}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t("consultationsHub.intakeDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <textarea
                    value={intakeText}
                    onChange={(e) => setIntakeText(e.target.value)}
                    placeholder={t("consultation.symptomPlaceholder")}
                    dir="auto"
                    maxLength={4000}
                    aria-label={t("consultationsHub.intakeTitle")}
                    className="min-h-[110px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    disabled={isStructuring}
                  />
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={persistLog}
                      onChange={(e) => setPersistLog(e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-emerald-600"
                    />
                    {t("consultationsHub.persistOption")}
                  </label>
                  {intakeError && (
                    <p role="alert" className="text-xs text-destructive">
                      {intakeError}
                    </p>
                  )}
                  <Button
                    onClick={handleStructure}
                    disabled={isStructuring || intakeText.trim().length < 10}
                    className="w-full rounded-xl"
                  >
                    {isStructuring ? (
                      <>
                        <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" aria-hidden="true" />
                        {t("consultationsHub.processing")}
                      </>
                    ) : (
                      <>
                        <HugeiconsIcon icon={AiMagicIcon} className="h-4 w-4" aria-hidden="true" />
                        {t("consultationsHub.structureAction")}
                      </>
                    )}
                  </Button>

                  {structured && (
                    <div className="space-y-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          <HugeiconsIcon icon={CheckCircle} className="h-4 w-4" aria-hidden="true" />
                          {t("consultation.structuredMessage")}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            void navigator.clipboard?.writeText(structured.structuredMessage);
                          }}
                          className="h-7 gap-1 px-2 text-xs"
                        >
                          <HugeiconsIcon icon={ClipboardIcon} className="h-3.5 w-3.5" aria-hidden="true" />
                          {t("consultationsHub.copy")}
                        </Button>
                      </div>
                      <p dir="auto" className="whitespace-pre-wrap text-sm leading-relaxed">
                        {structured.structuredMessage}
                      </p>
                      {structured.categories.length > 0 && (
                        <div className="space-y-2">
                          {structured.categories.map((cat) => {
                            const sev = severities[cat.label] ?? 5;
                            const sevColor =
                              sev <= 3
                                ? "text-emerald-600 dark:text-emerald-400"
                                : sev <= 6
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-rose-600 dark:text-rose-400";
                            return (
                              <div
                                key={cat.label}
                                className="rounded-xl border border-border/70 bg-background/60 p-2.5"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className="truncate text-xs font-semibold"
                                    title={cat.details}
                                  >
                                    {cat.label}
                                  </span>
                                  <span className={`text-xs font-bold tabular-nums ${sevColor}`}>
                                    {sev}/10
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min={1}
                                  max={10}
                                  step={1}
                                  value={sev}
                                  onChange={(e) =>
                                    setSeverities((prev) => ({
                                      ...prev,
                                      [cat.label]: Number(e.target.value),
                                    }))
                                  }
                                  aria-label={`${cat.label} — ${t("consultationsHub.severitySlider")}`}
                                  className="mt-1.5 w-full accent-emerald-600"
                                  dir="ltr"
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {structured.suggestedQuestions.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground">
                            {t("consultation.suggestedQuestions")}
                          </p>
                          <ul className="mt-1 list-disc space-y-0.5 ms-5 text-xs">
                            {structured.suggestedQuestions.map((q) => (
                              <li key={q} dir="auto">{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Review & share -------------------------------- */}
                      <div className="space-y-2.5 rounded-xl border border-border/70 bg-background/60 p-3">
                        <p className="text-xs font-semibold">
                          {t("consultationsHub.reviewShareTitle")}
                        </p>
                        <label className="flex cursor-pointer items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={logToRecord}
                            onChange={(e) => setLogToRecord(e.target.checked)}
                            className="h-4 w-4 rounded border-border accent-emerald-600"
                          />
                          {t("consultationsHub.logToRecordOption")}
                        </label>
                        {openThreads.length > 0 && (
                          <div className="space-y-1">
                            <label
                              htmlFor="share-thread-select"
                              className="text-xs font-medium text-muted-foreground"
                            >
                              {t("consultationsHub.shareThreadLabel")}
                            </label>
                            <select
                              id="share-thread-select"
                              value={sendThreadId}
                              onChange={(e) => setSendThreadId(e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                            >
                              <option value="">
                                {t("consultationsHub.shareThreadPlaceholder")}
                              </option>
                              {openThreads.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.subject}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        <Button
                          onClick={handleStructuredSubmit}
                          disabled={isSubmitting || (!logToRecord && !sendThreadId)}
                          className="w-full rounded-xl"
                        >
                          {isSubmitting ? (
                            <>
                              <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" aria-hidden="true" />
                              {t("consultationsHub.submitting")}
                            </>
                          ) : (
                            <>
                              <HugeiconsIcon icon={CheckCircle} className="h-4 w-4" aria-hidden="true" />
                              {t("consultationsHub.submitAction")}
                            </>
                          )}
                        </Button>
                        {submitStatus && (
                          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                            {submitStatus}
                          </p>
                        )}
                        {submitError && (
                          <p role="alert" className="text-xs text-destructive">
                            {submitError}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </DepthCard>
          </ScrollReveal>

          {/* Clinical brief preview ------------------------------------- */}
          <ScrollReveal delay={0.08}>
            <DepthCard tilt={4} delay={0.05}>
              <Card className="shadow-depth-sm ring-1 ring-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <HugeiconsIcon icon={InformationCircleIcon} className="h-5 w-5 text-primary" aria-hidden="true" />
                    {t("reports.brief.title")}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t("consultationsHub.briefDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent dir={dir} className="space-y-3 text-sm">
                  {briefLoading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" aria-hidden="true" />
                      {t("consultationsHub.briefLoading")}
                    </div>
                  )}
                  {!briefLoading && !brief && (
                    <p className="text-xs text-muted-foreground">{t("consultationsHub.briefEmpty")}</p>
                  )}
                  {brief && (
                    <>
                      <p className="font-medium leading-relaxed">
                        {localizeBriefHeadline(brief, locale, t)}
                      </p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="rounded-xl border bg-muted/30 p-2.5">
                          <p className="text-xs font-semibold text-muted-foreground">
                            {t("reports.brief.flareFrequency")}
                          </p>
                          <p className="mt-0.5">
                            {locale === "ar"
                              ? `${t(flareDaysKey(brief.flareFrequency.flareDays), { count: brief.flareFrequency.flareDays })} · ${t("reports.brief.ratePerMonth", { perMonth: brief.flareFrequency.perMonth })} · ${t(trendKeyByValue[brief.flareFrequency.trend])}`
                              : `${brief.flareFrequency.flareDays} ${t("reports.brief.flareDaysUnit")} · ~${brief.flareFrequency.perMonth}/mo · ${brief.flareFrequency.trend}`}
                          </p>
                        </div>
                        <div className="rounded-xl border bg-muted/30 p-2.5">
                          <p className="text-xs font-semibold text-muted-foreground">
                            {t("reports.brief.velocity")}
                          </p>
                          <p className="mt-0.5">
                            {locale === "ar"
                              ? t(velocityKeyByValue[brief.painProfile.velocity])
                              : brief.painProfile.velocity}
                            {brief.painProfile.velocityDelta !== null
                              ? ` (Δ ${brief.painProfile.velocityDelta > 0 ? "+" : ""}${brief.painProfile.velocityDelta})`
                              : ""}
                          </p>
                        </div>
                      </div>
                      {brief.suggestedDiscussionPoints.length > 0 && (
                        <div>
                          <p className="mb-1 text-xs font-semibold text-muted-foreground">
                            {t("reports.brief.discussion")}
                          </p>
                          <ul className="list-disc space-y-0.5 ms-5 text-xs">
                            {(locale === "ar"
                              ? buildLocalizedDiscussionPoints(brief, t)
                              : brief.suggestedDiscussionPoints.map(cleanBriefText)
                            ).map((point) => (
                              <li key={point}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <HugeiconsIcon icon={Shield01Icon} className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {locale === "ar"
                          ? t("reports.brief.caveat", {
                              logged: Math.round(
                                (brief.functionalCapacity.loggingAdherencePct * brief.periodDays) / 100
                              ),
                              total: brief.periodDays,
                              adherence: brief.functionalCapacity.loggingAdherencePct,
                            })
                          : cleanBriefText(brief.dataCaveat)}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </DepthCard>
          </ScrollReveal>
        </div>

        {/* Secure messaging feed ------------------------------------------ */}
        <ScrollReveal delay={0.12}>
          <div className="mt-6">
          <DepthCard tilt={2}>
            <Card className="shadow-depth-sm ring-1 ring-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <HugeiconsIcon icon={SentIcon} className="h-5 w-5 text-primary" aria-hidden="true" />
                  {t("consultationsHub.messagingTitle")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t("consultationsHub.messagingDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingThreads && (
                  <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                    <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" aria-hidden="true" />
                    {t("consultationsHub.loadingThreads")}
                  </div>
                )}
                {!loadingThreads && consultations.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center">
                    <p className="text-sm text-muted-foreground">{t("consultation.noConsultations")}</p>
                    <Button
                      size="sm"
                      className="mt-3 rounded-xl"
                      onClick={() => router.push("/pro/consultations/new")}
                    >
                      {t("consultation.newConsultation")}
                    </Button>
                  </div>
                )}
                {openThreads.map((c) => {
                  const other = c.doctor?.name ?? t("consultation.unknown");
                  const lastMessage = c.messages[0]?.content ?? "";
                  return (
                    <div
                      key={c.id}
                      className="space-y-2 rounded-2xl border border-border/70 bg-muted/20 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p dir="auto" className="truncate text-sm font-semibold">
                            {c.subject}
                          </p>
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <HugeiconsIcon icon={Time04Icon} className="h-3.5 w-3.5" aria-hidden="true" />
                            {t("consultation.doctorLabel")} · {other}
                          </p>
                        </div>
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                          {t("consultation.open")}
                        </span>
                      </div>
                      {lastMessage && (
                        <p dir="auto" className="line-clamp-2 rounded-xl bg-background/60 px-3 py-2 text-xs text-muted-foreground">
                          {lastMessage}
                        </p>
                      )}
                      <div className="flex items-start gap-2">
                        <textarea
                          value={drafts[c.id] ?? ""}
                          onChange={(e) =>
                            setDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              void handleSend(c.id);
                            }
                          }}
                          placeholder={t("consultation.typeMessage")}
                          dir="auto"
                          rows={2}
                          maxLength={5000}
                          aria-label={`${t("consultation.typeMessage")} — ${c.subject}`}
                          className="min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                          disabled={sendingId === c.id}
                        />
                        <Button
                          size="sm"
                          className="mt-0.5 rounded-xl"
                          onClick={() => void handleSend(c.id)}
                          disabled={sendingId === c.id || !(drafts[c.id] ?? "").trim()}
                          aria-label={t("consultation.send")}
                        >
                          {sendingId === c.id ? (
                            <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <HugeiconsIcon
                              icon={SentIcon}
                              className={isRtl ? "h-4 w-4 rtl:-scale-x-100" : "h-4 w-4"}
                              aria-hidden="true"
                            />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {sendError && (
                  <p role="alert" className="text-xs text-destructive">
                    {sendError}
                  </p>
                )}
              </CardContent>
            </Card>
          </DepthCard>
          </div>
        </ScrollReveal>
      </main>
      <PricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} />
    </RouteTransition>
  );
}
