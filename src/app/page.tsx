import type { Metadata } from "next";
import { RouteTransition } from "@/components/ui/RouteTransition";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { GentleMarquee } from "@/components/landing/GentleMarquee";
import { TaglineReveal } from "@/components/landing/TaglineReveal";
import { DayStory } from "@/components/landing/DayStory";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { ResourcesSection } from "@/components/landing/ResourcesSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCta } from "@/components/landing/FinalCta";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ToolkitQuickAccess } from "@/components/landing/ToolkitQuickAccess";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FibroCare - A gentle companion for life with fibromyalgia",
  description:
    "Check in daily, spot your flare patterns, and bring your doctor a clear picture. FibroCare is a calm, private companion for living with fibromyalgia.",
};

export default function Home() {
  return (
    <RouteTransition>
      <main className="flex min-h-[100dvh] flex-col -mt-20 sm:-mt-24">
        <ScrollProgress />
        <LandingNav />
        <div className="flex-1">
          <LandingHero />
          <ToolkitQuickAccess />
          <GentleMarquee />
          <TaglineReveal />
          <DayStory />
          <BenefitsSection />
          <HowItWorks />
          <Testimonials />
          <ResourcesSection />
          <FaqSection />
          <FinalCta />
        </div>
        <LandingFooter />
      </main>
    </RouteTransition>
  );
}