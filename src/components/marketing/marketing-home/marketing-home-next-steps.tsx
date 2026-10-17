import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SIGNUP_URL } from "@/config/env";
import { PLAN_MAP } from "@/services/stripe/plan-catalog";
import { PricingPriceDisplay } from "@/components/marketing/pricing-price-display";

const INCLUDED = [
  "Google, Facebook and Yelp reviews in one inbox",
  "SMS and email review requests",
  "AI reply drafts and automatic Google replies",
  "QR codes, review page and competitor tracking",
];

export function MarketingHomeNextSteps() {
  return (
    <section id="pricing" className="marketing-section home-pricing" aria-labelledby="home-pricing-heading">
      <div className="marketing-container home-pricing-grid">
        <div>
          <p className="marketing-eyebrow">Pricing</p>
          <h2 id="home-pricing-heading">Priced for local businesses, not enterprise budgets.</h2>
          <p className="home-section-lede">
            One location or a growing team. No contracts and no cancellation fees.
          </p>
          <div className="home-pricing-links">
            <Link href="/pricing" className="home-text-link">
              Compare all plans <ArrowRight size={14} aria-hidden="true" />
            </Link>
            <Link href="/compare" className="home-text-link">
              Zyene vs. other platforms <ArrowRight size={14} aria-hidden="true" />
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
          <Link href={SIGNUP_URL} className="marketing-button" data-track="trial" data-track-location="pricing">
            Start 7-day free trial <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
