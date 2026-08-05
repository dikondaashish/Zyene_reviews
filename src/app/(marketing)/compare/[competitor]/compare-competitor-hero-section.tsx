import { MarketingGeoSummary } from "@/components/marketing/marketing-geo-summary";
import type { CompetitorData } from "@/lib/comparisons/competitor-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SIGNUP_URL } from "@/config/env";
import { ArrowRight, Check, X, ChevronRight, Sparkles, ShieldCheck } from "lucide-react";

export function CompareCompetitorHeroSection({ data }: { data: CompetitorData }) {
    return (
        <section className="pt-24 pb-20 px-4 bg-background">
                <div className="container mx-auto max-w-4xl text-center">
                    {/* Breadcrumb */}
                    <nav className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6">
                        <Link href="/compare" className="hover:text-primary transition-colors">Compare</Link>
                        <ChevronRight className="size-3.5" />
                        <span className="text-foreground font-medium">Zyene Reviews vs {data.name}</span>
                    </nav>

                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 mb-6">
                        <Sparkles className="size-3.5" />
                        Honest Comparison—2026
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-5 leading-[1.05]">
                        Zyene Reviews<br />
                        <span className="text-primary">vs {data.name}</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">{data.heroSub}</p>
                    {data.openingSummary ? (
                        <div className="max-w-2xl mx-auto mb-8 text-left space-y-4">
                            <MarketingGeoSummary>{data.openingSummary}</MarketingGeoSummary>
                            {data.deepDiveLink ? (
                                <p className="text-sm text-center">
                                    <Link
                                        href={data.deepDiveLink.href}
                                        className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                                    >
                                        {data.deepDiveLink.label}
                                        <ArrowRight className="size-3.5" aria-hidden />
                                    </Link>
                                </p>
                            ) : null}
                        </div>
                    ) : null}

                    {/* Quick price callout */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-10">
                        <div className="text-center">
                            <div className="text-5xl font-black text-primary">$29.99</div>
                            <div className="text-sm text-muted-foreground mt-1">Zyene Reviews / month</div>
                            <div className="text-xs text-muted-foreground">No annual contract</div>
                        </div>
                        <div className="text-3xl font-bold text-muted-foreground/30">vs</div>
                        <div className="text-center">
                            <div className="text-5xl font-black text-muted-foreground">{data.price}</div>
                            <div className="text-sm text-muted-foreground mt-1">{data.name} / month</div>
                            <div className="text-xs text-muted-foreground">{data.contractRequired ? "Annual contract required" : "No annual contract"}</div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={SIGNUP_URL}>
                            <Button size="lg" className="px-8 py-6 text-base font-semibold rounded-xl">
                                Try Zyene Reviews Free for 7 Days <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button size="lg" variant="outline" className="px-8 py-6 text-base font-semibold rounded-xl">
                                See Full Pricing
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
    );
}
