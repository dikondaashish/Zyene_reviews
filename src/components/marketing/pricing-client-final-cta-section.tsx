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
                <h2 className="text-4xl font-bold text-foreground mb-4">Ready to grow your reviews?</h2>
                <p className="text-xl text-muted-foreground mb-10">
                    Start your 7-day free trial. No credit card lock-in.
                    <br />
                    Cancel before the trial ends and you won&apos;t be charged.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href={signupUrl}>
                        <Button size="lg" className="px-10 py-7 text-[1.05rem] font-semibold rounded-xl">
                            Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <a
                        href="mailto:sales@zyenereviews.com?subject=Pricing%20Question"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        Have questions? Talk to us →
                    </a>
                </div>
                <p className="mt-6 text-xs text-muted-foreground">
                    Trusted by local businesses. GDPR compliant. No annual contracts.
                </p>
            </div>
        </section>
    );
}
