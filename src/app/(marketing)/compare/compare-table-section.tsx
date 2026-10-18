import Link from "next/link";
import { MarketingGeoSummary } from "@/components/marketing/marketing-geo-summary";
import { HUB_MATRIX_ROWS } from "./compare-hub-matrix-data";
import { CellValue } from "./compare-cell-value";

const VENDORS = [
    { key: "birdeye", name: "Birdeye" },
    { key: "podium", name: "Podium" },
    { key: "nicejob", name: "NiceJob" },
    { key: "gatherup", name: "GatherUp" },
] as const;

export function CompareTableSection() {
    return (
        <section className="marketing-section" aria-labelledby="compare-matrix-heading">
            <div className="marketing-container">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Side by side</p>
                    <h2 id="compare-matrix-heading">Side-by-side comparison matrix</h2>
                    <p>
                        Compare Zyene Reviews with Birdeye, Podium, NiceJob, and GatherUp. Zyene Reviews is not better at
                        everything - we call out where each platform leads so you can shortlist honestly. For Prosperly’s
                        law- and insurance-focused workflow, see the{" "}
                        <Link href="/compare/prosperly" className="mi-inline-link">full Prosperly comparison</Link>.
                    </p>
                </div>
                <MarketingGeoSummary className="cmp-hub-takeaway">
                    Zyene Reviews wins on focused review alerts, AI-assisted replies, Shield, and local-business
                    pricing transparency. Birdeye leads enterprise CX; Podium leads messaging and payments; NiceJob
                    leads reputation marketing; GatherUp leads feedback and survey depth.
                </MarketingGeoSummary>
                <div className="mi-table-wrap">
                    <table className="mi-table cmp-hub-matrix">
                        <caption className="sr-only">Zyene Reviews compared with Birdeye, Podium, NiceJob and GatherUp</caption>
                        <thead>
                            <tr>
                                <th scope="col">Compare on</th>
                                <th scope="col" className="cmp-hub-zyene">Zyene Reviews</th>
                                {VENDORS.map((vendor) => <th key={vendor.key} scope="col">{vendor.name}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {HUB_MATRIX_ROWS.map((row) => (
                                <tr key={row.feature}>
                                    <th scope="row">{row.feature}</th>
                                    <td className="cmp-hub-zyene"><CellValue value={row.zyene} /></td>
                                    {VENDORS.map((vendor) => <td key={vendor.key}><CellValue value={row[vendor.key]} /></td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mi-table-note">
                    Competitor pricing and packaging change frequently. Figures on child compare pages reflect
                    published positioning only - pricing can vary by package, contract terms, and location count;
                    confirm with the vendor. Zyene Reviews public plans are on <Link href="/pricing">/pricing</Link>.
                </p>
            </div>
        </section>
    );
}
