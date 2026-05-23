import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPETITORS } from "@/lib/phase3/competitor-data";
import { POSITIONING } from "@/lib/growth/product-foundation";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";


const SUMMARY_ROWS = [
    { feature: "Starting price (monthly)", zyene: "$29.99", birdeye: "$299", podium: "$399", nicejob: "$75", gatherup: "$99" },
    { feature: "Annual contract required", zyene: false, birdeye: true, podium: true, nicejob: false, gatherup: false },
    { feature: "7-day free trial", zyene: true, birdeye: false, podium: false, nicejob: "14 days", gatherup: "14 days" },
    { feature: "AI reply suggestions", zyene: true, birdeye: "Add-on", podium: "Basic", nicejob: false, gatherup: "Limited" },
    { feature: "Auto-commenter", zyene: true, birdeye: false, podium: false, nicejob: false, gatherup: false },
    { feature: "Negative Feedback Shield", zyene: true, birdeye: false, podium: false, nicejob: "Basic", gatherup: "Basic" },
    { feature: "Competitor tracking", zyene: true, birdeye: "Premium", podium: false, nicejob: false, gatherup: false },
    { feature: "GBP keyword dashboard", zyene: true, birdeye: false, podium: false, nicejob: false, gatherup: false },
    { feature: "REST API (all plans)", zyene: true, birdeye: "Enterprise", podium: "Limited", nicejob: false, gatherup: true },
];

function CellValue({ value }: { value: boolean | string }) {
    if (value === true) return <Check className="h-5 w-5 text-primary mx-auto" />;
    if (value === false) return <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />;
    return <span className="text-xs text-muted-foreground text-center block leading-tight">{value}</span>;
}

export default function CompareHubPage() {
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Compare", url: "https://zyenereviews.com/compare" },
                ]}
            />

            {/* ── Hero ── */}
            <section className="pt-24 pb-20 px-4 text-center bg-background">
                <div className="container mx-auto max-w-4xl">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 mb-6">
                        <Sparkles className="h-3.5 w-3.5" />
                        Honest Comparisons
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.05]">
                        See how Zyene<br />
                        <span className="text-primary">compares to the rest</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
                        We believe in honest comparisons. Here&apos;s where Zyene wins, where competitors win, and how to decide what&apos;s right for your business.
                    </p>
                    <p className="text-sm text-muted-foreground mb-10 max-w-xl mx-auto">
                        {POSITIONING.oneLiner}
                    </p>
                    <Link href="/signup">
                        <Button size="lg" className="px-8 py-6 text-base font-semibold rounded-xl">
                            Try Zyene Free for 7 Days <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* ── Competitor Cards Grid ── */}
            <section className="py-20 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-foreground text-center mb-3">Pick a comparison</h2>
                    <p className="text-muted-foreground text-center mb-12">
                        Each page has a full feature-by-feature breakdown, honest analysis, and pricing comparison.
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {COMPETITORS.map((comp) => (
                            <Link
                                key={comp.slug}
                                href={`/compare/${comp.slug}`}
                                className="group bg-card border border-border rounded-2xl p-7 hover:border-primary/50 hover:shadow-lg transition-all flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                        vs {comp.name}
                                    </h3>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                                <div className="text-3xl font-black text-destructive mb-1">{comp.price}<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                                <p className="text-xs text-muted-foreground mb-4">{comp.name} starting price</p>
                                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{comp.keyAngle}</p>
                                <div className="mt-4 pt-4 border-t border-border">
                                    <span className="text-xs font-semibold text-primary">Read full comparison →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Summary Comparison Table ── */}
            <section className="py-20 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl font-bold text-foreground text-center mb-3">All competitors at a glance</h2>
                    <p className="text-muted-foreground text-center mb-12">
                        Quick summary. See full details in each individual comparison page.
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-border bg-card">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-muted">
                                    <th className="px-5 py-4 font-semibold text-muted-foreground border-b border-r border-border text-left w-[28%]">Feature</th>
                                    <th className="px-4 py-4 font-bold text-primary border-b border-r border-border bg-primary/10 text-center w-[14%]">
                                        Zyene<br /><span className="text-xs font-normal text-muted-foreground">$29.99/mo</span>
                                    </th>
                                    <th className="px-4 py-4 font-semibold text-muted-foreground border-b border-r border-border text-center w-[14%]">
                                        Birdeye<br /><span className="text-xs font-normal">$299/mo</span>
                                    </th>
                                    <th className="px-4 py-4 font-semibold text-muted-foreground border-b border-r border-border text-center w-[14%]">
                                        Podium<br /><span className="text-xs font-normal">$399/mo</span>
                                    </th>
                                    <th className="px-4 py-4 font-semibold text-muted-foreground border-b border-r border-border text-center w-[14%]">
                                        NiceJob<br /><span className="text-xs font-normal">$75/mo</span>
                                    </th>
                                    <th className="px-4 py-4 font-semibold text-muted-foreground border-b border-border text-center w-[14%]">
                                        GatherUp<br /><span className="text-xs font-normal">$99/mo</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {SUMMARY_ROWS.map((row, i) => (
                                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="px-5 py-3.5 font-medium text-foreground border-r border-border">{row.feature}</td>
                                        <td className="px-4 py-3.5 border-r border-border bg-primary/5 text-center">
                                            {typeof row.zyene === "string" ? <span className="font-bold text-foreground">{row.zyene}</span> : <CellValue value={row.zyene} />}
                                        </td>
                                        <td className="px-4 py-3.5 border-r border-border text-center"><CellValue value={row.birdeye} /></td>
                                        <td className="px-4 py-3.5 border-r border-border text-center"><CellValue value={row.podium} /></td>
                                        <td className="px-4 py-3.5 border-r border-border text-center"><CellValue value={row.nicejob} /></td>
                                        <td className="px-4 py-3.5 text-center"><CellValue value={row.gatherup} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-4">
                        Competitor pricing based on publicly listed rates as of 2026. Actual prices may vary. See full comparisons for details.
                    </p>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-24 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-4xl font-bold text-foreground mb-4">
                        Ready to switch — or start fresh?
                    </h2>
                    <p className="text-xl text-muted-foreground mb-10">
                        Try Zyene free for 7 days. Full access, no credit card lock-in.<br />
                        Cancel before day 7 and pay nothing.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/signup">
                            <Button size="lg" className="px-10 py-7 text-[1.05rem] font-semibold rounded-xl">
                                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            Compare plans and pricing →
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
