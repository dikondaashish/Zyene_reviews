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

export function MarketingHomeClient() {
    const { fadeInUp, staggerContainer, prefersReducedMotion } = useMarketingHomeMotion();

    return (
        <div className="flex flex-col items-center w-full bg-background text-foreground overflow-hidden font-sans pt-20">
            <MarketingHomeHero
                fadeInUp={fadeInUp}
                staggerContainer={staggerContainer}
                prefersReducedMotion={prefersReducedMotion}
            />
            <MarketingHomeTrustStrip
                fadeInUp={fadeInUp}
                staggerContainer={staggerContainer}
                prefersReducedMotion={prefersReducedMotion}
            />
            <MarketingHomeFeatureMonitor
                fadeInUp={fadeInUp}
                staggerContainer={staggerContainer}
                prefersReducedMotion={prefersReducedMotion}
            />
            <MarketingHomeFeatureAutomation
                fadeInUp={fadeInUp}
                staggerContainer={staggerContainer}
                prefersReducedMotion={prefersReducedMotion}
            />
            <MarketingHomeHowAndTestimonials
                fadeInUp={fadeInUp}
                staggerContainer={staggerContainer}
                prefersReducedMotion={prefersReducedMotion}
            />
            <MarketingHomeComparison
                fadeInUp={fadeInUp}
                staggerContainer={staggerContainer}
                prefersReducedMotion={prefersReducedMotion}
            />
            <MarketingHomePricing fadeInUp={fadeInUp} staggerContainer={staggerContainer} prefersReducedMotion={prefersReducedMotion} />
            <MarketingHomeClosing fadeInUp={fadeInUp} staggerContainer={staggerContainer} prefersReducedMotion={prefersReducedMotion} />
        </div>
    );
}
