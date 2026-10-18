import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PricingPriceDisplay } from "@/components/marketing/pricing-price-display";
import { SIGNUP_URL } from "@/config/env";
import { PLAN_MAP } from "@/services/stripe/plan-catalog";

const INCLUDED = [
    "AI drafts and automatic Google replies",
    "Negative Feedback Shield for private follow-up",
    "SMS and email review requests",
    "Competitor tracking and review monitoring",
];

/** Same shape as the homepage pricing teaser: the daily price leads, monthly billing supports it. */
export function IndustriesIndustryPricingReminderSection({ heading }: { heading: string }) {
    return (
        <section className="marketing-section home-pricing" aria-labelledby="ind-pricing-heading">
            <div className="marketing-container home-pricing-grid">
                <div>
                    <p className="marketing-eyebrow">Pricing</p>
                    <h2 id="ind-pricing-heading">{heading}</h2>
                    <p className="home-section-lede">
                        Starter covers one location. Professional covers up to three, and Enterprise is built around you.
                        No annual contract.
                    </p>
                    <div className="home-pricing-links">
                        <Link href="/pricing" className="home-text-link">
                            Compare all plans <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                        <Link href="/small-business" className="home-text-link">
                            Why small businesses choose Zyene <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
                <div className="home-pricing-card">
                    <p className="home-pricing-plan">
                        <strong>Starter</strong>
                        <span>One business location</span>
                    </p>
                    <PricingPriceDisplay plan={PLAN_MAP.starter_monthly} />
                    <ul>
                        {INCLUDED.map((item) => (
                            <li key={item}>
                                <Check size={16} aria-hidden="true" />
                                {item}
                            </li>
                        ))}
                    </ul>
                    <Link href={SIGNUP_URL} className="marketing-button" data-track="trial" data-track-location="industry-pricing">
                        Start 7-day free trial <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
