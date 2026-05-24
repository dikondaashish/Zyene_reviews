import type { CompetitorData } from "@/lib/phase3/competitor-data";
import { FeatureCellValue } from "./compare-competitor-feature-cell";
import Link from "next/link";

export function CompareCompetitorFullFeatureBreakdownSection({ data }: { data: CompetitorData }) {
    return (
        <section className="py-20 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-3xl font-bold text-foreground text-center mb-3">Feature-by-feature breakdown</h2>
                    <p className="text-muted-foreground text-center mb-10">Every feature, side by side. No marketing speak.</p>
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
                        {data.priceNote} Zyene Reviews pricing as of 2026. See <Link href="/pricing" className="underline hover:text-foreground">our pricing page</Link> for current rates.
                    </p>
                </div>
            </section>
    );
}
