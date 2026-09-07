import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SIGNUP_URL } from "@/config/env";
import { PLAN_MAP } from "@/services/stripe/plan-catalog";
import { PricingPriceDisplay } from "@/components/marketing/pricing-price-display";

export function MarketingHomeNextSteps() {
  return (
    <section id="pricing" className="marketing-section">
      <div className="marketing-container grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="marketing-eyebrow">Room to grow. A price that makes sense.</p>
          <h2 className="mb-5 text-4xl lg:text-5xl">
            Big ambitions.
            <br />
            Local-business pricing.
          </h2>
          <p className="mb-6 max-w-lg text-lg text-muted-foreground">
            Start with one location or bring your whole team. Choose the plan that fits your business today.
          </p>
          <Link href="/compare" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary">
            Compare Zyene with other platforms <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="rounded-2xl bg-[var(--brand-wash)] p-7 sm:p-10">
          <p className="mb-3 text-sm font-semibold">Starter · One business location</p>
          <PricingPriceDisplay plan={PLAN_MAP.starter_monthly} />
          <div className="marketing-actions mb-8">
            <Link href={SIGNUP_URL} className="marketing-button">
              Start 7-day free trial <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/pricing" className="marketing-button marketing-button-secondary">
              Compare all plans
            </Link>
          </div>
          <ul className="space-y-3 border-t border-border pt-6 text-sm">
            {[
              "Review monitoring across Google, Facebook, and Yelp",
              "SMS and email review requests",
              "AI reply suggestions and competitor tracking",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
