import type { Metadata } from "next";
import Link from "next/link";
import {
    Star, Bot, ShieldCheck, BarChart3, TrendingUp, Sparkles,
    ArrowRight, Check, Globe, MessageSquare, QrCode, Users, Zap, Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { CustomerLogoBar, TestimonialGrid } from "@/components/marketing/social-proof";
import { PlatformPillarsSection } from "@/components/marketing/platform-pillars-section";
import { POSITIONING } from "@/lib/growth/product-foundation";
import { INTEGRATION_BRAND_CHIPS } from "@/lib/marketing/integration-brands";

export const metadata: Metadata = {
    title: "Features — Zyene Reviews",
    description:
        "Everything you need to own your online reputation: AI-powered review replies, review collection with Negative Feedback Shield, competitor tracking, local SEO dashboard, and more.",
    alternates: { canonical: "https://zyenereviews.com/features" },
    openGraph: {
        title: "Features — Zyene Reviews",
        description:
            "AI replies, Negative Feedback Shield, competitor tracking, local SEO, and more — all in one platform starting at $29.99/mo.",
        url: "https://zyenereviews.com/features",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Features — Zyene Reviews",
        description: "AI replies, Negative Feedback Shield, competitor tracking, local SEO — starting at $29.99/mo.",
    },
};

const PILLARS = [
    {
        id: "review-monitoring",
        icon: Star,
        iconBg: "bg-chart-4/10",
        iconColor: "text-chart-4",
        title: "Review Monitoring & Inbox",
        tagline: "Never miss a review — across every platform",
        bullets: [
            "Real-time sync from Google, Facebook, and Yelp",
            "Unified inbox for all reviews across all locations",
            "Instant email & SMS alerts when new reviews arrive",
            "Sentiment analysis automatically flags urgent reviews",
            "Filter by rating, platform, location, or date",
        ],
        cta: { label: "See pricing", href: "/pricing" },
    },
    {
        id: "ai-replies",
        icon: Bot,
        iconBg: "bg-chart-1/10",
        iconColor: "text-chart-1",
        title: "AI-Powered Review Replies",
        tagline: "Professional responses in seconds, in your voice",
        bullets: [
            "One-click AI reply suggestions for every review",
            "Tone customization: formal, friendly, apologetic",
            "Auto-commenter: hands-free replies with owner approval",
            "Personalized context (customer name, visit details)",
            "Consistent brand voice across your team",
        ],
        cta: { label: "See how it works", href: "/how-it-works" },
    },
    {
        id: "review-collection",
        icon: ShieldCheck,
        iconBg: "bg-chart-2/10",
        iconColor: "text-chart-2",
        title: "Review Collection & Negative Feedback Shield",
        tagline: "Get more 5-star reviews. Route bad ones privately.",
        bullets: [
            "Branded review request campaigns via SMS & email",
            "Shareable QR codes for in-person review collection",
            "Negative Feedback Shield routes unhappy customers to private resolution before they go public on Google",
            "POS & automation triggers (Square, Clover, Zapier)",
            "AI-generated review prompt crafted for each customer",
        ],
        cta: { label: "See pricing", href: "/pricing" },
        highlight: true,
    },
    {
        id: "competitor-tracking",
        icon: TrendingUp,
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
        title: "Competitor Intelligence",
        tagline: "Know exactly where you stand in your market",
        bullets: [
            "Track up to 10 competitors per location",
            "Compare review volume, average rating, and response rate",
            "Identify competitor weaknesses to outperform",
            "Weekly competitive digest delivered to your inbox",
            "Map view: see your ranking vs. nearby businesses",
        ],
        cta: { label: "Start free trial", href: "/signup" },
    },
    {
        id: "local-seo",
        icon: Globe,
        iconBg: "bg-sync-action/10",
        iconColor: "text-sync-action",
        title: "Local SEO Dashboard",
        tagline: "Optimize your Google Business Profile to rank higher",
        bullets: [
            "Google Business Profile keyword performance tracking",
            "Keyword insights: what customers search to find you",
            "Photo, post, and Q&A management from one dashboard",
            "Local pack ranking estimation for your top keywords",
            "Actionable recommendations to improve your GBP score",
        ],
        cta: { label: "See pricing", href: "/pricing" },
    },
    {
        id: "analytics",
        icon: BarChart3,
        iconBg: "bg-destructive/10",
        iconColor: "text-destructive",
        title: "Analytics & Reporting",
        tagline: "Understand what's working and share results",
        bullets: [
            "Dashboard overview: ratings, volume, response rate, trends",
            "Review growth charts over time (weekly/monthly)",
            "Team performance reports for multi-member accounts",
            "Export data to CSV or via API",
            "Scheduled automated email reports",
        ],
        cta: { label: "Explore docs", href: "/docs" },
    },
];

const INTEGRATIONS = INTEGRATION_BRAND_CHIPS;

export default function FeaturesPage() {
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Features", url: "https://zyenereviews.com/features" },
                ]}
            />

            {/* ── Hero ── */}
            <section className="pt-24 pb-20 px-4 text-center bg-background">
                <div className="container mx-auto max-w-4xl">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 mb-6">
                        <Sparkles className="h-3.5 w-3.5" />
                        Product Features
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.05]">
                        Everything you need to<br />
                        <span className="text-primary">own your online reputation</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Ten product pillars for local business owners — six deep-dives below, plus CRM,
                        multi-location, integrations, and team collaboration.
                    </p>
                    <p className="text-sm text-muted-foreground mb-10 max-w-xl mx-auto italic">
                        {POSITIONING.oneLiner}
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

            {/* ── Quick Feature Grid ── */}
            <section className="py-6 px-4 bg-muted border-y border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {PILLARS.map((pillar) => {
                            const Icon = pillar.icon;
                            return (
                                <Link
                                    key={pillar.id}
                                    href={`/features/${pillar.id}`}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-card border border-transparent hover:border-border transition-all text-center group"
                                >
                                    <div className={`${pillar.iconBg} p-3 rounded-xl`}>
                                        <Icon className={`h-5 w-5 ${pillar.iconColor}`} />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-tight">{pillar.title.split("&")[0].trim()}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Feature Pillars ── */}
            <section className="py-6 bg-background">
                {PILLARS.map((pillar, i) => {
                    const Icon = pillar.icon;
                    const isEven = i % 2 === 0;
                    return (
                        <div
                            key={pillar.id}
                            id={pillar.id}
                            className={`py-20 px-4 scroll-mt-20 ${isEven ? "bg-background" : "bg-muted/40"} ${pillar.highlight ? "border-y border-primary/20" : ""}`}
                        >
                            <div className={`container mx-auto max-w-6xl grid lg:grid-cols-2 gap-16 items-center ${isEven ? "" : "lg:grid-flow-dense"}`}>
                                {/* Text */}
                                <div className={isEven ? "" : "lg:col-start-2"}>
                                    <div className={`inline-flex items-center gap-2 ${pillar.iconBg} ${pillar.iconColor} text-xs font-bold px-4 py-2 rounded-full border border-current/20 mb-4`}>
                                        <Icon className="h-3.5 w-3.5" />
                                        {pillar.title}
                                    </div>
                                    {pillar.highlight && (
                                        <div className="inline-flex items-center gap-1 ml-2 mb-4 bg-primary/10 text-primary text-[11px] font-bold px-3 py-1 rounded-full border border-primary/20">
                                            ✦ Unique to Zyene
                                        </div>
                                    )}
                                    <h2 className="text-4xl font-bold text-foreground mb-3 leading-tight">{pillar.title}</h2>
                                    <p className="text-lg text-muted-foreground mb-8">{pillar.tagline}</p>
                                    <ul className="space-y-3 mb-8">
                                        {pillar.bullets.map((b) => (
                                            <li key={b} className="flex items-start gap-3">
                                                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground">{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <Link href={pillar.cta.href}>
                                            <Button variant={pillar.highlight ? "default" : "outline"} className="gap-2">
                                                {pillar.cta.label} <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link
                                            href={`/features/${pillar.id}`}
                                            className="text-sm font-medium text-primary hover:underline"
                                        >
                                            Feature page →
                                        </Link>
                                    </div>
                                </div>

                                {/* Visual block */}
                                <div className={isEven ? "" : "lg:col-start-1 lg:row-start-1"}>
                                    <div className={`rounded-2xl border ${pillar.highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"} p-8 h-72 flex items-center justify-center relative overflow-hidden`}>
                                        <div className={`absolute inset-0 ${pillar.iconBg} opacity-30`} />
                                        <div className="relative flex flex-col items-center gap-4 text-center">
                                            <div className={`${pillar.iconBg} p-5 rounded-2xl`}>
                                                <Icon className={`h-12 w-12 ${pillar.iconColor}`} />
                                            </div>
                                            <p className="text-sm font-semibold text-foreground">{pillar.tagline}</p>
                                            <div className="flex gap-1 mt-1">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        className={`h-4 w-4 ${pillar.id === "review-monitoring" || pillar.id === "review-collection" || pillar.id === "analytics" ? "fill-chart-4 text-chart-4" : "text-muted-foreground/20"}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>

            <PlatformPillarsSection />

            <CustomerLogoBar title="Features trusted by local businesses nationwide" />

            <TestimonialGrid limit={3} title="Built for businesses like yours" />

            {/* ── Integrations Bar ── */}
            <section className="py-16 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-5xl text-center">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
                        Connects with the platforms you already use
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mb-10">
                        {INTEGRATIONS.map((int) => (
                            <div
                                key={int.name}
                                className="flex items-center gap-3 bg-card border border-border rounded-xl px-5 py-3 hover:shadow-sm transition-shadow"
                            >
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                    style={{ backgroundColor: int.color }}
                                >
                                    {int.letter}
                                </div>
                                <span className="text-sm font-medium text-foreground">{int.name}</span>
                            </div>
                        ))}
                    </div>
                    <Link href="/integrations">
                        <Button variant="outline" className="gap-2">
                            See all integrations <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="py-24 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-4xl font-bold text-foreground mb-4">All features. One platform. One price.</h2>
                    <p className="text-xl text-muted-foreground mb-10">
                        Starting at $29.99/mo — no annual contracts, no add-ons, no surprises.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/signup">
                            <Button size="lg" className="px-10 py-7 text-[1.05rem] font-semibold rounded-xl">
                                Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            View full pricing →
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
