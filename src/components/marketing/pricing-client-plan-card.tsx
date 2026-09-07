"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import type { Plan } from "@/services/stripe/plans";
import { PricingPriceDisplay } from "@/components/marketing/pricing-price-display";
import styles from "@/components/marketing/pricing.module.css";

export function PricingClientPlanCard({
  plan,
  isPopular,
  signupUrl,
}: {
  plan: Plan;
  isPopular: boolean;
  signupUrl: string;
}) {
  const enterprise = plan.id === "enterprise";
  const description = enterprise
    ? "For teams with custom needs"
    : isPopular
      ? "For growing businesses and teams"
      : "For your first business location";
  return (
    <article aria-labelledby={`${plan.id}-name`} className={`${styles.card} ${isPopular ? styles.popular : ""}`}>
      {isPopular && <p className={styles.badge}>Most Popular</p>}
      <div className={styles.planHeading}>
        <h2 id={`${plan.id}-name`}>{plan.name}</h2>
        <p>{description}</p>
      </div>
      <PricingPriceDisplay plan={plan} />
      <Link
        href={enterprise ? "/demo" : signupUrl}
        className={`marketing-button ${styles.cta} ${isPopular ? "" : "marketing-button-secondary"}`}
      >
        {enterprise ? "Talk to sales" : "Start 7-day free trial"}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
      <ul className={styles.features}>
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>{feature.replace(" (public review link flow, step 3)", "")}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
