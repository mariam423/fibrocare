"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  HeartIcon,
  ArrowLeft01Icon,
  Moon02Icon,
  Sun02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useHealth } from "@/context/HealthContext";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/health-logs", label: "Health Logs" },
  { href: "/resources", label: "Resources" },
  { href: "/profile", label: "Profile" },
];

interface AppHeaderProps {
  backHref?: string;
  backLabel?: string;
}

export default function AppHeader({ backHref, backLabel }: AppHeaderProps) {
  const { isDark, toggleDark } = useHealth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/15 p-1.5">
            <HugeiconsIcon
              icon={HeartIcon}
              className="h-6 w-6 text-primary"
              aria-hidden="true"
            />
          </div>
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-foreground"
          >
            FibroCare
          </Link>
        </div>

        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              className="h-4 w-4"
              aria-hidden="true"
            />
            {backLabel ?? "Back to Dashboard"}
          </Link>
        ) : (
          <>
            <nav
              className="hidden md:flex items-center gap-1 text-base font-medium text-muted-foreground"
              aria-label="Primary"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center rounded-lg px-3 py-2 transition-colors hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    pathname === link.href &&
                      "bg-primary/10 text-primary font-semibold hover:bg-primary/15"
                  )}
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Button
              onClick={toggleDark}
              variant="ghost"
              size="icon"
              className="rounded-full bg-muted hover:bg-muted/80"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <HugeiconsIcon
                  icon={Sun02Icon}
                  className="h-5 w-5 text-amber-400"
                  aria-hidden="true"
                />
              ) : (
                <HugeiconsIcon
                  icon={Moon02Icon}
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
              )}
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
