"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon, Loading01Icon } from "@hugeicons/core-free-icons";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { WordReveal } from "@/components/ui/WordReveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { createConsultation, getVerifiedDoctors } from "@/app/pro/actions";

export default function NewConsultationPage() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const isRtl = locale === "ar";
  const [doctors, setDoctors] = useState<{ id: string; name: string | null; email: string }[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVerifiedDoctors().then((result) => {
      if (result.success && result.data) {
        setDoctors(result.data);
      }
      setLoading(false);
    });
  }, []);

  const handleCreate = () => {
    if (!selectedDoctor || !subject.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createConsultation({
        doctorId: selectedDoctor,
        subject,
      });
      if (result.success && result.data) {
        router.push(`/pro/consultations/${result.data.id}`);
      } else {
        setError(result.error ?? "Failed to create consultation.");
      }
    });
  };

  return (
    <RouteTransition>
      <main className="container mx-auto max-w-xl px-4 py-12 space-y-6">
        <ScrollReveal>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              render={<Link href="/pro/consultations" />}
            >
              <HugeiconsIcon icon={isRtl ? ArrowRight01Icon : ArrowLeft01Icon} className="h-4 w-4" />
            </Button>
            <WordReveal
              as="h1"
              text={t("consultation.newConsultation")}
              className="text-xl font-bold tracking-tight"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("consultation.startThread")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <HugeiconsIcon icon={Loading01Icon} className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : doctors.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {t("consultation.noDoctorsAvailable")}
                </p>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">{t("consultation.selectDoctor")}</label>
                    <select
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      dir="auto"
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="">{t("consultation.selectDoctorPlaceholder")}</option>
                      {doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name ?? doc.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">{t("consultation.subject")}</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      dir="auto"
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder={t("consultation.subjectPlaceholder")}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button
                    onClick={handleCreate}
                    disabled={isPending || !selectedDoctor || !subject.trim()}
                    className="w-full"
                  >
                    {isPending && (
                      <HugeiconsIcon icon={Loading01Icon} className="me-2 h-4 w-4 animate-spin" />
                    )}
                    {t("consultation.startThread")}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </ScrollReveal>
      </main>
    </RouteTransition>
  );
}
