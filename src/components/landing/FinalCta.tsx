"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { HeartIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/Magnetic";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { WordReveal } from "@/components/ui/WordReveal";
import { useLanguage } from "@/context/LanguageContext";

/** Decorative ambient glows echoing the hero's dawn horizon. */
function DuskScenery() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="breathe-glow absolute left-1/2 top-8 h-36 w-36 -translate-x-1/2 rounded-full bg-primary/15 blur-2xl" />
      <span className="absolute -bottom-16 start-[8%] h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      <span className="absolute -bottom-20 end-[12%] h-56 w-56 rounded-full bg-muted-foreground/5 blur-3xl" />
    </div>
  );
}

export function FinalCta() {
  const { t } = useLanguage();
  return (
    <section className="px-4 pb-16 sm:px-6 md:pb-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="surface-crisp glow-card relative overflow-hidden rounded-[2.5rem] px-6 py-16 text-center shadow-beautiful-lg sm:px-12 md:py-20">
            <DuskScenery />

            <div className="relative z-10 mx-auto max-w-2xl">
              <span className="icon-badge mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                <HugeiconsIcon icon={HeartIcon} className="h-5 w-5" aria-hidden="true" />
              </span>

              <h2 className="mt-8 text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                <WordReveal
                  text={t("landing.final.heading")}
                  amount={0.5}
                />
              </h2>

              <WordReveal
                as="p"
                text={t("landing.final.copy")}
                delay={0.15}
                amount={0.5}
                className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
              />

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Magnetic strength={0.15} hoverScale={1.02} tapScale={0.97}>
                  <Button
                    size="lg"
                    nativeButton={false}
                    className="rounded-full px-7"
                    render={<Link href="/signup" />}
                  >
                    {t("landing.start")}
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      data-icon="inline-end"
                      className="rtl:scale-x-[-1]"
                      aria-hidden="true"
                    />
                  </Button>
                </Magnetic>
              </div>

              <p className="mt-5 text-sm text-muted-foreground">
                {t("landing.final.free")}
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
