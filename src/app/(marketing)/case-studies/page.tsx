import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CASE_STUDIES } from "@/lib/phase5/case-study-data";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { CustomerLogoBar } from "@/components/marketing/social-proof";
import { SIGNUP_URL } from "@/config/env";

export const metadata: Metadata = {
    title: "Customer Case Studies — Real Results for Local Businesses | Zyene Reviews",
    description:
        "See how dental practices, restaurants, salons, HVAC companies, and auto shops grew Google reviews and ratings with Zyene Reviews — with before/after metrics.",
    alternates: { canonical: "https://zyenereviews.com/case-studies" },
    openGraph: {
        title: "Customer Case Studies — Zyene Reviews",
        description: "Before/after metrics from local businesses using Zyene for review management and reputation growth.",
        url: "https://zyenereviews.com/case-studies",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Customer Case Studies — Zyene Reviews",
        description: "Real outcomes: more Google reviews, higher ratings, faster response times.",
    },
};

export default function CaseStudiesHubPage() {
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Case Studies", url: "https://zyenereviews.com/case-studies" },
                ]}
            />

            <section className="pt-24 pb-12 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-4">
                        <Building2 className="h-3 w-3" /> Case Studies
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                        Results local businesses achieve with Zyene
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Representative outcomes from restaurants, dental practices, home services, salons, and auto repair —
                        built from typical customer journeys. Permissioned customer stories will replace these as they become available.
                    </p>
                </div>
            </section>

            <CustomerLogoBar title="Businesses like yours on Zyene" />

            <section className="py-20 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-8">
                        {CASE_STUDIES.map((study) => (
                            <article
                                key={study.slug}
                                className="bg-card border border-border rounded-2xl p-8 flex flex-col hover:border-primary/30 transition-colors"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <span className="text-4xl" aria-hidden>{study.emoji}</span>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {study.industry} · {study.location}
                                        </p>
                                        <h2 className="text-xl font-bold text-foreground mt-1">{study.company}</h2>
                                        <p className="text-xs text-muted-foreground mt-0.5">{study.size}</p>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-3 leading-snug">
                                    {study.headline}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-6 flex-1 leading-relaxed">
                                    {study.excerpt}
                                </p>
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {study.metrics.slice(0, 2).map((m) => (
                                        <div key={m.label} className="bg-muted rounded-lg p-3 border border-border">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                                {m.label}
                                            </p>
                                            <p className="text-sm font-bold text-foreground">
                                                {m.before} → {m.after}
                                            </p>
                                            <p className="text-xs text-primary font-semibold mt-0.5">{m.change}</p>
                                        </div>
                                    ))}
                                </div>
                                <Link
                                    href={`/case-studies/${study.slug}`}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:brightness-90"
                                >
                                    Read full case study <ArrowRight className="h-4 w-4" />
                                </Link>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <TrendingUp className="h-10 w-10 text-primary mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-foreground mb-3">Want results like these?</h2>
                    <p className="text-muted-foreground mb-8">
                        Start your 7-day free trial — no annual contract. Same tools these businesses used.
                    </p>
                    <Link href={SIGNUP_URL}>
                        <Button size="lg" className="px-10 py-6 font-semibold rounded-xl">
                            Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </section>
        </>
    );
}
