"use client";

import * as React from "react";
import { ViewTransition } from "react";

/**
 * Wraps a page's root element in a ViewTransition so client-side route
 * navigations crossfade instead of hard-cutting. Old content exits with a
 * quick fade (fade-out); new content enters with a gentle blur + rise
 * (fade-in) that echoes the app's ScrollReveal motion language. All
 * transition animation is disabled under reduced motion via globals.css.
 *
 * Browser back/forward navigation (popstate / bfcache restore) is exempted:
 * the flag set by those events makes the next mounted RouteTransition render
 * its children without the <ViewTransition> wrapper. This prevents a history
 * navigation from leaving the root layout frozen mid-transition.
 */
let isHistoryNavigation = false;

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    isHistoryNavigation = true;
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) isHistoryNavigation = true;
  });
}

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const [skipTransition] = React.useState(isHistoryNavigation);

  React.useEffect(() => {
    if (skipTransition) {
      const reset = window.setTimeout(() => {
        isHistoryNavigation = false;
      }, 0);
      return () => window.clearTimeout(reset);
    }
  }, [skipTransition]);

  if (skipTransition) {
    return <>{children}</>;
  }

  return (
    <ViewTransition
      enter={{ default: "fade-in" }}
      exit={{ default: "fade-out" }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
