"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap, Crown, ShieldCheck, ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/services/stripe/plans";
import { CustomerLogoBar, PlatformStatsBadge, TestimonialGrid } from "@/components/marketing/social-proof";

// ─── Billing Toggle ───────────────────────────────────────────────────────────

export function BillingToggle({
    interval,
    onChange,
}: {
    interval: "month" | "year";
    onChange: (v: "month" | "year") => void;
}) {
    return (
        <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium transition-colors ${interval === "month" ? "text-foreground" : "text-muted-foreground"}`}>
                Monthly
            </span>
            <button
                type="button"
                onClick={() => onChange(interval === "month" ? "year" : "month")}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    interval === "year" ? "bg-primary" : "bg-muted-foreground/30"
                }`}
                aria-pressed={interval === "year"}
                aria-label="Toggle billing interval"
            >
                <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                        interval === "year" ? "translate-x-8" : "translate-x-1"
                    }`}
                />
            </button>
            <span className={`text-sm font-medium transition-colors ${interval === "year" ? "text-foreground" : "text-muted-foreground"}`}>
                Annual
                <span className="ml-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary border border-primary/20">
                    Save 17%
                </span>
            </span>
        </div>
    );
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-border last:border-0">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex cursor-pointer items-center justify-between w-full py-5 text-left"
            >
                <span className="text-base font-medium text-foreground pr-4">{question}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <p className="pb-5 text-muted-foreground leading-relaxed text-sm">{answer}</p>
            )}
        </div>
    );
}

// ─── Plan Cards ───────────────────────────────────────────────────────────────

function PlanCard({
    plan,
    isPopular,
    signupUrl,
}: {
    plan: Plan;
    isPopular: boolean;
    signupUrl: string;
}) {
    const isEnterprise = plan.id === "enterprise";
    const monthlyEquivalent =
        plan.interval === "year" && plan.price
            ? (plan.price / 12).toFixed(2)
            : plan.price?.toFixed(2);

    const originalMonthlyEquivalent =
        plan.interval === "year" && plan.originalPrice
            ? (plan.originalPrice / 12).toFixed(2)
            : plan.originalPrice?.toFixed(2);

    if (isPopular) {
        return (
            <div className="relative bg-[color:var(--marketing-footer-bg)] text-[color:var(--marketing-footer-fg)] border-2 border-primary rounded-2xl p-8 flex flex-col">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-5 py-1 rounded-full whitespace-nowrap">
                    Most Popular
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <Crown className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>
                <p className="text-sm text-[color:var(--marketing-footer-muted)] mb-6">For growing multi-location businesses</p>
                <div className="mb-1">
                    {originalMonthlyEquivalent && (
                        <span className="text-base line-through text-[color:var(--marketing-footer-muted)] mr-2">${originalMonthlyEquivalent}</span>
                    )}
                    <span className="text-5xl font-bold">${monthlyEquivalent}</span>
                    <span className="text-[color:var(--marketing-footer-muted)] ml-1 text-sm">/mo</span>
                </div>
                {plan.interval === "year" && (
                    <p className="text-xs text-[color:var(--marketing-footer-muted)] mb-1">Billed ${plan.price?.toFixed(2)}/year</p>
                )}
                <p className="text-sm text-primary font-semibold mb-6">7-day free trial — cancel anytime, no charge</p>
                <ul className="space-y-2.5 text-sm text-[color:var(--marketing-footer-list)] flex-1 mb-8">
                    {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            {f}
                        </li>
                    ))}
                </ul>
                <Link href={signupUrl}>
                    <Button className="w-full rounded-lg py-6 font-semibold text-base">
                        Start 7-day free trial <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>
        );
    }

    if (isEnterprise) {
        return (
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">For large organizations with custom needs</p>
                <div className="mb-6">
                    <span className="text-5xl font-bold text-foreground">Custom</span>
                </div>
                <ul className="space-y-2.5 text-sm text-muted-foreground flex-1 mb-8">
                    {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            {f}
                        </li>
                    ))}
                </ul>
                <a href="mailto:sales@zyenereviews.com?subject=Enterprise%20Plan%20Inquiry">
                    <Button variant="outline" className="w-full rounded-lg py-6 font-semibold text-base">
                        Contact Sales
                    </Button>
                </a>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-2xl p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Perfect for single-location businesses</p>
            <div className="mb-1">
                {originalMonthlyEquivalent && (
                    <span className="text-base line-through text-muted-foreground mr-2">${originalMonthlyEquivalent}</span>
                )}
                <span className="text-5xl font-bold text-foreground">${monthlyEquivalent}</span>
                <span className="text-muted-foreground ml-1 text-sm">/mo</span>
            </div>
            {plan.interval === "year" && (
                <p className="text-xs text-muted-foreground mb-1">Billed ${plan.price?.toFixed(2)}/year</p>
            )}
            <p className="text-sm text-primary font-semibold mb-6">7-day free trial — cancel anytime, no charge</p>
            <ul className="space-y-2.5 text-sm text-muted-foreground flex-1 mb-8">
                {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {f}
                    </li>
                ))}
            </ul>
            <Link href={signupUrl}>
                <Button className="w-full rounded-lg py-6 font-semibold text-base">
                    Start 7-day free trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
        </div>
    );
}

// ─── Full Pricing Client Component ────────────────────────────────────────────

const PRICING_FAQS = [
    {
        question: "How does the 7-day free trial work?",
        answer:
            "Sign up for Starter or Professional and get full access to every feature for 7 days. Cancel before the trial ends and you won't be charged. No credit card lock-in, no annual contracts — cancel anytime from your billing settings.",
    },
    {
        question: "What happens at the end of the trial?",
        answer:
            "After 7 days your subscription starts automatically. You'll receive an email reminder 24 hours before your trial ends. Cancel anytime before that and you won't be charged anything.",
    },
    {
        question: "Can I switch plans?",
        answer:
            "Yes — upgrade or downgrade anytime from your billing settings. Upgrades take effect immediately (prorated). Downgrades take effect at the next billing cycle.",
    },
    {
        question: "What counts against my monthly review request limits?",
        answer:
            "Each email or SMS sent to a customer counts as 1 request toward your monthly quota. Shareable link views do not count — only the initial review draft generation step counts against your AI-generated review draft limit.",
    },
    {
        question: "Can I manage multiple locations?",
        answer:
            "The Starter plan covers 1 location. Professional covers up to 3 locations — each with its own independent limits (email requests, SMS, AI replies). Enterprise offers unlimited locations with custom limits.",
    },
    {
        question: "Do you offer annual billing?",
        answer:
            "Yes. Switching to annual billing saves you approximately 17% compared to monthly. Annual plans are billed once per year. You can switch from monthly to annual at any time from billing settings.",
    },
    {
        question: "Is there a free plan?",
        answer:
            "There is no ongoing free tier, but all new accounts get a 7-day full-access trial. After the trial, a paid plan is required to continue using the platform.",
    },
    {
        question: "Can I cancel anytime?",
        answer:
            "Absolutely. Cancel anytime from your billing settings — no cancellation fees, no contracts, no questions asked. Your account stays active until the end of the billing period.",
    },
];

const COMPARISON_ROWS = [
    { feature: "Starting price (monthly)", zyene: "$29.99/mo", birdeye: "$299/mo", podium: "$399/mo", nicejob: "$75/mo" },
    { feature: "Annual contract required", zyene: false, birdeye: true, podium: true, nicejob: false },
    { feature: "7-day free trial", zyene: true, birdeye: false, podium: false, nicejob: true },
    { feature: "AI reply suggestions", zyene: true, birdeye: "Add-on", podium: "Add-on", nicejob: false },
    { feature: "Auto-commenter (hands-free)", zyene: true, birdeye: false, podium: false, nicejob: false },
    { feature: "Negative Feedback Shield", zyene: true, birdeye: false, podium: false, nicejob: true },
    { feature: "SMS review requests", zyene: true, birdeye: true, podium: true, nicejob: true },
    { feature: "Competitor tracking", zyene: true, birdeye: "Premium tiers", podium: false, nicejob: false },
    { feature: "GBP SEO keyword dashboard", zyene: true, birdeye: "Enterprise", podium: false, nicejob: false },
    { feature: "Developer REST API (included)", zyene: true, birdeye: "Enterprise", podium: "Enterprise", nicejob: false },
    { feature: "Embeddable review widgets", zyene: true, birdeye: true, podium: false, nicejob: true },
];

export function PricingPageClient({
    starterMonthly,
    starterYearly,
    proMonthly,
    proYearly,
    enterprise,
    signupUrl,
}: {
    starterMonthly: Plan;
    starterYearly: Plan;
    proMonthly: Plan;
    proYearly: Plan;
    enterprise: Plan;
    signupUrl: string;
}) {
    const [interval, setInterval] = useState<"month" | "year">("month");

    const starter = interval === "month" ? starterMonthly : starterYearly;
    const pro = interval === "month" ? proMonthly : proYearly;

    const CellIcon = ({ value }: { value: boolean | string }) => {
        if (value === true) return <Check className="h-5 w-5 text-primary mx-auto" />;
        if (value === false) return <span className="text-muted-foreground/40 text-xl mx-auto block text-center">—</span>;
        return <span className="text-xs text-muted-foreground text-center block">{value}</span>;
    };

    return (
        <div className="flex flex-col w-full">
            {/* ── Hero ── */}
            <section className="pt-24 pb-16 px-4 text-center bg-background">
                <div className="container mx-auto max-w-4xl">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 mb-6">
                        Simple, Transparent Pricing
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.05]">
                        Start free. Grow at your pace.
                    </h1>
                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        No annual contracts. No hidden fees. Cancel anytime.<br />
                        7-day free trial on every paid plan.
                    </p>
                    <BillingToggle interval={interval} onChange={setInterval} />
                    <div className="mt-8 flex justify-center">
                        <PlatformStatsBadge />
                    </div>
                </div>
            </section>

            <CustomerLogoBar title="Trusted by local businesses on every plan" />

            {/* ── Plan Cards ── */}
            <section className="pb-24 px-4 bg-background">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-8">
                        <PlanCard plan={starter} isPopular={false} signupUrl={signupUrl} />
                        <PlanCard plan={pro} isPopular signupUrl={signupUrl} />
                        <PlanCard plan={enterprise} isPopular={false} signupUrl={signupUrl} />
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-8">
                        All prices in USD. Taxes may apply. By starting a trial you agree to our{" "}
                        <a href="/terms" className="underline hover:text-foreground">Terms of Service</a>.
                    </p>
                </div>
            </section>

            {/* ── Multi-Location Calculator ── */}
            <section className="py-20 px-4 bg-muted/50 border-y border-border">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-3xl font-bold text-foreground mb-2 text-center">How Professional scales per location</h2>
                    <p className="text-muted-foreground text-center mb-10">Each location gets its own full set of limits. Nothing shared.</p>
                    <div className="overflow-x-auto rounded-xl border border-border bg-card">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-border bg-muted">
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Metric</th>
                                    <th className="px-6 py-4 font-semibold text-primary text-center">1 Location</th>
                                    <th className="px-6 py-4 font-semibold text-primary text-center">2 Locations</th>
                                    <th className="px-6 py-4 font-semibold text-primary text-center">3 Locations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { metric: "Email review requests / mo", per: 700 },
                                    { metric: "SMS review requests / mo", per: 700 },
                                    { metric: "AI reply suggestions / mo", per: 2000 },
                                ].map(({ metric, per }) => (
                                    <tr key={metric} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{metric}</td>
                                        <td className="px-6 py-4 text-center text-muted-foreground">{per.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center text-muted-foreground">{(per * 2).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-foreground">{(per * 3).toLocaleString()}</td>
                                    </tr>
                                ))}
                                <tr className="border-b border-border last:border-0 bg-primary/5">
                                    <td className="px-6 py-4 font-semibold text-foreground">Monthly price</td>
                                    <td className="px-6 py-4 text-center font-bold text-foreground">$59.99</td>
                                    <td className="px-6 py-4 text-center font-bold text-foreground">$59.99</td>
                                    <td className="px-6 py-4 text-center font-bold text-primary text-lg">$59.99</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-4">
                        One flat rate covers all 3 locations. No per-location surcharge on Professional.
                    </p>
                </div>
            </section>

            {/* ── Competitor Comparison Table ── */}
            <section className="py-20 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-foreground mb-2 text-center">See how we compare</h2>
                    <p className="text-muted-foreground text-center mb-10">
                        Enterprise features at owner-operator pricing — no annual contracts required.
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-border bg-card">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="bg-muted">
                                    <th className="px-5 py-4 font-semibold text-muted-foreground border-b border-r border-border w-[35%]">Feature</th>
                                    <th className="px-5 py-4 font-bold text-primary border-b border-r border-border bg-primary/10 text-center w-[16%]">
                                        Zyene<br /><span className="text-xs font-normal text-muted-foreground">$29.99/mo</span>
                                    </th>
                                    <th className="px-5 py-4 font-semibold text-muted-foreground border-b border-r border-border text-center w-[16%]">
                                        Birdeye<br /><span className="text-xs font-normal">$299/mo</span>
                                    </th>
                                    <th className="px-5 py-4 font-semibold text-muted-foreground border-b border-r border-border text-center w-[16%]">
                                        Podium<br /><span className="text-xs font-normal">$399/mo</span>
                                    </th>
                                    <th className="px-5 py-4 font-semibold text-muted-foreground border-b border-border text-center w-[16%]">
                                        NiceJob<br /><span className="text-xs font-normal">$75/mo</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {COMPARISON_ROWS.map((row, i) => (
                                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="px-5 py-3.5 font-medium text-foreground border-r border-border">{row.feature}</td>
                                        <td className="px-5 py-3.5 border-r border-border bg-primary/5 text-center">
                                            {typeof row.zyene === "string" ? (
                                                <span className="font-bold text-foreground">{row.zyene}</span>
                                            ) : (
                                                <CellIcon value={row.zyene} />
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 border-r border-border text-center"><CellIcon value={row.birdeye} /></td>
                                        <td className="px-5 py-3.5 border-r border-border text-center"><CellIcon value={row.podium} /></td>
                                        <td className="px-5 py-3.5 text-center"><CellIcon value={row.nicejob} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-4">
                        Competitor pricing based on publicly listed rates as of 2026. Actual prices may vary.{" "}
                        <a href="/compare" className="underline hover:text-foreground">See detailed comparisons →</a>
                    </p>
                </div>
            </section>

            <TestimonialGrid
                limit={3}
                title="Trusted by owners on every plan"
                subtitle="See how local businesses grew reviews and ratings with Zyene — full stories in our case studies."
            />

            {/* ── FAQ ── */}
            <section className="py-20 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-3xl font-bold text-foreground mb-2 text-center">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground text-center mb-10">Everything you need to know before signing up.</p>
                    <div className="bg-card rounded-xl border border-border p-8">
                        {PRICING_FAQS.map((faq) => (
                            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="py-24 px-4 bg-background">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-4xl font-bold text-foreground mb-4">Ready to grow your reviews?</h2>
                    <p className="text-xl text-muted-foreground mb-10">
                        Start your 7-day free trial. No credit card lock-in.<br />
                        Cancel before the trial ends and you won&apos;t be charged.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href={signupUrl}>
                            <Button size="lg" className="px-10 py-7 text-[1.05rem] font-semibold rounded-xl">
                                Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <a
                            href="mailto:sales@zyenereviews.com?subject=Pricing%20Question"
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                            Have questions? Talk to us →
                        </a>
                    </div>
                    <p className="mt-6 text-xs text-muted-foreground">
                        Trusted by local businesses. GDPR compliant. No annual contracts.
                    </p>
                </div>
            </section>
        </div>
    );
}
