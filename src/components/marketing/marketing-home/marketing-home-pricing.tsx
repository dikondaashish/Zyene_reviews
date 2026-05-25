"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { SIGNUP_URL } from "@/config/env";

import type { MarketingHomeMotionProps } from "@/components/marketing/marketing-home/marketing-home-motion-props";

const PLANS = [
    {
        name: "Starter",
        description: "Perfect for single-location businesses",
        price: "$29.99",
        originalPrice: "$49.99",
        recommended: false,
        features: [
            "1 business location",
            "Google, Facebook, and Yelp sync",
            "500 email + 500 SMS requests/mo",
            "1,500 AI reply suggestions/mo",
            "Competitor tracking",
            "Dashboard and analytics",
            "Developer API",
            "Up to 5 team members",
        ],
        cta: "Start 7-day free trial",
        href: SIGNUP_URL,
    },
    {
        name: "Professional",
        description: "For growing multi-location businesses",
        price: "$59.99",
        originalPrice: "$89.99",
        recommended: true,
        features: [
            "Everything in Starter, plus:",
            "Up to 3 business locations",
            "700 email + 700 SMS requests/mo per location",
            "2,000 AI replies/mo per location",
            "Priority customer support",
            "Up to 15 team members",
        ],
        cta: "Start 7-day free trial",
        href: SIGNUP_URL,
    },
    {
        name: "Enterprise",
        description: "For large organizations with custom needs",
        price: "Custom",
        originalPrice: null,
        recommended: false,
        features: [
            "Everything in Professional, plus:",
            "Unlimited locations",
            "Unlimited requests and AI replies",
            "White-label review widgets",
            "Dedicated account manager",
            "Custom integrations and SSO",
            "Uptime SLA",
        ],
        cta: "Contact Sales",
        href: "mailto:sales@zyenereviews.com?subject=Enterprise%20Inquiry",
    },
];

export function MarketingHomePricing({ fadeInUp, staggerContainer }: MarketingHomeMotionProps) {
    return (
        <section id="pricing" className="w-full py-24 md:py-32 px-4">
            <div className="mx-auto max-w-[1200px]">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4">
                        Simple, transparent pricing
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Start with a 7-day free trial. Cancel anytime.
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
                >
                    {PLANS.map((plan) => (
                        <motion.div
                            key={plan.name}
                            variants={fadeInUp}
                            className={`relative flex flex-col rounded-xl border p-8 ${
                                plan.recommended
                                    ? "ring-2 ring-primary border-primary"
                                    : "border-border"
                            }`}
                        >
                            {plan.recommended && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                                    Recommended
                                </span>
                            )}
                            <h3 className="text-lg font-semibold text-foreground mb-1">{plan.name}</h3>
                            <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                            <div className="flex items-baseline gap-2 mb-1">
                                {plan.originalPrice && (
                                    <span className="text-base line-through text-muted-foreground">{plan.originalPrice}</span>
                                )}
                                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                                {plan.price !== "Custom" && (
                                    <span className="text-lg text-muted-foreground">/mo</span>
                                )}
                            </div>
                            {plan.price !== "Custom" && (
                                <p className="text-xs text-primary font-medium mb-6">7-day free trial, cancel anytime</p>
                            )}
                            {plan.price === "Custom" && <div className="mb-6" />}
                            <ul className="space-y-3 text-sm text-muted-foreground flex-1 mb-8">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2">
                                        <Check className="size-4 text-primary shrink-0 mt-0.5" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            {plan.href.startsWith("mailto:") ? (
                                <a href={plan.href} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" className="w-full rounded-md py-5 font-medium">
                                        {plan.cta}
                                    </Button>
                                </a>
                            ) : (
                                <Link href={plan.href}>
                                    <Button
                                        className="w-full rounded-md py-5 font-medium"
                                        variant={plan.recommended ? "default" : "outline"}
                                    >
                                        {plan.cta}
                                    </Button>
                                </Link>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
