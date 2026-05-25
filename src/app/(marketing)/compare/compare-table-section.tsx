import { HUB_MATRIX_ROWS } from "./compare-hub-matrix-data";
import { CellValue } from "./compare-cell-value";

export function CompareTableSection() {
    return (
        <section
            className="py-20 px-4 bg-background border-t border-border"
            aria-labelledby="compare-matrix-heading"
        >
            <div className="container mx-auto max-w-6xl">
                <h2 id="compare-matrix-heading" className="text-3xl font-bold text-foreground text-center mb-3">
                    Zyene Reviews vs Birdeye vs Podium vs NiceJob vs GatherUp
                </h2>
                <p className="text-muted-foreground text-center mb-4 max-w-3xl mx-auto">
                    High-intent comparison matrix for review management software. Zyene Reviews is not better at
                    everything—we call out where each platform leads so you can shortlist honestly.
                </p>
                <p
                    className="text-sm text-foreground text-center mb-12 max-w-2xl mx-auto rounded-xl border border-border bg-muted/50 px-4 py-3"
                    data-geo-summary=""
                >
                    <span className="sr-only">Key takeaway: </span>
                    Zyene Reviews wins on focused review alerts, AI-assisted replies, Shield, and local-business
                    pricing transparency. Birdeye leads enterprise CX; Podium leads messaging and payments; NiceJob
                    leads reputation marketing; GatherUp leads feedback and survey depth.
                </p>
                <div className="overflow-x-auto rounded-xl border border-border bg-card">
                    <table className="w-full text-sm border-collapse min-w-[960px]">
                        <thead>
                            <tr className="bg-muted">
                                <th className="px-5 py-4 font-semibold text-muted-foreground border-b border-r border-border text-left w-[22%]">
                                    Compare on
                                </th>
                                <th className="px-3 py-4 font-bold text-primary border-b border-r border-border bg-primary/10 text-center w-[15.5%]">
                                    Zyene Reviews
                                </th>
                                <th className="px-3 py-4 font-semibold text-muted-foreground border-b border-r border-border text-center w-[15.5%]">
                                    Birdeye
                                </th>
                                <th className="px-3 py-4 font-semibold text-muted-foreground border-b border-r border-border text-center w-[15.5%]">
                                    Podium
                                </th>
                                <th className="px-3 py-4 font-semibold text-muted-foreground border-b border-r border-border text-center w-[15.5%]">
                                    NiceJob
                                </th>
                                <th className="px-3 py-4 font-semibold text-muted-foreground border-b border-border text-center w-[15.5%]">
                                    GatherUp
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {HUB_MATRIX_ROWS.map((row) => (
                                <tr
                                    key={row.feature}
                                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                                >
                                    <td className="px-5 py-3.5 font-medium text-foreground border-r border-border align-top">
                                        {row.feature}
                                    </td>
                                    <td className="px-3 py-3.5 border-r border-border bg-primary/5 text-center align-top">
                                        <CellValue value={row.zyene} />
                                    </td>
                                    <td className="px-3 py-3.5 border-r border-border text-center align-top">
                                        <CellValue value={row.birdeye} />
                                    </td>
                                    <td className="px-3 py-3.5 border-r border-border text-center align-top">
                                        <CellValue value={row.podium} />
                                    </td>
                                    <td className="px-3 py-3.5 border-r border-border text-center align-top">
                                        <CellValue value={row.nicejob} />
                                    </td>
                                    <td className="px-3 py-3.5 text-center align-top">
                                        <CellValue value={row.gatherup} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-4 max-w-3xl mx-auto">
                    Competitor pricing and packaging change frequently. Figures on child compare pages reflect
                    published positioning only—pricing can vary by package, contract terms, and location count;
                    confirm with the vendor. Zyene Reviews public plans are on /pricing.
                </p>
            </div>
        </section>
    );
}
