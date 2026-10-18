import type { CompetitorData } from "@/lib/comparisons/competitor-data";
import { FeatureCellValue } from "./compare-competitor-feature-cell";
import Link from "next/link";

export function CompareCompetitorFullFeatureBreakdownSection({ data }: { data: CompetitorData }) {
    if (!data.featureBreakdown?.length) return null;
    return (
        <section className="marketing-section" aria-labelledby="compare-breakdown-heading">
            <div className="marketing-container">
                <div className="mi-head">
                    <p className="marketing-eyebrow">In detail</p>
                    <h2 id="compare-breakdown-heading">Feature-by-feature breakdown</h2>
                    <p>Every feature, side by side. No marketing speak.</p>
                </div>
                <div className="mi-table-wrap">
                    <table className="mi-table">
                        <caption className="sr-only">Feature-by-feature breakdown of Zyene Reviews and {data.name}</caption>
                        <thead>
                            <tr>
                                <th scope="col">Feature</th>
                                <th scope="col" className="mi-col-zyene mi-center">Zyene Reviews</th>
                                <th scope="col" className="mi-center">{data.name}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.featureBreakdown.map((row) => (
                                <tr key={row.feature}>
                                    <th scope="row">
                                        {row.feature}
                                        {row.note && <span className="mi-table-sub">{row.note}</span>}
                                    </th>
                                    <td className="mi-col-zyene mi-center">
                                        {typeof row.zyene === "string" ? row.zyene : <FeatureCellValue value={row.zyene} />}
                                    </td>
                                    <td className="mi-center">
                                        {typeof row.competitor === "string" ? row.competitor : <FeatureCellValue value={row.competitor} />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mi-table-note">
                    {data.priceNote} Zyene Reviews pricing as of 2026. See <Link href="/pricing">our pricing page</Link> for current rates.
                </p>
            </div>
        </section>
    );
}
