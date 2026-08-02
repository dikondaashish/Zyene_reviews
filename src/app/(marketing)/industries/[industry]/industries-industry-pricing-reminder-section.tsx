import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SIGNUP_URL } from "@/config/env";
import type { IndustryData } from "@/lib/phase3/industry-data";

const ENTERPRISE_SALES_HREF =
    "mailto:sales@zyenereviews.com?subject=Enterprise%20Plan%20Inquiry";

const PLANS = [
    {
        name: "Starter",
        price: "$29.99",
        period: "/mo",
        locations: "1 location",
        features: [
            "AI reply suggestions",
            "Negative Feedback Shield",
            "Review monitoring",
            "SMS & email campaigns",
        ],
        highlighted: false,
    },
    {
        name: "Professional",
        price: "$59.99",
        period: "/mo",
        locations: "Up to 3 locations",
        features: [
            "Everything in Starter",
            "Competitor tracking",
            "Multi-location dashboard",
            "Priority support",
        ],
        highlighted: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "",
        locations: "Unlimited locations",
        features: [
            "Everything in Professional",
            "Dedicated account manager",
            "Custom integrations",
            "Volume discounts",
        ],
        highlighted: false,
    },
];

export function IndustriesIndustryPricingReminderSection({ data }: { data: IndustryData }) {
    return (
        <section className="py-20 px-4 bg-background border-t border-border">
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-foreground mb-3">
                        Pricing built for {data.name.toLowerCase()}
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        No per-location surcharges. No annual contracts. Cancel anytime.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative bg-card border rounded-2xl p-8 flex flex-col ${
                                plan.highlighted
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-border"
                            }`}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-foreground mb-1">
                                    {plan.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {plan.locations}
                                </p>
                            </div>

                            <div className="mb-6">
                                <span className="text-4xl font-bold text-foreground">
                                    {plan.price}
                                </span>
                                {plan.period && (
                                    <span className="text-muted-foreground text-sm">
                                        {plan.period}
                                    </span>
                                )}
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-start gap-2.5 text-sm text-muted-foreground"
                                    >
                                        <Check className="text-primary shrink-0 mt-0.5 size-4" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {plan.name === "Enterprise" ? (
                                <a href={ENTERPRISE_SALES_HREF}>
                                    <Button className="w-full gap-2" variant="outline">
                                        Contact Sales
                                        <ArrowRight className="size-4" />
                                    </Button>
                                </a>
                            ) : (
                                <Link href={plan.highlighted ? SIGNUP_URL : "/pricing"}>
                                    <Button
                                        className="w-full gap-2"
                                        variant={plan.highlighted ? "default" : "outline"}
                                    >
                                        Start Free Trial
                                        <ArrowRight className="size-4" />
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    7-day free trial on all plans. No credit card lock-in.
                </p>
            </div>
        </section>
    );
}
