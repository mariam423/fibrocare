"use client";

/**
 * FogToolkitCard — the toolkit's entry point into the Fog Shield route.
 *
 * A small static card that shows a low-calm clearing sphere (the "fog" state)
 * and links to `/fog-shield` to run the grounding tools.
 */

import React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, BrainIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { FogClearingSphere3D } from "@/components/ui/FogClearingSphere3D";

export function FogToolkitCard() {
  const { t } = useLanguage();

  return (
    <DepthCard tilt={3}>
      <Card className="h-full overflow-hidden border border-teal-500/15 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-depth-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 backdrop-blur-sm">
              <HugeiconsIcon icon={BrainIcon} className="h-5 w-5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-xl text-zinc-900 dark:text-white font-semibold">
                {t("toolkit.fogCard.title")}
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground">
                {t("toolkit.fogCard.subtitle")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <FogClearingSphere3D calm={0.3} className="h-[130px]" />
          <Button render={<Link href="/fog-shield" />} className="mt-4 w-full rounded-full">
            {t("toolkit.fogCard.open")}
            <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>
    </DepthCard>
  );
}