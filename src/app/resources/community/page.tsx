"use client";

import React from "react";
import GlobalNavHeader from "@/components/layout/GlobalNavHeader";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { CommunitySection } from "@/components/resources/CommunitySection";

export default function CommunityPage() {

  return (
    <RouteTransition>
    <div>
      <GlobalNavHeader />
      {/* pb-20 keeps the last post's actions clear of the fixed PWA
          install banner on mobile viewports. */}
      <main className="container mx-auto max-w-4xl p-4 pt-[calc(env(safe-area-inset-top)+5rem)] sm:p-6 sm:pt-[calc(env(safe-area-inset-top)+6rem)] lg:p-8 pb-20">
        <CommunitySection />
      </main>
    </div>
    </RouteTransition>
  );
}
