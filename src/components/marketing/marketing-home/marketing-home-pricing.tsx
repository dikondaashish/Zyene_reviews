"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { SIGNUP_URL } from "@/config/env";
import { MarketingHomePricingEnterprise } from "@/components/marketing/marketing-home/marketing-home-pricing-enterprise";

import type { MarketingHomeMotionProps } from "@/components/marketing/marketing-home/marketing-home-motion-props";

export function MarketingHomePricing({ fadeInUp, staggerContainer }: MarketingHomeMotionProps) {
    return (
        <>
      {/* 6. PRICING SECTION */}
      <section id="pricing" className="w-full py-24 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground font-light">
              Start with a 7-day free trial. Cancel before the trial ends and you won&apos;t be charged.
            </p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {/* Starter */}
            <motion.div variants={fadeInUp} className="bg-card border border-border rounded-lg p-8 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Starter</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Perfect for single-location businesses</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-lg line-through text-muted-foreground">$49.99</span>
                <span className="text-4xl font-bold text-foreground">$29.99</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <p className="text-sm text-primary font-medium mb-6">7-day free trial — cancel anytime, no charge</p>
              <ul className="space-y-3 text-sm text-muted-foreground flex-1 mb-8">
                {[
                  "1 business location",
                  "Google Business Profile, Facebook, and Yelp review sync",
                  "500 email review requests / month",
                  "500 SMS review requests / month",
                  "1,500 AI-generated review draft requests / month",
                  "1,500 AI reply suggestions / month + Auto commenter",
                  "Competitor tracking",
                  "Dashboard, analytics & team alerts",
                  "Zapier, API, and POS automation triggers",
                  "Developer API",
                  "Up to 5 team members",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={SIGNUP_URL}>
                <Button className="w-full rounded-md py-6 font-medium">
                  Start 7-day free trial
                </Button>
              </Link>
            </motion.div>

            {/* Professional */}
            <motion.div variants={fadeInUp} className="bg-[color:var(--marketing-footer-bg)] text-[color:var(--marketing-footer-fg)] border-2 border-primary rounded-lg p-8 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Professional</h3>
              </div>
              <p className="text-sm text-[color:var(--marketing-footer-muted)] mb-6">For growing multi-location businesses</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-lg line-through text-[color:var(--marketing-footer-muted)]">$89.99</span>
                <span className="text-4xl font-bold">$59.99</span>
                <span className="text-[color:var(--marketing-footer-muted)]">/mo</span>
              </div>
              <p className="text-sm text-primary font-medium mb-6">7-day free trial — cancel anytime, no charge</p>
              <ul className="space-y-3 text-sm text-[color:var(--marketing-footer-list)] flex-1 mb-8">
                {[
                  "Everything in Starter, plus:",
                  "Up to 3 business locations (limits scale per location)",
                  "700 email + 700 SMS review requests / month per location",
                  "2,000 AI reply suggestions / month per location",
                  "Priority customer support",
                  "Up to 15 team members",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={SIGNUP_URL}>
                <Button className="w-full rounded-md py-6 font-medium">
                  Start 7-day free trial
                </Button>
              </Link>
            </motion.div>
            <MarketingHomePricingEnterprise fadeInUp={fadeInUp} />
          </motion.div>
        </div>
      </section>
        </>
    );
}
