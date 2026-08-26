"use client";

import React, { useEffect, useState, useRef, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MessageOutgoing01Icon,
  Loading01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PatientAssistant } from "@/components/pro/PatientAssistant";
import { ClinicalMemo } from "@/components/pro/ClinicalMemo";
import { DoctorCopilot } from "@/components/pro/DoctorCopilot";
import { useLanguage } from "@/context/LanguageContext";
import { useProFeature } from "@/hooks/useProFeature";
import {
  getConsultationMessages,
  sendMessage,
} from "@/app/pro/actions";

interface Message {
  id: string;
  content: string;
  createdAt: Date | string;
  sender: { id: string; name: string | null };
}

export default function ConsultationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { role } = useProFeature();
  const isRtl = locale === "ar";
  const isDoctor = role === "doctor";
  const consultationId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, startTransition] = useTransition();
  const [showPatientAssistant, setShowPatientAssistant] = useState(false);
  const [structuredResult, setStructuredResult] = useState<{
    structuredMessage: string;
    categories: { label: string; details: string }[];
    suggestedQuestions: string[];
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getConsultationMessages(consultationId).then((result) => {
      if (result.success && result.data) {
        setMessages(result.data);
      }
      setLoading(false);
    });
  }, [consultationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = newMessage.trim();
    if (!text) return;
    startTransition(async () => {
      const result = await sendMessage(consultationId, text);
      if (result.success && result.data) {
        setMessages((prev) => [
          ...prev,
          {
            id: result.data!.id,
            content: result.data!.content,
            createdAt: result.data!.createdAt as unknown as string,
            sender: { id: "current", name: "You" },
          },
        ]);
        setNewMessage("");
      }
    });
  };

  const lastPatientMessage =
    messages.length > 0
      ? [...messages].reverse().find((m) => m.sender.id !== "current")?.content ?? ""
      : "";

  return (
    <RouteTransition>
      <main className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
        <ScrollReveal>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              render={<Link href="/pro/consultations" />}
            >
              <HugeiconsIcon icon={isRtl ? ArrowRight01Icon : ArrowLeft01Icon} className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold tracking-tight">
              {t("consultation.messages")}
            </h1>
          </div>
        </ScrollReveal>

        {isDoctor && (
          <ScrollReveal delay={0.05}>
            <ClinicalMemo consultationId={consultationId} />
          </ScrollReveal>
        )}

        {!isDoctor && (
          <ScrollReveal delay={0.05}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPatientAssistant(!showPatientAssistant)}
            >
              {showPatientAssistant ? t("consultation.hide") : t("consultation.symptomHelper")}
            </Button>
            {showPatientAssistant && (
              <div className="mt-3">
                <PatientAssistant
                  consultationId={consultationId}
                  onStructured={(result) => {
                    setStructuredResult(result);
                    setNewMessage(result.structuredMessage);
                    setShowPatientAssistant(false);
                  }}
                />
              </div>
            )}
          </ScrollReveal>
        )}

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

        <ScrollReveal delay={0.1}>
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <HugeiconsIcon
                  icon={Loading01Icon}
                  className="h-5 w-5 animate-spin text-muted-foreground"
                />
              </div>
            ) : messages.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t("consultation.noMessages")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.sender.id === "current";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p
                        className={`mt-1 text-[10px] ${
                          isOwn
                            ? "text-primary-foreground/60"
                            : "text-muted-foreground"
                        }`}
                      >
                        {msg.sender.name ?? t("consultation.unknown")}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollReveal>

        {isDoctor && lastPatientMessage && (
          <ScrollReveal delay={0.15}>
            <DoctorCopilot
              consultationId={consultationId}
              patientMessage={lastPatientMessage}
              onUseDraft={(draft) => setNewMessage(draft)}
            />
          </ScrollReveal>
        )}

        <ScrollReveal delay={0.2}>
          <div className="flex items-end gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t("consultation.typeMessage")}
              rows={2}
              dir="auto"
              className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={sending}
            />
            <Button
              onClick={handleSend}
              disabled={sending || !newMessage.trim()}
              size="icon"
            >
              <HugeiconsIcon icon={MessageOutgoing01Icon} className="h-4 w-4" />
            </Button>
          </div>
        </ScrollReveal>
      </main>
    </RouteTransition>
  );
}
