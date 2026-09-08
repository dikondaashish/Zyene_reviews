import Link from "next/link";
import { LandingHero } from "@/components/marketing/landing-hero";
import { MarketingGeoSummary } from "@/components/marketing/marketing-geo-summary";
import type { CompetitorData } from "@/lib/comparisons/competitor-data";

export function CompareCompetitorHeroSection({ data }: { data: CompetitorData }) {
    const competitorBillingTerms = data.billingTerms ?? (
        data.contractRequired
            ? `${data.name} requires an annual contract.`
            : `${data.name} offers a monthly option.`
    );

    return (
        <>
            <LandingHero
                eyebrow="Compare your options"
                title={`Zyene Reviews vs ${data.name}`}
                description={data.heroSub}
                primary={{ label: "Try Zyene free for 7 days", href: "/signup" }}
                secondary={{ label: "Explore Zyene pricing", href: "/pricing" }}
            >
                <Link href="/compare" className="underline underline-offset-4">All comparisons</Link>
            </LandingHero>
            <section className="marketing-container grid grid-cols-1 gap-8 py-12 md:grid-cols-2 md:gap-16">
                <div>
                    <h2 className="mb-5 text-2xl">Starting price at a glance</h2>
                    <dl className="divide-y divide-border">
                        <div className="flex items-baseline justify-between gap-5 py-4"><dt>Zyene Reviews</dt><dd className="text-xl font-semibold">$29.99<span className="text-sm font-normal text-muted-foreground"> /mo</span></dd></div>
                        <div className="flex items-baseline justify-between gap-5 py-4"><dt>{data.name}</dt><dd className="text-xl font-semibold">{data.price}<span className="text-sm font-normal text-muted-foreground"> /mo</span></dd></div>
                    </dl>
                    <p className="mt-3 text-sm text-muted-foreground">Zyene has no annual contract. {competitorBillingTerms}</p>
                    {data.pricingSource ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                            Pricing source: <a href={data.pricingSource.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">{data.pricingSource.label}</a> (checked {data.pricingSource.checkedOn}).
                        </p>
                    ) : null}
                </div>
                <div>
                    {data.openingSummary && <MarketingGeoSummary>{data.openingSummary}</MarketingGeoSummary>}
                    {data.deepDiveLink && <Link href={data.deepDiveLink.href} className="mt-4 inline-block text-sm font-semibold text-primary underline underline-offset-4">{data.deepDiveLink.label}</Link>}
                </div>
            </section>
        </>
    );
}
