"use client";

import Link from "next/link";
import type { Plan } from "@/services/stripe/plans";
import { PricingClientPlanCard } from "@/components/marketing/pricing-client-plan-card";
import styles from "@/components/marketing/pricing.module.css";

interface PricingClientPlansSectionProps {
  starter: Plan;
  pro: Plan;
  enterprise: Plan;
  signupUrl: string;
}

export function PricingClientPlansSection({ starter, pro, enterprise, signupUrl }: PricingClientPlansSectionProps) {
  return (
    <section id="pricing-plans" aria-label="Choose your plan" className={styles.plans}>
      <div className="marketing-container">
        <div className={styles.grid}>
          <PricingClientPlanCard plan={starter} isPopular={false} signupUrl={signupUrl} />
          <PricingClientPlanCard plan={pro} isPopular signupUrl={signupUrl} />
          <PricingClientPlanCard plan={enterprise} isPopular={false} signupUrl={signupUrl} />
        </div>
        <p className={styles.plansNote}>
          Daily equivalents are display estimates. Plans are billed monthly or annually. All prices in USD and taxes
          may apply. By starting a trial you agree to our <Link href="/terms">Terms of Service</Link>.{" "}
          <Link href="#compare-plans">Compare every feature</Link>
        </p>
      </div>
    </section>
  );
}
