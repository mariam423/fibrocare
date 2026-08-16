import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { HeartIcon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";

interface LegalSection {
  heading: string;
  body: string;
}

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" aria-hidden="true" />
          Back to FibroCare
        </Link>

        <header className="mt-10">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <HugeiconsIcon icon={HeartIcon} className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">{intro}</p>
        </header>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {section.heading}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <footer className="mt-16 border-t border-border pt-6 text-sm text-muted-foreground">
          Questions about these terms? Reach us through the app&rsquo;s support
          area or via the contact link in your account.
        </footer>
      </div>
    </div>
  );
}
