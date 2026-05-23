import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, X, ChevronDown, ChevronRight, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPETITOR_MAP, COMPETITOR_SLUGS } from "@/lib/phase3/competitor-data";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

// ─── Static Generation ────────────────────────────────────────────────────────


// ─── Metadata ─────────────────────────────────────────────────────────────────


// ─── Accordion Item ───────────────────────────────────────────────────────────
// This page is a server component but we need the accordion to be interactive.
// We render the feature breakdown as a full table (always visible) — no client JS needed.

function FeatureCellValue({ value }: { value: boolean | string }) {
    if (value === true) return <Check className="h-5 w-5 text-primary mx-auto" />;
    if (value === false) return <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />;
    return <span className="text-xs text-muted-foreground text-center block leading-tight">{value}</span>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CompetitorPage(
    { params }: { params: Promise<{ competitor: string }> }
) {
    const { competitor: slug } = await params;
    const data = COMPETITOR_MAP[slug];
    if (!data) notFound();

    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Compare", url: "https://zyenereviews.com/compare" },
                    { name: `Zyene vs ${data.name}`, url: `https://zyenereviews.com/compare/${slug}` },
                ]}
            />

            {/* ── Hero ── */}
            <section className="pt-24 pb-20 px-4 bg-background">
                <div className="container mx-auto max-w-4xl text-center">
                    {/* Breadcrumb */}
                    <nav className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6">
                        <Link href="/compare" className="hover:text-primary transition-colors">Compare</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-foreground font-medium">Zyene vs {data.name}</span>
                    </nav>

                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 mb-6">
                        <Sparkles className="h-3.5 w-3.5" />
                        Honest Comparison — 2026
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-5 leading-[1.05]">
                        Zyene Reviews<br />
                        <span className="text-primary">vs {data.name}</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">{data.heroSub}</p>

                    {/* Quick price callout */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-10">
                        <div className="text-center">
                            <div className="text-5xl font-black text-primary">$29.99</div>
                            <div className="text-sm text-muted-foreground mt-1">Zyene / month</div>
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
                        <Link href="/signup">
                            <Button size="lg" className="px-8 py-6 text-base font-semibold rounded-xl">
                                Try Zyene Free for 7 Days <ArrowRight className="ml-2 h-4 w-4" />
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

            {/* ── Quick Comparison Table ── */}
            <section className="py-16 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-2xl font-bold text-foreground text-center mb-8">Quick comparison</h2>
                    <div className="overflow-x-auto rounded-xl border border-border bg-card">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-muted">
                                    <th className="px-6 py-4 font-semibold text-muted-foreground border-b border-r border-border text-left">Feature</th>
                                    <th className="px-6 py-4 font-bold text-primary border-b border-r border-border bg-primary/10 text-center">Zyene Reviews</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground border-b border-border text-center">{data.name}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.quickTable.map((row, i) => (
                                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-3.5 font-medium text-foreground border-r border-border">{row.feature}</td>
                                        <td className="px-6 py-3.5 border-r border-border bg-primary/5 text-center">
                                            {typeof row.zyene === "string" ? <span className="font-semibold text-foreground text-sm">{row.zyene}</span> : <FeatureCellValue value={row.zyene} />}
                                        </td>
                                        <td className="px-6 py-3.5 text-center">
                                            {typeof row.competitor === "string" ? <span className="text-sm text-muted-foreground">{row.competitor}</span> : <FeatureCellValue value={row.competitor} />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ── Where Each Wins ── */}
            <section className="py-20 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-foreground text-center mb-12">Where each one wins</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Competitor wins */}
                        <div className="bg-card border border-border rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center font-bold text-foreground text-sm shrink-0">
                                    {data.name.slice(0, 2)}
                                </div>
                                <h3 className="text-xl font-bold text-foreground">Where {data.name} wins</h3>
                            </div>
                            <ul className="space-y-3">
                                {data.winsForCompetitor.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                        <Check className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Zyene wins */}
                        <div className="bg-card border-2 border-primary/30 rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">Where Zyene wins</h3>
                            </div>
                            <ul className="space-y-3">
                                {data.winsForZyene.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Full Feature Breakdown ── */}
            <section className="py-20 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-3xl font-bold text-foreground text-center mb-3">Feature-by-feature breakdown</h2>
                    <p className="text-muted-foreground text-center mb-10">Every feature, side by side. No marketing speak.</p>
                    <div className="overflow-x-auto rounded-xl border border-border bg-card">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-muted">
                                    <th className="px-6 py-4 font-semibold text-muted-foreground border-b border-r border-border text-left">Feature</th>
                                    <th className="px-6 py-4 font-bold text-primary border-b border-r border-border bg-primary/10 text-center">Zyene</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground border-b border-border text-center">{data.name}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.featureBreakdown.map((row, i) => (
                                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-3.5 font-medium text-foreground border-r border-border">
                                            {row.feature}
                                            {row.note && <span className="ml-2 text-[11px] text-muted-foreground/60 font-normal">({row.note})</span>}
                                        </td>
                                        <td className="px-6 py-3.5 border-r border-border bg-primary/5 text-center">
                                            {typeof row.zyene === "string" ? <span className="text-sm text-foreground">{row.zyene}</span> : <FeatureCellValue value={row.zyene} />}
                                        </td>
                                        <td className="px-6 py-3.5 text-center">
                                            {typeof row.competitor === "string" ? <span className="text-sm text-muted-foreground">{row.competitor}</span> : <FeatureCellValue value={row.competitor} />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-4">
                        {data.priceNote} Zyene pricing as of 2026. See <Link href="/pricing" className="underline hover:text-foreground">our pricing page</Link> for current rates.
                    </p>
                </div>
            </section>

            {/* ── Who Should Use Which ── */}
            <section className="py-20 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-foreground text-center mb-12">Who should use which?</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-card border border-border rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-foreground mb-6">Choose {data.name} if you need:</h3>
                            <ul className="space-y-3">
                                {data.whoShouldUseCompetitor.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-primary/5 border-2 border-primary/30 rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-foreground mb-6">Choose Zyene if you need:</h3>
                            <ul className="space-y-3">
                                {data.whoShouldUseZyene.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Other Comparisons ── */}
            <section className="py-12 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-4xl">
                    <p className="text-sm font-semibold text-muted-foreground text-center mb-6">Other comparisons</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {COMPETITOR_SLUGS.filter((s) => s !== slug).map((s) => {
                            const comp = COMPETITOR_MAP[s];
                            return (
                                <Link
                                    key={s}
                                    href={`/compare/${s}`}
                                    className="text-sm font-medium text-muted-foreground hover:text-primary border border-border rounded-lg px-4 py-2 hover:border-primary/50 transition-all bg-card"
                                >
                                    Zyene vs {comp.name} →
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="py-24 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-4xl font-bold text-foreground mb-4">
                        Try Zyene free for 7 days
                    </h2>
                    <p className="text-xl text-muted-foreground mb-10">
                        No annual contract. No credit card lock-in.<br />
                        Cancel before day 7 — pay nothing.
                    </p>
                    <Link href="/signup">
                        <Button size="lg" className="px-12 py-7 text-[1.05rem] font-semibold rounded-xl">
                            Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <p className="mt-5 text-sm text-muted-foreground">
                        Already using {data.name}?{" "}
                        <a href="mailto:hello@zyenereviews.com?subject=Switching%20from%20{data.name}" className="underline hover:text-foreground">
                            Talk to us about migration →
                        </a>
                    </p>
                </div>
            </section>
        </>
    );
}
