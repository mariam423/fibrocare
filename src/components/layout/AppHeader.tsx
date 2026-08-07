"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ArrowLeft, Moon, Sun } from "lucide-react";
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
            <Heart className="h-6 w-6 text-primary" />
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
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel ?? "Back to Dashboard"}
          </Link>
        ) : (
          <>
            <nav className="hidden md:flex items-center gap-6 text-base font-medium text-muted-foreground">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "transition-colors hover:text-foreground",
                    pathname === link.href && "text-primary font-semibold"
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
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-primary" />
              )}
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
