import type { Metadata } from "next";
import Link from "next/link";
import {
    Link2, Bell, Megaphone, TrendingUp, ArrowRight, Check,
    Star, Sparkles, ShieldCheck, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";


const STEPS = [
    {
        step: "01",
        icon: Link2,
        iconBg: "bg-chart-1/10",
        iconColor: "text-chart-1",
        accentColor: "border-l-chart-1",
        title: "Connect",
        headline: "Connect your Google Business Profile in 2 minutes",
        description:
            "Sign up, click 'Connect Google Business Profile,' and authorize Zyene with your Google account. That's it. Your reviews, Q&A, and performance data start syncing immediately. No technical setup required — if you can log into Google, you can connect in seconds.",
        bullets: [
            "One-click OAuth — no API keys needed",
            "Connect multiple locations to a single account",
            "Facebook and Yelp connections available too",
            "Start your 7-day free trial during setup",
        ],
        mockupLines: [
            "✓  Google Business Profile — Connected",
            "✓  Syncing 127 reviews…",
            "✓  3 competitors tracked",
        ],
        mockupBg: "bg-chart-1/5 border-chart-1/30",
    },
    {
        step: "02",
        icon: Bell,
        iconBg: "bg-chart-4/10",
        iconColor: "text-chart-4",
        accentColor: "border-l-chart-4",
        title: "Monitor",
        headline: "Get instant alerts when reviews arrive",
        description:
            "Every new review triggers an instant notification by email or SMS — so you never miss a critical review. Our AI analyzes each review's sentiment and urgency, surfacing the ones that need your immediate attention. One-click AI reply suggestions let you respond professionally in seconds.",
        bullets: [
            "Real-time email & SMS alerts for every new review",
            "AI sentiment analysis flags 1 and 2-star reviews instantly",
            "Unified inbox across all locations and platforms",
            "One-click AI reply suggestion — edit & publish in seconds",
        ],
        mockupLines: [
            "🔔  New 1-star review — Google · 2 min ago",
            'AI Reply: "We\'re sorry to hear this..."',
            "→  Published · 3 min total time",
        ],
        mockupBg: "bg-chart-4/5 border-chart-4/30",
    },
    {
        step: "03",
        icon: Megaphone,
        iconBg: "bg-chart-2/10",
        iconColor: "text-chart-2",
        accentColor: "border-l-chart-2",
        title: "Collect",
        headline: "Send branded requests. Shield bad reviews privately.",
        description:
            "Send branded review request campaigns by SMS, email, or QR code. When a customer reports a bad experience, the Negative Feedback Shield intercepts the request — routing them to a private resolution flow before they ever reach Google. Only happy customers are guided to leave a public review.",
        bullets: [
            "SMS, email, and QR code review requests",
            "Negative Feedback Shield: bad reviews go to you, not Google",
            "AI generates personalized request copy per customer",
            "POS integrations (Square, Clover) trigger requests automatically",
            "Zapier: trigger from any app in your workflow",
        ],
        mockupLines: [
            "📤  Review request sent to John D.",
            "🛡  Negative experience → Private form",
            "⭐⭐⭐⭐⭐  5-star review published on Google",
        ],
        mockupBg: "bg-chart-2/5 border-chart-2/30",
        highlight: true,
    },
    {
        step: "04",
        icon: TrendingUp,
        iconBg: "bg-sync-action/10",
        iconColor: "text-sync-action",
        accentColor: "border-l-sync-action",
        title: "Grow",
        headline: "Track results, beat competitors, rank higher on Google",
        description:
            "Your analytics dashboard tracks review volume, average rating, response rate, and keyword performance over time. The competitor tracker shows how you compare to nearby businesses. The Local SEO dashboard highlights exactly which keywords customers use to find you — and how to improve your ranking.",
        bullets: [
            "Review growth charts and rating trend lines",
            "Competitor ranking comparison by location",
            "GBP keyword performance dashboard",
            "Weekly email digest with actionable insights",
            "Export data or connect to your BI tools via API",
        ],
        mockupLines: [
            "📈  Reviews +34%  ·  Rating 4.8 → 4.9",
            "🏆  #1 in your area (was #4 last month)",
            "🔑  Top keyword: 'best dentist near me'",
        ],
        mockupBg: "bg-sync-action/5 border-sync-action/30",
    },
];

const PROOF_POINTS = [
    { icon: Star, label: "Average rating lift after 90 days", value: "+0.4 ★" },
    { icon: TrendingUp, label: "Review volume increase in first 3 months", value: "+140%" },
    { icon: ShieldCheck, label: "Bad reviews routed privately vs. going public", value: "9 in 10" },
    { icon: BarChart3, label: "Time saved on review responses (vs. manual)", value: "4 hrs/wk" },
];

export default function HowItWorksPage() {
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "How It Works", url: "https://zyenereviews.com/how-it-works" },
                ]}
            />

            {/* ── Hero ── */}
            <section className="pt-24 pb-20 px-4 text-center bg-background">
                <div className="container mx-auto max-w-4xl">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 mb-6">
                        <Sparkles className="h-3.5 w-3.5" />
                        How It Works
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.05]">
                        Get your first review<br />
                        <span className="text-primary">within 24 hours</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Four steps, no tech skills required. Most local businesses are up and running in under 10 minutes.
                    </p>

                    {/* Step Navigator */}
                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                        {STEPS.map((s) => (
                            <a
                                key={s.step}
                                href={`#step-${s.step}`}
                                className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:border-primary hover:text-primary text-sm font-medium text-muted-foreground transition-all"
                            >
                                <span className="text-primary font-bold">{s.step}</span>
                                {s.title}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Steps ── */}
            {STEPS.map((step, i) => {
                const Icon = step.icon;
                const isEven = i % 2 === 0;
                return (
                    <section
                        key={step.step}
                        id={`step-${step.step}`}
                        className={`py-20 px-4 scroll-mt-20 ${isEven ? "bg-background" : "bg-muted/40"} ${step.highlight ? "border-y border-primary/20" : "border-t border-border"}`}
                    >
                        <div className={`container mx-auto max-w-6xl grid lg:grid-cols-2 gap-16 items-center ${isEven ? "" : "lg:grid-flow-dense"}`}>
                            {/* Text */}
                            <div className={isEven ? "" : "lg:col-start-2"}>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-6xl font-black text-primary/20 leading-none">{step.step}</span>
                                    <div className={`${step.iconBg} p-2.5 rounded-xl`}>
                                        <Icon className={`h-6 w-6 ${step.iconColor}`} />
                                    </div>
                                    <span className={`text-sm font-bold uppercase tracking-wider ${step.iconColor}`}>Step {step.step} — {step.title}</span>
                                </div>
                                <h2 className="text-4xl font-bold text-foreground mb-4 leading-tight">{step.headline}</h2>
                                <p className="text-muted-foreground leading-relaxed mb-8 text-lg">{step.description}</p>
                                <ul className="space-y-3">
                                    {step.bullets.map((b) => (
                                        <li key={b} className="flex items-start gap-3">
                                            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{b}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Mockup */}
                            <div className={isEven ? "" : "lg:col-start-1 lg:row-start-1"}>
                                <div className={`rounded-2xl border-2 ${step.mockupBg} p-8 h-72 flex flex-col justify-center relative overflow-hidden`}>
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${step.accentColor} border-l-4`} />
                                    <div className="flex flex-col gap-4 pl-2">
                                        <div className={`flex items-center gap-3 ${step.iconBg} p-3 rounded-xl w-fit`}>
                                            <Icon className={`h-8 w-8 ${step.iconColor}`} />
                                            <span className="font-bold text-foreground text-lg">{step.title}</span>
                                        </div>
                                        <div className="space-y-3 font-mono text-sm text-muted-foreground bg-card/80 border border-border rounded-xl p-4">
                                            {step.mockupLines.map((line) => (
                                                <div key={line} className="text-foreground/80">{line}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                );
            })}

            {/* ── Proof Points ── */}
            <section className="py-20 px-4 bg-primary/5 border-t border-primary/20">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-foreground text-center mb-12">What businesses see after 90 days</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {PROOF_POINTS.map((point) => {
                            const Icon = point.icon;
                            return (
                                <div key={point.label} className="bg-card border border-border rounded-2xl p-6 text-center">
                                    <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                                    <div className="text-4xl font-black text-foreground mb-2">{point.value}</div>
                                    <div className="text-sm text-muted-foreground leading-snug">{point.label}</div>
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-6">
                        Based on platform averages. Individual results vary by industry, location, and review request frequency.
                    </p>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="py-24 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-4xl font-bold text-foreground mb-4">Ready to try it yourself?</h2>
                    <p className="text-xl text-muted-foreground mb-10">
                        7-day free trial. Full access to every feature.<br />
                        No credit card lock-in. Cancel anytime before day 7.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/signup">
                            <Button size="lg" className="px-10 py-7 text-[1.05rem] font-semibold rounded-xl">
                                Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            View all features →
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
