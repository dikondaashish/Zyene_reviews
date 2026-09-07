import type { Plan } from "@/services/stripe/plan-catalog";
import { getPricingPresentation } from "@/lib/marketing/pricing-presentation";
import styles from "@/components/marketing/pricing.module.css";

export function PricingPriceDisplay({ plan }: { plan: Pick<Plan, "price" | "originalPrice" | "interval"> }) {
  const price = getPricingPresentation(plan);

  if (!price) {
    return (
      <div className={styles.priceDisplay}>
        <div aria-hidden="true" />
        <div className={styles.customPrice}>Let’s talk</div>
        <p className={styles.billingNote}>A plan built around your business</p>
      </div>
    );
  }

  return (
    <div className={styles.priceDisplay}>
      <div className={styles.priceContent} key={plan.interval}>
        <div className={styles.billingPrice}>
          {price.referencePrice && (
            <p className={styles.referencePrice}>
              <span className="sr-only">Reference price: </span>
              <s>{price.referencePrice}</s>
            </p>
          )}
          <p className={styles.monthlyPrice}>
            {!price.annualCharge && <span className="sr-only">Current price: </span>}
            {price.monthlyPrice}
            <span>/month</span>
            {price.annualCharge && <span className={styles.equivalentLabel}> equivalent</span>}
          </p>
          {price.annualCharge && <p className={styles.annualCharge}>{price.annualCharge} billed annually</p>}
        </div>
        <p className={styles.dailyPrice}>
          <span className={styles.dailyPrefix}>{price.dailyPrefix}</span>{" "}
          <span className={styles.dailyAmount}>
            <span className={styles.dailyNumber}>{price.dailyPrice}</span>
            <span className={styles.dailyPeriod}>/day</span>
          </span>
        </p>
        <p className={styles.billingNote}>{price.billingText}</p>
      </div>
    </div>
  );
}
