import type { CompetitorData } from "@/lib/comparisons/competitor-data";
import { FeatureCellValue } from "./compare-competitor-feature-cell";

export function CompareCompetitorQuickComparisonTableSection({ data }: { data: CompetitorData }) {
    return (
        <section className="marketing-section" aria-labelledby="compare-quick-heading">
            <div className="marketing-container">
                <div className="mi-head">
                    <p className="marketing-eyebrow">At a glance</p>
                    <h2 id="compare-quick-heading">Quick comparison</h2>
                </div>
                <div className="mi-table-wrap">
                    <table className="mi-table">
                        <caption className="sr-only">Zyene Reviews compared with {data.name}</caption>
                        <thead>
                            <tr>
                                <th scope="col">Feature</th>
                                <th scope="col" className="mi-col-zyene mi-center">Zyene Reviews</th>
                                <th scope="col" className="mi-center">{data.name}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.quickTable.map((row) => (
                                <tr key={row.feature}>
                                    <th scope="row">{row.feature}</th>
                                    <td className="mi-col-zyene mi-center">
                                        {typeof row.zyene === "string" ? <span className="font-medium">{row.zyene}</span> : <FeatureCellValue value={row.zyene} />}
                                    </td>
                                    <td className="mi-center">
                                        {typeof row.competitor === "string" ? row.competitor : <FeatureCellValue value={row.competitor} />}
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
