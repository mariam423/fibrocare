"use client";

import React from "react";
import GlobalNavHeader from "@/components/layout/GlobalNavHeader";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { FAQAccordion } from "@/components/resources/FAQAccordion";

export default function FAQPage() {

  return (
    <RouteTransition>
    <div>
      <GlobalNavHeader />
      {/* pb-20 keeps the last accordion item clear of the fixed PWA
          install banner on mobile viewports. */}
      <main className="container mx-auto max-w-4xl p-4 pt-[calc(env(safe-area-inset-top)+5rem)] sm:p-6 sm:pt-[calc(env(safe-area-inset-top)+6rem)] lg:p-8 pb-20">
        <FAQAccordion />
      </main>
    </div>
    </RouteTransition>
  );
}
