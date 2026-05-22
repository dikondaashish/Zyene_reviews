import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INDUSTRIES } from "@/lib/phase3/industry-data";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
    title: "Industries — Zyene Reviews",
    description:
        "Zyene Reviews is built for local businesses across every industry. Explore how review management, AI replies, and the Negative Feedback Shield work for your specific business type.",
    alternates: { canonical: "https://zyenereviews.com/industries" },
    openGraph: {
        title: "Review Management for Every Industry — Zyene Reviews",
        description:
            "From restaurants to dental practices to gyms — Zyene helps local businesses in every industry grow their reviews and protect their reputation.",
        url: "https://zyenereviews.com/industries",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Review Management for Every Industry — Zyene Reviews",
        description: "From restaurants to gyms — Zyene helps local businesses in every industry grow their reviews.",
    },
};

export default function IndustriesHubPage() {
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Industries", url: "https://zyenereviews.com/industries" },
                ]}
            />

            {/* ── Hero ── */}
            <section className="pt-24 pb-20 px-4 text-center bg-background">
                <div className="container mx-auto max-w-4xl">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 mb-6">
                        <Sparkles className="h-3.5 w-3.5" />
                        Industry Solutions
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.05]">
                        Review management built<br />
                        <span className="text-primary">for your industry</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Every industry has unique challenges when it comes to online reputation. Zyene is tailored to help local businesses in each vertical grow their reviews, protect their reputation, and rank higher on Google Maps.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                </div>
            </section>

            {/* ── Industry Grid ── */}
            <section className="py-20 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl font-bold text-foreground text-center mb-3">Choose your industry</h2>
                    <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
                        See exactly how Zyene solves reputation challenges specific to your type of business.
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {INDUSTRIES.map((industry) => (
                            <Link
                                key={industry.slug}
                                href={`/industries/${industry.slug}`}
                                className="group bg-card border border-border rounded-2xl p-7 hover:border-primary/50 hover:shadow-lg transition-all flex flex-col"
                            >
                                <div className="text-5xl mb-4">{industry.emoji}</div>
                                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                    {industry.name}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">
                                    {industry.heroSub.split(".")[0]}.
                                </p>
                                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                    Learn more <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Shared Benefits Strip ── */}
            <section className="py-16 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-10">
                        Every industry gets the same core platform
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                        {[
                            { emoji: "🤖", title: "AI Replies", desc: "Respond to every review in seconds with one-click AI suggestions." },
                            { emoji: "🛡️", title: "Negative Feedback Shield", desc: "Route bad experiences to private resolution before they hit Google." },
                            { emoji: "📊", title: "Competitor Tracking", desc: "See how you compare to nearby competitors in real time." },
                            { emoji: "📍", title: "Local SEO Dashboard", desc: "GBP keyword performance data to rank higher on Google Maps." },
                        ].map((item) => (
                            <div key={item.title} className="bg-card border border-border rounded-2xl p-6">
                                <div className="text-3xl mb-3">{item.emoji}</div>
                                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-24 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <div className="flex justify-center gap-1 mb-5">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="h-7 w-7 fill-yellow-400 text-yellow-400" />
                        ))}
                    </div>
                    <h2 className="text-4xl font-bold text-foreground mb-4">
                        Start getting more 5-star reviews today
                    </h2>
                    <p className="text-xl text-muted-foreground mb-10">
                        7-day free trial. Full access. No credit card lock-in.<br />
                        Works for every industry on this page — starting at $29.99/mo.
                    </p>
                    <Link href="/signup">
                        <Button size="lg" className="px-12 py-7 text-[1.05rem] font-semibold rounded-xl">
                            Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </section>
        </>
    );
}
