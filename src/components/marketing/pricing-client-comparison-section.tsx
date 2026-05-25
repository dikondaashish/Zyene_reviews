"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { COMPARISON_ROWS } from "./pricing-client-constants";

function CellIcon({ value }: { value: boolean | string }) {
    if (value === true) return <Check className="text-primary mx-auto size-5" />;
    if (value === false)
        return <span className="text-muted-foreground/40 text-xl mx-auto block text-center">,</span>;
    return <span className="text-xs text-muted-foreground text-center block">{value}</span>;
}

export function PricingClientComparisonSection() {
    return (
        <section className="py-20 px-4 bg-background">
            <div className="container mx-auto max-w-5xl">
                <h2 className="text-3xl font-bold text-foreground mb-2 text-center">See how we compare</h2>
                <p className="text-muted-foreground text-center mb-10">
                    Enterprise features at owner-operator pricing—no annual contracts required.
                </p>
                <div className="overflow-x-auto rounded-xl border border-border bg-card">
                    <table className="w-full text-sm text-left border-collapse">
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
                                    <span className="text-xs font-normal">$299/mo</span>
                                </th>
                                <th className="px-5 py-4 font-semibold text-muted-foreground border-b border-r border-border text-center w-[16%]">
                                    Podium
                                    <br />
                                    <span className="text-xs font-normal">$399/mo</span>
                                </th>
                                <th className="px-5 py-4 font-semibold text-muted-foreground border-b border-border text-center w-[16%]">
                                    NiceJob
                                    <br />
                                    <span className="text-xs font-normal">$75/mo</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {COMPARISON_ROWS.map((row, i) => (
                                <tr
                                    key={i}
                                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                                >
                                    <td className="px-5 py-3.5 font-medium text-foreground border-r border-border">
                                        {row.feature}
                                    </td>
                                    <td className="px-5 py-3.5 border-r border-border bg-primary/5 text-center">
                                        {typeof row.zyene === "string" ? (
                                            <span className="font-bold text-foreground">{row.zyene}</span>
                                        ) : (
                                            <CellIcon value={row.zyene} />
                                        )}
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
                    Competitor pricing based on publicly listed rates as of 2026. Birdeye pricing may vary by package and
                    contract—confirm with the vendor.{" "}
                    <Link href="/compare/birdeye" className="underline hover:text-foreground">
                        Zyene Reviews vs Birdeye
                    </Link>
                    {" · "}
                    <Link href="/blog/birdeye-pricing-breakdown-2026" className="underline hover:text-foreground">
                        Birdeye pricing breakdown
                    </Link>
                    {" · "}
                    <Link href="/compare" className="underline hover:text-foreground">
                        All comparisons
                    </Link>
                </p>
            </div>
        </section>
    );
}
