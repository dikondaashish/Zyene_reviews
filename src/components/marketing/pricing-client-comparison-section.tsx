"use client";

import Link from "next/link";
import { FeatureAvailability as CellIcon } from "@/components/marketing/feature-availability";
import styles from "@/components/marketing/pricing.module.css";
import { COMPARISON_ROWS } from "./pricing-client-constants";

const COLUMNS = [
    { name: "Zyene", price: "$29.99/mo" },
    { name: "Birdeye", price: "Quote only*" },
    { name: "Podium", price: "Quote only*" },
    { name: "NiceJob", price: "Starter $75/mo" },
];

export function PricingClientComparisonSection() {
    return (
        <section className="marketing-section" aria-labelledby="pricing-compare-heading">
            <div className="marketing-container">
                <div className={styles.sectionHead}>
                    <p className="marketing-eyebrow">Other platforms</p>
                    <h2 id="pricing-compare-heading">See how we compare.</h2>
                    <p className={styles.sectionLede}>
                        Compare the workflows and allowances your business needs. A lower price does not mean identical coverage.
                    </p>
                </div>
                <div role="region" aria-label="Platform feature comparison" tabIndex={0} className={styles.matrixWrap}>
                    <table className={`${styles.matrix} ${styles.compare}`}>
                        <thead>
                            <tr>
                                <th scope="col">Feature</th>
                                {COLUMNS.map((col) => (
                                    <th key={col.name} scope="col" className={col.name === "Zyene" ? styles.matrixOurs : undefined}>
                                        {col.name}
                                        <small>{col.price}</small>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {COMPARISON_ROWS.map((row) => (
                                <tr key={row.feature}>
                                    <th scope="row">{row.feature}</th>
                                    <td className={styles.matrixOurs}><strong>{row.zyene}</strong></td>
                                    <td><CellIcon value={row.birdeye} /></td>
                                    <td><CellIcon value={row.podium} /></td>
                                    <td><CellIcon value={row.nicejob} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className={styles.footnote}>
                    Public sources checked October 11, 2026: <a href="https://birdeye.com/pricing/" className="underline">Birdeye</a>, <a href="https://www.podium.com/pricing" className="underline">Podium</a>, and <a href="https://get.nicejob.com/pricing" className="underline">NiceJob</a>. *Birdeye and Podium do not publish prices. The figures shown come from third-party reports, not the vendors, and real quotes vary by locations and products. Confirm current quotes, plans and platform coverage.{" "}
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
