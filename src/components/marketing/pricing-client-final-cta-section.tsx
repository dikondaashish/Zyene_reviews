"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingClientFinalCtaSectionProps {
    signupUrl: string;
}

export function PricingClientFinalCtaSection({ signupUrl }: PricingClientFinalCtaSectionProps) {
    return (
        <section className="py-24 px-4 bg-background">
            <div className="container mx-auto max-w-3xl text-center">
                <h2 className="text-[length:var(--fs-h2)] font-semibold text-foreground mb-4">Ready to grow your reviews?</h2>
                <p className="text-xl text-muted-foreground mb-10">
                    Start your 7-day free trial. Card required. Your selected plan bills automatically after the trial unless you cancel.
                    <br />
                    Cancel before the trial ends and you won&apos;t be charged.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button size="lg" className="px-10 py-7 text-[1.05rem] font-semibold rounded-xl" asChild>
                        <Link href={signupUrl} data-track="trial" data-track-location="pricing">
                            Start Your Free Trial <ArrowRight className="ml-2 size-5" />
                        </Link>
                    </Button>
                    <a
                        href="mailto:sales@zyenereviews.com?subject=Pricing%20Question"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        Have questions? Talk to us →
                    </a>
                </div>
                <p className="mt-6 text-xs text-muted-foreground">
                    Monthly and annual plans. Clear request allowances.
                </p>
            </div>
        </section>
    );
}
