"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
import * as PricingCard from "@/components/ui/pricing-card";

/** Owners compare the first few lines; the rest stay one click away instead of making the page endless. */
const SHOWN = 6;

export function Step4PlanFeatureList({ features }: { features: readonly string[] }) {
    const [open, setOpen] = useState(false);
    const shown = open ? features : features.slice(0, SHOWN);
    const hidden = features.length - SHOWN;

    return (
        <div className="space-y-2">
            <PricingCard.List className="space-y-2">
                {shown.map((feature) => (
                    <PricingCard.ListItem key={feature} className="gap-2 text-xs">
                        <span className="mt-0.5 shrink-0">
                            <CheckCircle2 className="size-3.5 text-success" aria-hidden />
                        </span>
                        <span>{feature}</span>
                    </PricingCard.ListItem>
                ))}
            </PricingCard.List>
            {hidden > 0 && (
                <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    {open ? "Show fewer" : `See all ${features.length} features`}
                    <ChevronDown className={open ? "size-3.5 rotate-180" : "size-3.5"} aria-hidden />
                </button>
            )}
        </div>
    );
}
