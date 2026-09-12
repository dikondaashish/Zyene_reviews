import { MarketingHomeHero } from "@/components/marketing/marketing-home/marketing-home-hero";
import { MarketingHomeTrustStrip } from "@/components/marketing/marketing-home/marketing-home-trust-strip";
import { MarketingHomeWorkflow } from "@/components/marketing/marketing-home/marketing-home-workflow";
import { MarketingHomeIndustries } from "@/components/marketing/marketing-home/marketing-home-industries";
import { MarketingHomeNextSteps } from "@/components/marketing/marketing-home/marketing-home-next-steps";
import { MarketingHomeClosing } from "@/components/marketing/marketing-home/marketing-home-closing";
import { ProductShowcase } from "@/components/marketing/product-tour/product-showcase";
import { MarketingScrollReveal } from "@/components/marketing/marketing-scroll-reveal";
import { HomeLeadWizard } from "@/components/marketing/home-lead-wizard";

export function MarketingHomeClient() {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="home-hero-shell">
        <MarketingHomeHero />
      </div>
      <MarketingScrollReveal className="home-scroll-section" delay={40}>
        <div id="home-product-tour" className="w-full">
          <ProductShowcase />
        </div>
      </MarketingScrollReveal>
      <MarketingScrollReveal className="home-scroll-section" intensity="subtle">
        <MarketingHomeTrustStrip />
      </MarketingScrollReveal>
      <MarketingScrollReveal
        className="home-scroll-section"
        delay={80}
        intensity="prominent"
      >
        <MarketingHomeWorkflow />
      </MarketingScrollReveal>
      <MarketingScrollReveal className="home-scroll-section" delay={100}>
        <MarketingHomeIndustries />
      </MarketingScrollReveal>
      <MarketingScrollReveal className="home-scroll-section" delay={140}>
        <MarketingHomeNextSteps />
      </MarketingScrollReveal>
      <HomeLeadWizard />
      <MarketingScrollReveal
        className="home-scroll-section"
        delay={160}
        intensity="subtle"
      >
        <MarketingHomeClosing />
      </MarketingScrollReveal>
    </div>
  );
}
