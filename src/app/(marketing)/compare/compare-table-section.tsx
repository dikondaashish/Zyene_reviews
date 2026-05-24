import { SUMMARY_ROWS } from "./compare-data";
import { CellValue } from "./compare-cell-value";
import Link from "next/link";
import { ArrowRight, Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPETITOR_MAP, COMPETITOR_SLUGS } from "@/lib/phase3/competitor-data";
import { FeatureCellValue } from "./[competitor]/compare-competitor-feature-cell";

export function CompareTableSection() {
    return (
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
                                        Zyene Reviews<br /><span className="text-xs font-normal text-muted-foreground">$29.99/mo</span>
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
    );
}
