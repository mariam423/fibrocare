"use client";

/**
 * Fog Shield — ride out a brain-fog episode here.
 * Route shell; the interactive body lives in FogShieldView so the page can
 * stay a thin, predictable composition like the other toolkit routes.
 */

import React from "react";
import { RouteTransition } from "@/components/ui/RouteTransition";
import GlobalNavHeader from "@/components/layout/GlobalNavHeader";
import { FogShieldView } from "@/components/fog/FogShieldView";

export default function FogShieldPage() {
  return (
    <RouteTransition>
      <div className="min-h-[100dvh] bg-background text-foreground transition-colors duration-500">
        <GlobalNavHeader />

        {/* pb-32 sm:pb-40 keeps the last fog-shield card clear of the
            floating bottom chrome (SOS FAB + PWA install prompt). */}
        <main className="mx-auto max-w-5xl px-4 pb-32 sm:pb-40 pt-[calc(env(safe-area-inset-top)+5rem)] sm:px-6 sm:pt-[calc(env(safe-area-inset-top)+6rem)] lg:px-8 space-y-8">
          <FogShieldView />
        </main>
      </div>
    </RouteTransition>
  );
}