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
    <section id="pricing-plans" aria-label="Choose your plan" className="pb-24 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className={styles.grid}>
          <PricingClientPlanCard plan={starter} isPopular={false} signupUrl={signupUrl} />
          <PricingClientPlanCard plan={pro} isPopular signupUrl={signupUrl} />
          <PricingClientPlanCard plan={enterprise} isPopular={false} signupUrl={signupUrl} />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Daily equivalents are display estimates. Plans are billed monthly or annually.
        </p>
        <p className="text-center text-xs text-muted-foreground mt-8">
          All prices in USD. Taxes may apply. By starting a trial you agree to our{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
