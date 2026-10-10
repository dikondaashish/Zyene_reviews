import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SIGNUP_URL } from "@/config/env";
import type { IndustryData } from "@/lib/industries/industry-data";
import { industryAccentVar } from "@/lib/industries/industry-accent-tokens";

export function IndustriesIndustryFinalCtaSection({ data }: { data: IndustryData }) {
    const accent = industryAccentVar(data.accentColor);

    return (
        <section className="py-20 px-4 bg-muted border-t border-border">
            <div className="container mx-auto max-w-3xl text-center">
                <div
                    aria-hidden
                    className="mx-auto mb-6 h-[3px] w-16 rounded-full"
                    style={{ background: accent }}
                />
                <h2 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
                    {data.ctaJoinCopy}
                </h2>
                <p className="text-xl text-muted-foreground mb-10">
                    Start your 7-day free trial today.<br />
                    No credit card lock-in. Cancel before day 7 and pay nothing.
                </p>
                <Button size="lg" className="px-12 py-7 text-[1.05rem] font-semibold rounded-xl" asChild>
                    <Link href={SIGNUP_URL} data-track="trial" data-track-location="industry-cta">
                        Start Your Free Trial <ArrowRight className="ml-2 size-5" />
                    </Link>
                </Button>
                <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                    <Link href="/features" className="hover:text-primary transition-colors duration-[180ms]">See all features →</Link>
                    <Link href="/how-it-works" className="hover:text-primary transition-colors duration-[180ms]">How it works →</Link>
                    <Link href="/industries" className="hover:text-primary transition-colors duration-[180ms]">Other industries →</Link>
                </div>
            </div>
        </section>
    );
}
