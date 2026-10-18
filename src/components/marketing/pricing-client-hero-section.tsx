"use client";

import { BillingToggle } from "@/components/marketing/pricing-client-billing-toggle";
import styles from "@/components/marketing/pricing.module.css";
import { TRIAL_SUMMARY } from "@/lib/marketing/trial-copy";

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
          <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">{TRIAL_SUMMARY}</p>
        </div>
        <BillingToggle interval={interval} onChange={onIntervalChange} />
      </div>
    </section>
  );
}
