import Link from "next/link";
import { LandingHero } from "@/components/marketing/landing-hero";
import { MarketingGeoSummary } from "@/components/marketing/marketing-geo-summary";
import { COMPARE_HUB_OPENING_SUMMARY } from "@/app/(marketing)/compare/compare-hub-content";

export function CompareHeroSection() {
    return (
        <>
            <LandingHero
                eyebrow="Find your fit"
                title="The right review platform for your business."
                description="Compare Zyene Reviews with Birdeye, Podium, NiceJob, and GatherUp. See the features, pricing, and tradeoffs in one place."
                primary={{ label: "Try Zyene free", href: "/signup" }}
                secondary={{ label: "Explore pricing", href: "/pricing" }}
            />
            <section className="marketing-container py-10">
                <MarketingGeoSummary>{COMPARE_HUB_OPENING_SUMMARY}</MarketingGeoSummary>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-primary">
                    <Link href="/blog/birdeye-pricing-breakdown-2026" className="underline underline-offset-4">Birdeye pricing breakdown</Link>
                    <Link href="/compare/birdeye" className="underline underline-offset-4">Full Birdeye comparison</Link>
                    <Link href="/blog/negative-feedback-shield" className="underline underline-offset-4">Negative Feedback Shield guide</Link>
                </div>
            </section>
        </>
    );
}
