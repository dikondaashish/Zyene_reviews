import { IndustryTrustBadge } from "@/components/marketing/social-proof";
import { getIndustryTrustLabel } from "@/lib/phase5/social-proof-data";
import type { IndustryData } from "@/lib/phase3/industry-data";
import type { Metadata } from "next";
import Link from "next/link";
import {
    ArrowRight, Star, Check, ShieldCheck, Bot, TrendingUp,
    Globe, Sparkles, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Static Generation ────────────────────────────────────────────────────────


// ─── Metadata ─────────────────────────────────────────────────────────────────


// ─── Page ─────────────────────────────────────────────────────────────────────

export function IndustriesIndustryHeroSection({ data, slug }: { data: IndustryData; slug: string }) {
    return (
        <section className="pt-24 pb-20 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                        <div className="flex-1">
                            {/* Breadcrumb */}
                            <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                                <Link href="/industries" className="hover:text-primary transition-colors">Industries</Link>
                                <ChevronRight className="size-3.5" />
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
                                        Start Free Trial <ArrowRight className="ml-2 size-4" />
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
                                        <Star key={s} className="fill-chart-4 text-chart-4 size-5" />
                                    ))}
                                </div>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2 text-left">
                                        <Check className="text-primary shrink-0 size-4" />
                                        <span>AI reply suggestions included</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2 text-left">
                                        <Check className="text-primary shrink-0 size-4" />
                                        <span>Negative Feedback Shield</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2 text-left">
                                        <Check className="text-primary shrink-0 size-4" />
                                        <span>Competitor tracking</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2 text-left">
                                        <Check className="text-primary shrink-0 size-4" />
                                        <span>Starting at $29.99/mo</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
    );
}
