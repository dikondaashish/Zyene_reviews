import { Check } from "lucide-react";
import { ENTERPRISE_SLA_BULLETS } from "@/lib/enterprise/enterprise-data";

export function EnterpriseSection3Section() {
    return (
        <section className="marketing-section" aria-labelledby="enterprise-rollout-heading">
            <div className="marketing-container mi-split">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Rollout and support</p>
                    <h2 id="enterprise-rollout-heading">Planned with you before launch.</h2>
                    <p>We agree the rollout, support and security details with your team before you choose a plan.</p>
                </div>
                <ul className="mi-list">
                    {ENTERPRISE_SLA_BULLETS.map((bullet) => (
                        <li key={bullet}>
                            <Check size={18} aria-hidden="true" />
                            <p className="mi-list-title">{bullet}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
