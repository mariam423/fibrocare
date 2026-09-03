"use client";

import React from "react";
import AppHeader from "@/components/layout/AppHeader";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { CommunitySection } from "@/components/resources/CommunitySection";
import { useLanguage } from "@/context/LanguageContext";

export default function CommunityPage() {
  const { t } = useLanguage();

  return (
    <RouteTransition>
    <div>
      <AppHeader backHref="/resources" backLabel={t("nav.backToDashboard")} />
      {/* pb-20 keeps the last post's actions clear of the fixed PWA
          install banner on mobile viewports. */}
      <main className="container mx-auto max-w-4xl p-4 pt-[calc(env(safe-area-inset-top)+5rem)] sm:p-6 sm:pt-[calc(env(safe-area-inset-top)+6rem)] lg:p-8 pb-20">
        <CommunitySection />
      </main>
    </div>
    </RouteTransition>
  );
}
