"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Chatting01Icon, Loading01Icon, Add01Icon, AiMagicIcon } from "@hugeicons/core-free-icons";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { WordReveal } from "@/components/ui/WordReveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DoctorContentFeed } from "@/components/pro/DoctorContentFeed";
import { PatientAssistant } from "@/components/pro/PatientAssistant";
import { useLanguage } from "@/context/LanguageContext";
import { useProFeature } from "@/hooks/useProFeature";
import { getConsultations, getDoctorPosts } from "@/app/pro/actions";

interface Consultation {
  id: string;
  subject: string;
  status: string;
  updatedAt: Date | string;
  patient: { id: string; name: string | null };
  doctor: { id: string; name: string | null };
  messages: { content: string }[];
}

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string;
  verifiedStatus: string;
  createdAt: Date | string;
  author: { id: string; name: string | null };
}

export default function ProConsultationsPage() {
  const { t } = useLanguage();
  const { role, isPro } = useProFeature();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSymptomHelper, setShowSymptomHelper] = useState(false);
  const [structuredResult, setStructuredResult] = useState<{
    structuredMessage: string;
    categories: { label: string; details: string }[];
    suggestedQuestions: string[];
  } | null>(null);

  const hasAccess = isPro || role === "doctor";

  useEffect(() => {
    if (!hasAccess) {
      // Still load posts and show symptom helper for non-pro users
      getDoctorPosts({ status: "verified", limit: 6 }).then((r) => {
        setPosts(r.success ? (r.data ?? []) : []);
        setLoading(false);
      });
      return;
    }
    Promise.all([
      getConsultations().then((r) => (r.success ? r.data ?? [] : [])),
      getDoctorPosts({ status: "verified", limit: 6 }).then((r) =>
        r.success ? r.data ?? [] : []
      ),
    ]).then(([conslt, pst]) => {
      setConsultations(conslt);
      setPosts(pst);
      setLoading(false);
    });
  }, [hasAccess]);

  return (
    <RouteTransition>
      <main className="container mx-auto max-w-5xl px-4 py-12 space-y-8">
        <ScrollReveal>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
            <div className="flex items-center gap-4 min-w-0 sm:gap-5">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-3xl border border-emerald-500/20 shadow-lg shadow-emerald-950/15 ring-1 ring-emerald-500/10 sm:h-24 sm:w-24">
                <img
                  src="/images/الاستشارات .jpg"
                  alt="Consultations"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 space-y-1">
                <WordReveal
                  as="h1"
                  text={t("consultation.title")}
                  className="text-2xl font-bold tracking-tight"
                />
                <p className="text-muted-foreground">{t("consultation.subtitle")}</p>
              </div>
            </div>
            {hasAccess && role !== "doctor" && (
              <Button render={<Link href="/pro/consultations/new" />} className="shrink-0 self-stretch sm:self-auto">
                <HugeiconsIcon icon={Add01Icon} className="me-2 h-4 w-4" />
                {t("consultation.newConsultation")}
              </Button>
            )}
          </div>
        </ScrollReveal>

        {/* Consultations list — only for users with access */}
        {hasAccess && (
          <ScrollReveal delay={0.1}>
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <HugeiconsIcon icon={Loading01Icon} className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : consultations.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <HugeiconsIcon icon={Chatting01Icon} className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">{t("consultation.noConsultations")}</p>
                  </CardContent>
                </Card>
              ) : (
                consultations.map((c) => (
                  <Link key={c.id} href={`/pro/consultations/${c.id}`}>
                    <Card className="transition-colors hover:bg-muted/50">
                      <CardContent className="flex items-center justify-between py-4">
                        <div className="space-y-1">
                          <p className="font-medium">{c.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {role === "doctor"
                              ? `${t("consultation.patientLabel")}: ${c.patient.name ?? t("consultation.unknown")}`
                              : `${t("consultation.doctorLabel")}: ${c.doctor.name ?? t("consultation.unknown")}`}
                            {" · "}
                            <span
                              className={
                                c.status === "open"
                                  ? "text-emerald-600"
                                  : "text-muted-foreground"
                              }
                            >
                              {c.status === "open"
                                ? t("consultation.open")
                                : t("consultation.closed")}
                            </span>
                          </p>
                        </div>
                        {c.messages.length > 0 && (
                          <p className="max-w-[200px] truncate text-xs text-muted-foreground">
                            {c.messages[0].content}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </ScrollReveal>
        )}

        {/* AI Symptom Helper — available to all users */}
        <ScrollReveal delay={0.15}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <HugeiconsIcon icon={AiMagicIcon} className="h-5 w-5 text-primary" aria-hidden="true" />
                {t("consultation.symptomHelper")}
              </h2>
              {!hasAccess && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSymptomHelper(!showSymptomHelper)}
                >
                  {showSymptomHelper ? t("common.cancel") : t("consultation.symptomHelper")}
                </Button>
              )}
            </div>
            {!hasAccess && !showSymptomHelper && (
              <p className="text-sm text-muted-foreground">
                {t("consultation.symptomHelperDescription")}
              </p>
            )}
            {(!hasAccess ? showSymptomHelper : true) && (
              <PatientAssistant
                consultationId=""
                onStructured={(result) => {
                  setStructuredResult(result);
                  setShowSymptomHelper(false);
                }}
              />
            )}
          </div>
        </ScrollReveal>

        {structuredResult && (
          <ScrollReveal>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="space-y-3 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-primary">{t("consultation.structuredMessage")}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setStructuredResult(null)}
                  >
                    {t("consultation.dismiss")}
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {structuredResult.categories.map((cat) => (
                    <div key={cat.label} className="text-xs">
                      <p className="font-medium">{cat.label}</p>
                      <p className="text-muted-foreground">{cat.details}</p>
                    </div>
                  ))}
                </div>
                {structuredResult.suggestedQuestions.length > 0 && (
                  <div className="text-xs">
                    <p className="font-medium">{t("consultation.suggestedQuestions")}</p>
                    <ul className="mt-1 space-y-0.5 text-muted-foreground">
                      {structuredResult.suggestedQuestions.map((q, i) => (
                        <li key={i}>• {q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>
        )}

        {/* Doctor content feed — shown for non-doctor users */}
        {role !== "doctor" && (
          <ScrollReveal delay={0.2}>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <HugeiconsIcon icon={Loading01Icon} className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : posts.length > 0 ? (
              <DoctorContentFeed posts={posts} />
            ) : null}
          </ScrollReveal>
        )}
      </main>
    </RouteTransition>
  );
}
