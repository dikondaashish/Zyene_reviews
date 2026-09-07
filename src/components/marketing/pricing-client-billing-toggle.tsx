"use client";

import { Check } from "lucide-react";
import { YEARLY_SAVINGS_LABEL } from "@/lib/marketing/pricing-presentation";
import styles from "@/components/marketing/pricing.module.css";

export function BillingToggle({
  interval,
  onChange,
}: {
  interval: "month" | "year";
  onChange: (value: "month" | "year") => void;
}) {
  return (
    <fieldset className={styles.toggle}>
      <legend>Billing period</legend>
      <div className={styles.toggleOptions}>
        {(
          [
            { value: "month", label: "Monthly" },
            { value: "year", label: `Yearly · ${YEARLY_SAVINGS_LABEL}` },
          ] as const
        ).map(({ value, label }) => (
          <label key={value} className={styles.toggleOption}>
            <input
              type="radio"
              name="billing-period"
              value={value}
              checked={interval === value}
              onChange={() => onChange(value)}
              className={styles.toggleInput}
            />
            <span className={styles.toggleLabel}>
              <Check size={14} aria-hidden="true" />
              {label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
