import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowRight, Star, Check, ShieldCheck, Bot, TrendingUp,
    Globe, Sparkles, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { INDUSTRY_MAP, INDUSTRY_SLUGS } from "@/lib/phase3/industry-data";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { IndustryTrustBadge } from "@/components/marketing/social-proof";
import { getIndustryTrustLabel } from "@/lib/phase5/social-proof-data";

// ─── Static Generation ────────────────────────────────────────────────────────

export function generateStaticParams() {
    return INDUSTRY_SLUGS.map((slug) => ({ industry: slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
    { params }: { params: Promise<{ industry: string }> }
): Promise<Metadata> {
    const { industry: slug } = await params;
    const data = INDUSTRY_MAP[slug];
    if (!data) return {};
    return {
        title: data.metaTitle,
        description: data.metaDescription,
        alternates: { canonical: `https://zyenereviews.com/industries/${slug}` },
        keywords: data.targetKeywords,
        openGraph: {
            title: data.metaTitle,
            description: data.metaDescription,
            url: `https://zyenereviews.com/industries/${slug}`,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: data.metaTitle,
            description: data.metaDescription,
        },
    };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function IndustryPage(
    { params }: { params: Promise<{ industry: string }> }
) {
    const { industry: slug } = await params;
    const data = INDUSTRY_MAP[slug];
    if (!data) notFound();

    const SOLUTIONS_ICONS = [ShieldCheck, Bot, Star, TrendingUp, Globe, Sparkles];

    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Industries", url: "https://zyenereviews.com/industries" },
                    { name: data.name, url: `https://zyenereviews.com/industries/${slug}` },
                ]}
            />

            {/* ── Hero ── */}
            <section className="pt-24 pb-20 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                        <div className="flex-1">
                            {/* Breadcrumb */}
                            <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                                <Link href="/industries" className="hover:text-primary transition-colors">Industries</Link>
                                <ChevronRight className="h-3.5 w-3.5" />
                                <span className="text-foreground font-medium">{data.name}</span>
                            </nav>

                            <div className="flex flex-wrap items-center gap-3 mb-5">
                                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20">
                                    <span className="text-lg">{data.emoji}</span>
                                    Built for {data.name}
                                </div>
                                <IndustryTrustBadge
                                    label={getIndustryTrustLabel(slug, data.name)}
                                />
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-5 leading-[1.05]">
                                {data.heroHeadline}
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
                                {data.heroSub}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/signup">
                                    <Button size="lg" className="px-8 py-6 text-base font-semibold rounded-xl">
                                        Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link href="/pricing">
                                    <Button size="lg" variant="outline" className="px-8 py-6 text-base font-semibold rounded-xl">
                                        See Pricing
                                    </Button>
                                </Link>
                            </div>
                            <p className="mt-4 text-xs text-muted-foreground">
                                7-day free trial · No credit card lock-in · Starting at $29.99/mo
                            </p>
                        </div>

                        {/* Hero visual */}
                        <div className="shrink-0 w-full lg:w-80">
                            <div className="bg-card border-2 border-primary/20 rounded-3xl p-8 text-center shadow-lg">
                                <div className="text-7xl mb-4">{data.emoji}</div>
                                <div className="text-2xl font-bold text-foreground mb-2">{data.name}</div>
                                <div className="flex justify-center gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="h-5 w-5 fill-chart-4 text-chart-4" />
                                    ))}
                                </div>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2 text-left">
                                        <Check className="h-4 w-4 text-primary shrink-0" />
                                        <span>AI reply suggestions included</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2 text-left">
                                        <Check className="h-4 w-4 text-primary shrink-0" />
                                        <span>Negative Feedback Shield</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2 text-left">
                                        <Check className="h-4 w-4 text-primary shrink-0" />
                                        <span>Competitor tracking</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2 text-left">
                                        <Check className="h-4 w-4 text-primary shrink-0" />
                                        <span>Starting at $29.99/mo</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Pain Points ── */}
            <section className="py-20 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-foreground text-center mb-3">
                        The reputation challenges {data.name.toLowerCase()} face
                    </h2>
                    <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
                        These aren&apos;t generic problems. They&apos;re specific to your industry.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {data.painPoints.map((point, i) => (
                            <div key={i} className="bg-card border border-border rounded-2xl p-7">
                                <div className="inline-block bg-destructive/10 text-destructive text-xs font-bold px-3 py-1.5 rounded-full border border-destructive/20 mb-4">
                                    {point.stat}
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-3">{point.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{point.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How Zyene Solves It ── */}
            <section className="py-20 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 mb-4">
                            <Sparkles className="h-3.5 w-3.5" /> How Zyene solves it
                        </div>
                        <h2 className="text-3xl font-bold text-foreground">
                            Everything a {data.nameSingular.toLowerCase()} needs
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {data.solutions.map((solution, i) => {
                            const Icon = SOLUTIONS_ICONS[i % SOLUTIONS_ICONS.length];
                            return (
                                <div key={i} className="bg-card border border-border rounded-2xl p-7 flex gap-5">
                                    <div className="bg-primary/10 p-3 rounded-xl h-fit shrink-0">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground mb-2">{solution.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{solution.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Use Case ── */}
            <section className="py-20 px-4 bg-primary/5 border-t border-primary/20">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 mb-4">
                            Real-world scenario
                        </div>
                        <h2 className="text-3xl font-bold text-foreground">
                            A {data.nameSingular.toLowerCase()} owner like you
                        </h2>
                    </div>
                    <div className="bg-card border border-border rounded-3xl p-10 shadow-sm">
                        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                                {data.emoji}
                            </div>
                            <div>
                                <div className="text-xl font-bold text-foreground">{data.useCase.ownerName}</div>
                                <div className="text-sm text-muted-foreground">{data.useCase.ownerContext}</div>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-destructive mb-3">Before Zyene</div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{data.useCase.challengeBefore}</p>
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-3">What they did</div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{data.useCase.actionTaken}</p>
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-chart-2 mb-3">Result</div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{data.useCase.resultAfter}</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-4">
                        This is an illustrative scenario based on typical platform results. Individual results vary.
                    </p>
                </div>
            </section>

            {/* ── Pricing Reminder ── */}
            <section className="py-20 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-4xl">
                    <div className="bg-card border border-border rounded-3xl p-10">
                        <div className="grid lg:grid-cols-2 gap-10 items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-foreground mb-3">
                                    Pricing built for {data.name.toLowerCase()}
                                </h2>
                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    No per-location surcharges. No annual contracts. Full access to every feature — AI replies, Negative Feedback Shield, competitor tracking — starting at $29.99/mo.
                                </p>
                                <ul className="space-y-2.5 mb-8">
                                    {[
                                        "7-day free trial — full access, no charge",
                                        "Cancel anytime — no cancellation fees",
                                        "Starter: 1 location, $29.99/mo",
                                        "Professional: up to 3 locations, $59.99/mo",
                                        "Enterprise: unlimited locations — contact us",
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex gap-4">
                                    <Link href="/signup">
                                        <Button className="gap-2">
                                            Start Free Trial <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Link href="/pricing">
                                        <Button variant="outline">Full pricing →</Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-8xl font-black text-primary mb-2">$29.99</div>
                                <div className="text-muted-foreground font-medium">per month</div>
                                <div className="text-sm text-muted-foreground mt-1">No annual contract · Cancel anytime</div>
                                <div className="mt-6 inline-block bg-primary/10 text-primary font-bold text-sm px-5 py-2.5 rounded-full border border-primary/20">
                                    vs $299–$399/mo at competitors
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="py-20 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <div className="flex justify-center gap-1 mb-5">
                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-6 w-6 fill-chart-4 text-chart-4" />)}
                    </div>
                    <h2 className="text-4xl font-bold text-foreground mb-4">{data.ctaJoinCopy}</h2>
                    <p className="text-xl text-muted-foreground mb-10">
                        Start your 7-day free trial today.<br />
                        No credit card lock-in. Cancel before day 7 and pay nothing.
                    </p>
                    <Link href="/signup">
                        <Button size="lg" className="px-12 py-7 text-[1.05rem] font-semibold rounded-xl">
                            Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                        <Link href="/features" className="hover:text-primary transition-colors">See all features →</Link>
                        <Link href="/how-it-works" className="hover:text-primary transition-colors">How it works →</Link>
                        <Link href="/industries" className="hover:text-primary transition-colors">Other industries →</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
