import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingHero } from "@/components/marketing/landing-hero";
import { MarketingGeoSummary } from "@/components/marketing/marketing-geo-summary";
import type { CompetitorData } from "@/lib/comparisons/competitor-data";

function PricingGlance({ data }: { data: CompetitorData }) {
    return (
        <div className="mi-panel cmp-glance">
            <h2>Pricing at a glance</h2>
            <dl>
                <div><dt>Zyene Reviews</dt><dd>$29.99<small> /mo</small></dd></div>
                <div><dt>{data.name}</dt><dd>{data.price}</dd></div>
            </dl>
            <p className="cmp-glance-note">Zyene Reviews: no annual commitment required. {data.name}: {data.billingTerms}.</p>
            <p className="cmp-glance-note">{data.priceNote}</p>
            <p className="cmp-glance-note">
                Pricing source: <a href={data.pricingSource.href} target="_blank" rel="noopener noreferrer">{data.pricingSource.label}</a> (checked {data.pricingSource.checkedOn}).
            </p>
        </div>
    );
}

export function CompareCompetitorHeroSection({ data }: { data: CompetitorData }) {
    return (
        <>
            <LandingHero
                eyebrow="Compare your options"
                title={`Zyene Reviews vs ${data.name}`}
                description={data.heroSub}
                variant="conversion"
                media={{ kind: "product", label: `Zyene Reviews and ${data.name} pricing at a glance`, node: <PricingGlance data={data} /> }}
                primary={{ label: "Start 7-day free trial", href: "/signup" }}
                secondary={{ label: "Book a demo", href: "/demo" }}
            >
                <Link href="/compare" className="home-text-link">
                    All comparisons <ArrowRight size={14} aria-hidden="true" />
                </Link>
            </LandingHero>
            <section className="marketing-section mi-section-tight" aria-label="Key takeaway">
                <div className="marketing-container cmp-summary">
                    <MarketingGeoSummary>{data.openingSummary}</MarketingGeoSummary>
                    {data.guides?.[0] && (
                        <Link href={data.guides[0].href} className="home-text-link">
                            {data.guides[0].label} <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                    )}
                </div>
            </section>
        </>
    );
}
