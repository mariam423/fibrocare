"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true);

export function PwaPrompt() {
  const pathname = usePathname();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(() => isStandalone());
  const [offline, setOffline] = useState<boolean>(
    () => typeof window !== "undefined" && !navigator.onLine
  );

  useEffect(() => {
    if (isStandalone()) return;

    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      if (!isStandalone()) setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstallEvent(null);
      setInstalled(true);
    };
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);

    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Register immediately (registration is async and never blocks first
    // paint), so the worker installs even if the load event already fired
    // before hydration. Registered in every mode — including standalone,
    // where the app still needs to pick up worker updates on subsequent
    // launches. updateViaCache: "none" keeps a stale HTTP-cached sw.js from
    // blocking the browser's 24h worker update check.
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(() => {});
  }, []);

  const handleInstall = useCallback(async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstallEvent(null);
      setInstalled(true);
    }
  }, [installEvent]);

  // Zen is a full-screen focus mode. Keep global install/offline banners out
  // of its visual field and prevent them from competing with its controls.
  // Landing page (/) — the install prompt distracts from the hero; hide it.
  if (pathname === "/zen" || pathname === "/" || installed || isStandalone()) return null;

  if (offline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-24 end-4 z-[60] w-[calc(100vw-2rem)] max-w-sm pointer-events-none print:hidden"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-lg pointer-events-auto">
          <span
            className="size-2 shrink-0 rounded-full bg-amber-500"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 text-card-foreground">
            Offline — your check-ins will stay safe on this device.
          </span>
        </div>
      </div>
    );
  }

  if (!installEvent) return null;

  return (
    <div className="fixed bottom-24 end-4 z-[60] w-[calc(100vw-2rem)] max-w-sm pointer-events-none print:hidden">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-lg pointer-events-auto">
        <span className="min-w-0 flex-1 text-foreground">
          Add <strong>FibroCare</strong> to your home screen for quick access.
        </span>
        <Button size="sm" onClick={handleInstall}>
          Add
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setInstallEvent(null)}
          aria-label="Dismiss"
        >
          &times;
        </Button>
      </div>
    </div>
  );
}