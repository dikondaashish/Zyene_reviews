"use client";

import Link from "next/link";
import { FeatureAvailability as CellIcon } from "@/components/marketing/feature-availability";
import { COMPARISON_ROWS } from "./pricing-client-constants";

export function PricingClientComparisonSection() {
    return (
        <section className="py-20 px-4 bg-background">
            <div className="container mx-auto max-w-5xl">
                <h2 className="text-[length:var(--fs-h2)] font-semibold text-foreground mb-2 text-center">See how we compare</h2>
                <p className="text-muted-foreground text-center mb-10">
                    Compare the workflows and allowances your business needs. A lower price does not mean identical coverage.
                </p>
                <div role="region" aria-label="Platform feature comparison" tabIndex={0} className="relative overflow-x-auto rounded-xl border border-border bg-card">
                    <table className="min-w-[640px] w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-muted">
                                <th className="px-5 py-4 font-semibold text-muted-foreground border-b border-r border-border w-[35%]">
                                    Feature
                                </th>
                                <th className="px-5 py-4 font-bold text-primary border-b border-r border-border bg-primary/10 text-center w-[16%]">
                                    Zyene
                                    <br />
                                    <span className="text-xs font-normal text-muted-foreground">$29.99/mo</span>
                                </th>
                                <th className="px-5 py-4 font-semibold text-muted-foreground border-b border-r border-border text-center w-[16%]">
                                    Birdeye
                                    <br />
                                    <span className="text-xs font-normal">Custom quote</span>
                                </th>
                                <th className="px-5 py-4 font-semibold text-muted-foreground border-b border-r border-border text-center w-[16%]">
                                    Podium
                                    <br />
                                    <span className="text-xs font-normal">Custom quote</span>
                                </th>
                                <th className="px-5 py-4 font-semibold text-muted-foreground border-b border-border text-center w-[16%]">
                                    NiceJob
                                    <br />
                                    <span className="text-xs font-normal">Starter $75/mo</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {COMPARISON_ROWS.map((row) => (
                                <tr
                                    key={row.feature}
                                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                                >
                                    <td className="px-5 py-3.5 font-medium text-foreground border-r border-border">
                                        {row.feature}
                                    </td>
                                    <td className="px-5 py-3.5 border-r border-border bg-primary/5 text-center">
                                        <span className="font-bold text-foreground">{row.zyene}</span>
                                    </td>
                                    <td className="px-5 py-3.5 border-r border-border text-center">
                                        <CellIcon value={row.birdeye} />
                                    </td>
                                    <td className="px-5 py-3.5 border-r border-border text-center">
                                        <CellIcon value={row.podium} />
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <CellIcon value={row.nicejob} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-4">
                    Public sources checked October 11, 2026: <a href="https://birdeye.com/pricing/" className="underline">Birdeye</a>, <a href="https://www.podium.com/pricing" className="underline">Podium</a>, and <a href="https://get.nicejob.com/pricing" className="underline">NiceJob</a>. Confirm current quotes, plans and platform coverage.{" "}
                    <Link href="/compare/birdeye" className="underline hover:text-foreground">
                        Zyene Reviews vs Birdeye
                    </Link>
                    {" · "}
                    <Link href="/blog/birdeye-pricing-breakdown-2026" className="underline hover:text-foreground">
                        Birdeye pricing breakdown
                    </Link>
                    {" · "}
                    <Link href="/small-business" className="underline hover:text-foreground">
                        Review management for small business
                    </Link>
                    {" · "}
                    <Link href="/compare" className="underline hover:text-foreground">
                        All comparisons
                    </Link>
                    {" · "}
                    <Link href="/resources/review-request-templates" className="underline hover:text-foreground">
                        Free review request templates
                    </Link>
                </p>
            </div>
        </section>
    );
}
