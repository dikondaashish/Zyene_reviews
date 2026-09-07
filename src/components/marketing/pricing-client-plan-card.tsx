"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import type { Plan } from "@/services/stripe/plans";

export function PricingClientPlanCard({ plan, isPopular, signupUrl }: {
    plan: Plan;
    isPopular: boolean;
    signupUrl: string;
}) {
    const enterprise = plan.id === "enterprise";
    const monthlyPrice = plan.interval === "year" && plan.price ? plan.price / 12 : plan.price;
    const description = enterprise ? "For teams with custom needs" : isPopular ? "For growing businesses and teams" : "For your first business location";
    return (
        <article className={`relative flex flex-col rounded-2xl border p-6 lg:p-8 ${isPopular ? "border-primary bg-[var(--brand-wash)]" : "border-border bg-card"}`}>
            {isPopular && <p className="absolute -top-3 left-6 rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Room to grow</p>}
            <h2 className="mb-2 text-2xl font-semibold">{plan.name}</h2>
            <p className="mb-7 text-sm text-muted-foreground">{description}</p>
            <p className="mb-2 flex flex-wrap items-baseline gap-1.5"><span className="text-[42px] leading-tight font-semibold tracking-tight">{enterprise ? "Let’s talk" : `$${monthlyPrice?.toFixed(2)}`}</span>{!enterprise && <span className="text-sm text-muted-foreground">/month</span>}</p>
            <p className="mb-6 min-h-6 text-sm text-muted-foreground">{enterprise ? "A plan built around your business" : plan.interval === "year" ? `$${plan.price?.toFixed(2)} billed yearly` : "Billed monthly. Cancel anytime."}</p>
            <Link href={enterprise ? "/demo" : signupUrl} className={`marketing-button mb-7 w-full ${isPopular ? "" : "marketing-button-secondary"}`}>{enterprise ? "Talk to sales" : "Start 7-day free trial"}<ArrowRight className="size-4" aria-hidden="true" /></Link>
            <ul className="space-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
                {plan.features.map(feature => <li key={feature} className="flex items-start gap-2.5"><Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /><span>{feature.replace(" (public review link flow, step 3)", "")}</span></li>)}
            </ul>
        </article>
    );
}
