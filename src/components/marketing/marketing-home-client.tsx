import { MarketingHomeHero } from "@/components/marketing/marketing-home/marketing-home-hero";
import { MarketingHomeIntro } from "@/components/marketing/marketing-home/marketing-home-intro";
import { MarketingHomeTrustStrip } from "@/components/marketing/marketing-home/marketing-home-trust-strip";
import { MarketingHomeHowItWorks } from "@/components/marketing/marketing-home/marketing-home-how-it-works";
import { MarketingHomeBento } from "@/components/marketing/marketing-home/marketing-home-bento";
import { MarketingHomePipeline } from "@/components/marketing/marketing-home/marketing-home-pipeline";
import { MarketingHomeIndustries } from "@/components/marketing/marketing-home/marketing-home-industries";
import { MarketingHomeNextSteps } from "@/components/marketing/marketing-home/marketing-home-next-steps";
import { MarketingHomeFaq, MarketingHomeFinalCta } from "@/components/marketing/marketing-home/marketing-home-closing";
import { MarketingScrollReveal } from "@/components/marketing/marketing-scroll-reveal";
import { HomeLeadWizard } from "@/components/marketing/home-lead-wizard";
import { PopularResourcesBlock } from "@/components/marketing/popular-resources-block";

export function MarketingHomeClient() {
  return (
    <div className="marketing-home flex w-full flex-col">
      <div className="home-hero-shell">
        <MarketingHomeHero />
      </div>
      <MarketingHomeTrustStrip />
      <MarketingScrollReveal intensity="subtle">
        <MarketingHomeHowItWorks />
      </MarketingScrollReveal>
      <MarketingHomeIntro />
      <MarketingScrollReveal intensity="subtle">
        <MarketingHomeBento />
      </MarketingScrollReveal>
      <MarketingScrollReveal intensity="subtle">
        <MarketingHomePipeline />
      </MarketingScrollReveal>
      <MarketingScrollReveal intensity="subtle">
        <MarketingHomeIndustries />
      </MarketingScrollReveal>
      <MarketingScrollReveal intensity="subtle">
        <MarketingHomeNextSteps />
      </MarketingScrollReveal>
      <MarketingHomeFaq />
      <PopularResourcesBlock />
      <HomeLeadWizard />
      <MarketingHomeFinalCta />
    </div>
  );
}
