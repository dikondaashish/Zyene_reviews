import Link from "next/link";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";

/** Plain billing and security facts in place of example testimonials. Server-renderable. */
export function PricingClientTrustRow() {
  return (
    <section aria-label="Billing and security" className="marketing-container">
      <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-y border-border py-6 text-sm text-muted-foreground">
        <li className="inline-flex items-center gap-2">
          <CreditCard className="size-4" aria-hidden="true" />
          Cancel anytime in Billing
        </li>
        <li className="inline-flex items-center gap-2">
          <Lock className="size-4" aria-hidden="true" />
          Secure checkout by Stripe
        </li>
        <li>
          <Link href="/security" className="inline-flex items-center gap-2 font-medium text-foreground underline underline-offset-4">
            <ShieldCheck className="size-4" aria-hidden="true" />
            How we protect your data
          </Link>
        </li>
      </ul>
    </section>
  );
}
