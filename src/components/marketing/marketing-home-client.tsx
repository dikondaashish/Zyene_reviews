"use client";

import { useMarketingHomeMotion } from "@/components/marketing/marketing-home/use-marketing-home-motion";
import { MarketingHomeHero } from "@/components/marketing/marketing-home/marketing-home-hero";
import { MarketingHomeTrustStrip } from "@/components/marketing/marketing-home/marketing-home-trust-strip";
import { MarketingHomeFeatureMonitor } from "@/components/marketing/marketing-home/marketing-home-feature-monitor";
import { MarketingHomeFeatureAutomation } from "@/components/marketing/marketing-home/marketing-home-feature-automation";
import { MarketingHomeHowAndTestimonials } from "@/components/marketing/marketing-home/marketing-home-how-testimonials";
import { MarketingHomeComparison } from "@/components/marketing/marketing-home/marketing-home-comparison";
import { MarketingHomePricing } from "@/components/marketing/marketing-home/marketing-home-pricing";
import { MarketingHomeClosing } from "@/components/marketing/marketing-home/marketing-home-closing";
import { FeaturesIntegrationsBarSection } from "@/app/(marketing)/features/features-integrations-bar-section";

export function MarketingHomeClient() {
    const { fadeInUp, staggerContainer, prefersReducedMotion } = useMarketingHomeMotion();
    const props = { fadeInUp, staggerContainer, prefersReducedMotion };

    return (
        <div className="flex flex-col items-center w-full">
            <MarketingHomeHero {...props} />
            <MarketingHomeTrustStrip {...props} />
            <MarketingHomeFeatureMonitor {...props} />
            <MarketingHomeFeatureAutomation {...props} />
            <MarketingHomeHowAndTestimonials {...props} />
            <MarketingHomeComparison {...props} />
            <FeaturesIntegrationsBarSection />
            <MarketingHomePricing {...props} />
            <MarketingHomeClosing {...props} />
        </div>
    );
}
