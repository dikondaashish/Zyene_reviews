import type { Plan } from "@/services/stripe/plans";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export function EnterpriseSection5Section({ enterprisePlan }: { enterprisePlan: Plan }) {
    return (
        <section className="marketing-section" aria-labelledby="enterprise-included-heading">
            <div className="marketing-container mi-split">
                <div>
                    <div className="mi-head">
                        <p className="marketing-eyebrow">What&apos;s included</p>
                        <h2 id="enterprise-included-heading">What an Enterprise plan includes.</h2>
                    </div>
                    <ul className="mi-checks">
                        {enterprisePlan.features.map((feature) => (
                            <li key={feature}>
                                <Check size={16} aria-hidden="true" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mi-panel">
                    <h3>Plan your rollout</h3>
                    <p>Discuss your locations, team access, integrations, and reporting needs with our team.</p>
                    <p>We will confirm the available features, implementation scope, and pricing before you commit.</p>
                    <div className="marketing-actions">
                        <Link href="/demo" className="marketing-button" data-track="demo" data-track-location="enterprise">
                            Book a demo <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                    </div>
                    <div className="mi-panel-foot">
                        <Link href="/security" className="home-text-link">
                            Security and trust center <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
