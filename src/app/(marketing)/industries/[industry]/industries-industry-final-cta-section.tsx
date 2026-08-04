import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SIGNUP_URL } from "@/config/env";
import type { IndustryData } from "@/lib/industries/industry-data";

export function IndustriesIndustryFinalCtaSection({ data }: { data: IndustryData }) {
    return (
        <section className="py-20 px-4 bg-muted border-t border-border">
            <div className="container mx-auto max-w-3xl text-center">
                <h2 className="text-4xl font-bold text-foreground mb-4">{data.ctaJoinCopy}</h2>
                <p className="text-xl text-muted-foreground mb-10">
                    Start your 7-day free trial today.<br />
                    No credit card lock-in. Cancel before day 7 and pay nothing.
                </p>
                <Link href={SIGNUP_URL}>
                    <Button size="lg" className="px-12 py-7 text-[1.05rem] font-semibold rounded-xl">
                        Start Your Free Trial <ArrowRight className="ml-2 size-5" />
                    </Button>
                </Link>
                <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                    <Link href="/features" className="hover:text-primary transition-colors">See all features →</Link>
                    <Link href="/how-it-works" className="hover:text-primary transition-colors">How it works →</Link>
                    <Link href="/industries" className="hover:text-primary transition-colors">Other industries →</Link>
                </div>
            </div>
        </section>
    );
}
