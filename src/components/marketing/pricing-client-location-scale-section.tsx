"use client";

import type { Plan } from "@/services/stripe/plan-catalog";
import { getPricingPresentation } from "@/lib/marketing/pricing-presentation";
import styles from "@/components/marketing/pricing.module.css";

/** `pro` is the Professional plan for the selected billing interval, so the price row follows the toggle. */
export function PricingClientLocationScaleSection({ pro }: { pro: Plan }) {
    const rows = [
        { metric: "Email review requests / mo", per: pro.limits.emailRequestsPerMonth },
        { metric: "SMS review requests / mo", per: pro.limits.smsRequestsPerMonth },
        { metric: "AI customer review drafts / mo", per: pro.limits.smartRepliesPerMonth },
    ];
    const price = getPricingPresentation(pro);
    const priceLabel = price?.annualCharge ? `Monthly equivalent (${price.annualCharge} billed annually)` : "Monthly price";
    return (
        <section className="marketing-section" aria-labelledby="location-scale-heading">
            <div className={`marketing-container ${styles.split}`}>
                <div className={styles.sectionHead}>
                    <p className="marketing-eyebrow">Professional</p>
                    <h2 id="location-scale-heading">How Professional scales per location.</h2>
                    <p className={styles.sectionLede}>
                        Each location gets its own full set of limits. One flat rate covers all {pro.limits.maxLocations}, with no per-location surcharge.
                    </p>
                </div>
                <div role="region" aria-label="Professional plan by location count" tabIndex={0} className={styles.matrixWrap}>
                    <table className={styles.matrix}>
                        <thead>
                            <tr>
                                <th scope="col">Metric</th>
                                <th scope="col">1 location</th>
                                <th scope="col">2 locations</th>
                                <th scope="col">3 locations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(({ metric, per }) => (
                                <tr key={metric}>
                                    <th scope="row">{metric}</th>
                                    <td>{per.toLocaleString("en-US")}</td>
                                    <td>{(per * 2).toLocaleString("en-US")}</td>
                                    <td>{(per * 3).toLocaleString("en-US")}</td>
                                </tr>
                            ))}
                            {price && (
                                <tr className={styles.matrixTotal}>
                                    <th scope="row">{priceLabel}</th>
                                    <td>{price.monthlyPrice}</td>
                                    <td>{price.monthlyPrice}</td>
                                    <td>{price.monthlyPrice}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
