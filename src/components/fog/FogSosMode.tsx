"use client";

/**
 * FogSosMode — the Fog Shield's "this is scary, not just hard" protocol.
 *
 * Four short, loud, human steps for when the fog feels overwhelming: name
 * three things you can see, cold water on the wrists/face, one 4-7-8 breath,
 * and a move toward another person. Tapping "I feel steadier now" reports a
 * large calm gain to the hero sphere. Contact buttons only render as real
 * `tel:` links when the page provides numbers — otherwise the module stays
 * guidance-only (it must never invent a phone number).
 */

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  GlassWaterIcon,
  MedicalMaskIcon,
  TelephoneIcon,
  FirstAidKitIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

interface FogSosModeProps {
  /** Large calm gain once the user feels steadier. */
  onSettled: (delta: number) => void;
  /** Optional dialable numbers — render real tel: links when provided. */
  clinicPhone?: string;
  trustedPhone?: string;
}

const STEPS = [
  { key: "step1", icon: MedicalMaskIcon },
  { key: "step2", icon: GlassWaterIcon },
  { key: "step3", icon: MedicalMaskIcon },
  { key: "step4", icon: TelephoneIcon },
] as const;

export function FogSosMode({ onSettled, clinicPhone, trustedPhone }: FogSosModeProps) {
  const { t } = useLanguage();
  const [steadier, setSteadier] = useState(false);

  const handleSteadier = () => {
    setSteadier(true);
    onSettled(0.6);
  };

  return (
    <Card className="h-full border border-rose-500/15 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
      <CardHeader className="border-b border-rose-500/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 backdrop-blur-sm">
            <HugeiconsIcon icon={Alert02Icon} className="h-5 w-5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-xl text-zinc-900 dark:text-white font-semibold">
              {t("fog.sos.title")}
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              {t("fog.sos.subtitle")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5 sm:p-6">
        <ol className="space-y-2">
          {STEPS.map((step, i) => (
            <li
              key={step.key}
              className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 px-3 py-3 text-sm"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400" aria-hidden="true">
                <HugeiconsIcon icon={step.icon} className="h-4 w-4" />
              </span>
              <span>
                <span className="block font-semibold">
                  {i + 1}. {t(`fog.sos.${step.key}`)}
                </span>
                <span className="text-muted-foreground">{t(`fog.sos.${step.key}desc`)}</span>
              </span>
            </li>
          ))}
        </ol>

        {/* Contact affordances (real links only when a number is provided). */}
        {(clinicPhone || trustedPhone) && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {clinicPhone && (
              <a href={`tel:${clinicPhone}`} className="rounded-full border border-input bg-card/60 px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-muted">
                <HugeiconsIcon icon={FirstAidKitIcon} className="me-1.5 inline h-4 w-4" aria-hidden="true" />
                {t("fog.sos.callClinic")}
              </a>
            )}
            {trustedPhone && (
              <a href={`tel:${trustedPhone}`} className="rounded-full border border-input bg-card/60 px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-muted">
                <HugeiconsIcon icon={TelephoneIcon} className="me-1.5 inline h-4 w-4" aria-hidden="true" />
                {t("fog.sos.callTrusted")}
              </a>
            )}
          </div>
        )}

        {steadier ? (
          <p
            className="flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-300"
            aria-live="polite"
          >
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4" aria-hidden="true" />
            {t("fog.sos.steadier")}
          </p>
        ) : (
          <Button onClick={handleSteadier} variant="destructive" className="w-full rounded-full">
            {t("fog.sos.steady")}
          </Button>
        )}

        <p className="text-center text-xs text-muted-foreground">
          {t("fog.sos.emergency")}
        </p>
      </CardContent>
    </Card>
  );
}