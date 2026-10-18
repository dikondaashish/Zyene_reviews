import Link from "next/link";
import { LandingHero } from "@/components/marketing/landing-hero";
import { MarketingGeoSummary } from "@/components/marketing/marketing-geo-summary";
import { CompetitorHeroVisual } from "@/components/marketing/feature-landing/visuals/competitor-tracking-visuals";
import { COMPARE_HUB_OPENING_SUMMARY } from "@/app/(marketing)/compare/compare-hub-content";

const QUICK_LINKS = [
    { label: "Birdeye pricing breakdown", href: "/blog/birdeye-pricing-breakdown-2026" },
    { label: "Full Birdeye comparison", href: "/compare/birdeye" },
    { label: "Full Prosperly comparison", href: "/compare/prosperly" },
    { label: "Negative Feedback Shield guide", href: "/blog/negative-feedback-shield" },
];

export function CompareHeroSection() {
    return (
        <>
            <LandingHero
                eyebrow="Find your fit"
                title="The right review platform for your business."
                description="Compare Zyene Reviews with Birdeye, Podium, NiceJob, GatherUp, and Prosperly. See pricing, workflows, and tradeoffs in one place."
                media={{
                    kind: "product",
                    label: "Rating comparison board for your business and nearby competitors",
                    node: <div className="mi-visual"><CompetitorHeroVisual /></div>,
                }}
                primary={{ label: "Start 7-day free trial", href: "/signup" }}
                secondary={{ label: "Book a demo", href: "/demo" }}
            />
            <section className="marketing-section mi-section-tight" aria-label="Comparison summary">
                <div className="marketing-container">
                    <MarketingGeoSummary>{COMPARE_HUB_OPENING_SUMMARY}</MarketingGeoSummary>
                    <nav aria-label="Popular comparisons and guides" className="mi-chips cmp-hub-quick">
                        {QUICK_LINKS.map((link) => (
                            <Link key={link.href} href={link.href}>{link.label}</Link>
                        ))}
                    </nav>
                </div>
            </section>
        </>
    );
}
