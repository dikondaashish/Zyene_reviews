"use client";

import { BillingToggle } from "./pricing-client-billing-toggle";
import { PlatformStatsBadge } from "@/components/marketing/social-proof";

interface PricingClientHeroSectionProps {
    interval: "month" | "year";
    onIntervalChange: (v: "month" | "year") => void;
}

export function PricingClientHeroSection({ interval, onIntervalChange }: PricingClientHeroSectionProps) {
    return (
        <section className="pt-24 pb-16 px-4 text-center bg-background">
            <div className="container mx-auto max-w-4xl">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 mb-6">
                    Simple, Transparent Pricing
                </div>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.05]">
                    Start free. Grow at your pace.
                </h1>
                <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                    No annual contracts. No hidden fees. Cancel anytime.
                    <br />
                    7-day free trial on every paid plan.
                </p>
                <BillingToggle interval={interval} onChange={onIntervalChange} />
                <div className="mt-8 flex justify-center">
                    <PlatformStatsBadge />
                </div>
            </div>
        </section>
    );
}
