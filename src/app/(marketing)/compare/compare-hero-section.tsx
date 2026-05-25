import { MarketingGeoSummary } from "@/components/marketing/marketing-geo-summary";
import { COMPARE_HUB_OPENING_SUMMARY } from "@/app/(marketing)/compare/compare-hub-content";
import { POSITIONING } from "@/lib/growth/product-foundation";
import Link from "next/link";
import { ArrowRight, Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPETITOR_MAP, COMPETITOR_SLUGS } from "@/lib/phase3/competitor-data";
import { FeatureCellValue } from "./[competitor]/compare-competitor-feature-cell";

export function CompareHeroSection() {
    return (
        <section className="pt-24 pb-20 px-4 text-center bg-background">
                <div className="container mx-auto max-w-4xl">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 mb-6">
                        <Sparkles className="size-3.5" />
                        Honest Comparisons
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.05]">
                        See how Zyene Reviews<br />
                        <span className="text-primary">compares to the rest</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
                        We believe in honest comparisons. Here&apos;s where Zyene Reviews wins, where competitors win, and how to decide what&apos;s right for your business.
                    </p>
                    <p className="text-sm text-muted-foreground mb-6 max-w-xl mx-auto">
                        {POSITIONING.oneLiner}
                    </p>
                    <div className="max-w-2xl mx-auto mb-10 text-left space-y-4">
                        <MarketingGeoSummary>{COMPARE_HUB_OPENING_SUMMARY}</MarketingGeoSummary>
                        <p className="text-sm text-center text-muted-foreground">
                            Evaluating Birdeye renewal?{" "}
                            <Link href="/blog/birdeye-pricing-breakdown-2026" className="font-medium text-primary hover:underline">
                                Read the 2026 Birdeye pricing breakdown
                            </Link>{" "}
                            (hidden costs, quote checklist) then open{" "}
                            <Link href="/compare/birdeye" className="font-medium text-primary hover:underline">
                                Zyene Reviews vs Birdeye
                            </Link>
                            .
                        </p>
                    </div>
                    <Link href="/signup">
                        <Button size="lg" className="px-8 py-6 text-base font-semibold rounded-xl">
                            Try Zyene Reviews Free for 7 Days <ArrowRight className="ml-2 size-4" />
                        </Button>
                    </Link>
                </div>
            </section>
    );
}
