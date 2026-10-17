"use client";

import { BillingToggle } from "@/components/marketing/pricing-client-billing-toggle";
import styles from "@/components/marketing/pricing.module.css";

export function PricingClientHeroSection({
  interval,
  onIntervalChange,
}: {
  interval: "month" | "year";
  onIntervalChange: (value: "month" | "year") => void;
}) {
  return (
    <section className={styles.hero}>
      <div className={`marketing-container ${styles.intro}`}>
        <div className={styles.introCopy}>
          <p className="marketing-eyebrow">Pricing</p>
          <h1 className={styles.heroTitle}>
            <span>A better reputation.</span> <span>At a sensible price.</span>
          </h1>
          <p className={styles.heroLede}>Try Starter or Professional free for 7 days. No contract, cancel anytime.</p>
        </div>
        <BillingToggle interval={interval} onChange={onIntervalChange} />
      </div>
    </section>
  );
}
