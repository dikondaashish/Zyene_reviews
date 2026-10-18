import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { AGENCY_PRICING_TIERS } from "@/lib/enterprise/agency-pricing-data";

export function AgenciesSection3Section() {
    return (
        <section className="marketing-section" aria-labelledby="agencies-pricing-heading">
            <div className="marketing-container">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Pricing</p>
                    <h2 id="agencies-pricing-heading">Agency pricing tiers</h2>
                    <p>
                        Choose pricing that grows with your client roster. Configure automatic Google replies for each eligible client business with its own tone and star threshold. Our partnerships team can help scope your rollout.
                    </p>
                    <Link href="/features/ai-replies" className="home-text-link">
                        See automatic Google replies <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                </div>
                <ul className="mi-cards" data-cols="3">
                    {AGENCY_PRICING_TIERS.map((tier) => (
                        <li key={tier.id} className="mi-card agencies-tier">
                            <h3>{tier.name}</h3>
                            <span className="mi-card-meta">{tier.clientRange}</span>
                            <p>{tier.priceLabel}</p>
                            <ul className="mi-checks">
                                {tier.highlights.map((highlight) => (
                                    <li key={highlight}>
                                        <Check size={16} aria-hidden="true" />
                                        {highlight}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/demo"
                                className="marketing-button marketing-button-secondary"
                                data-track="demo"
                                data-track-location={`agencies-${tier.id}`}
                            >
                                {tier.cta}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
