"use client";

import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";

interface PricingClientFinalCtaSectionProps {
    signupUrl: string;
}

export function PricingClientFinalCtaSection({ signupUrl }: PricingClientFinalCtaSectionProps) {
    return (
        <MarketingClosingBand
            title="Ready to grow your reviews?"
            text="Start your 7-day free trial. Card required. Your plan bills after the trial unless you cancel, so cancel before it ends and you pay nothing."
            primaryLabel="Start free trial"
            primaryHref={signupUrl}
            secondary={{ label: "Talk to us", href: "mailto:sales@zyenereviews.com?subject=Pricing%20Question" }}
            image={{ src: "/images/industries/hotels-candid-v2.webp", alt: "Hotel receptionist welcoming a guest with luggage at the front desk" }}
            trackLocation="pricing"
        />
    );
}
