"use client";

import { PLAN_MAP } from "@/services/stripe/plan-catalog";
import styles from "@/components/marketing/pricing.module.css";

const PRO = PLAN_MAP.professional_monthly;
const ROWS = [
    { metric: "Email review requests / mo", per: PRO.limits.emailRequestsPerMonth },
    { metric: "SMS review requests / mo", per: PRO.limits.smsRequestsPerMonth },
    { metric: "AI customer review drafts / mo", per: PRO.limits.smartRepliesPerMonth },
];

export function PricingClientLocationScaleSection() {
    return (
        <section className="marketing-section" aria-labelledby="location-scale-heading">
            <div className={`marketing-container ${styles.split}`}>
                <div className={styles.sectionHead}>
                    <p className="marketing-eyebrow">Professional</p>
                    <h2 id="location-scale-heading">How Professional scales per location.</h2>
                    <p className={styles.sectionLede}>
                        Each location gets its own full set of limits. One flat rate covers all 3, with no per-location surcharge.
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
                            {ROWS.map(({ metric, per }) => (
                                <tr key={metric}>
                                    <th scope="row">{metric}</th>
                                    <td>{per.toLocaleString("en-US")}</td>
                                    <td>{(per * 2).toLocaleString("en-US")}</td>
                                    <td>{(per * 3).toLocaleString("en-US")}</td>
                                </tr>
                            ))}
                            <tr className={styles.matrixTotal}>
                                <th scope="row">Monthly price</th>
                                <td>${PRO.price}</td>
                                <td>${PRO.price}</td>
                                <td>${PRO.price}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
