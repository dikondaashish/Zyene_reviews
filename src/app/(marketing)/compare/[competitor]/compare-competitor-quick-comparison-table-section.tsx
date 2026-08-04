import type { CompetitorData } from "@/lib/comparisons/competitor-data";
import { FeatureCellValue } from "./compare-competitor-feature-cell";

export function CompareCompetitorQuickComparisonTableSection({ data }: { data: CompetitorData }) {
    return (
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
    );
}
