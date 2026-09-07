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
    <section className="pb-12 pt-12 md:pt-20">
      <div className={styles.intro}>
        <div className={styles.introCopy}>
          <p className="marketing-eyebrow">Simple plans. Plenty of room to grow.</p>
          <h1 className="mb-5 max-w-2xl text-4xl md:text-6xl">
            A better reputation.
            <br />
            At a sensible price.
          </h1>
          <p className="text-lg text-muted-foreground">Try any paid plan free for 7 days. Cancel anytime.</p>
        </div>
        <BillingToggle interval={interval} onChange={onIntervalChange} />
      </div>
    </section>
  );
}
