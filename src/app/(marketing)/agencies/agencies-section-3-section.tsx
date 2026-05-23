import type { Metadata } from "next";
import Link from "next/link";
import {
    ArrowRight,
    Handshake,
    Palette,
    LayoutDashboard,
    Check,
    Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AGENCY_DASHBOARD_ROADMAP,
    AGENCY_PRICING_TIERS,
    WHITE_LABEL_FEATURES,
} from "@/lib/phase8/agency-pricing-data";
import { PARTNER_CONTACT_EMAIL } from "@/lib/phase6/partnerships-data";

export function AgenciesSection3Section() {
    return (
        <section className="py-20 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold mb-8">Agency pricing tiers</h2>
                    <p className="text-muted-foreground mb-10 max-w-2xl">
                        Custom per-client pricing and bulk discounts—contact partnerships to activate. Stripe plan IDs
                        for agency_* tiers are assigned after onboarding.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {AGENCY_PRICING_TIERS.map((tier) => (
                            <article
                                key={tier.id}
                                className="bg-card border border-border rounded-2xl p-6 flex flex-col"
                            >
                                <h3 className="text-xl font-bold">{tier.name}</h3>
                                <p className="text-sm text-primary font-medium mt-1">{tier.clientRange}</p>
                                <p className="text-sm text-muted-foreground mt-3 mb-4">{tier.priceLabel}</p>
                                <ul className="space-y-2 flex-1 mb-6">
                                    {tier.highlights.map((h) => (
                                        <li key={h} className="flex gap-2 text-sm text-muted-foreground">
                                            <Check className="text-primary shrink-0 size-4" />
                                            {h}
                                        </li>
                                    ))}
                                </ul>
                                <a
                                    href={`mailto:${PARTNER_CONTACT_EMAIL}?subject=${encodeURIComponent(tier.cta)}`}
                                >
                                    <Button variant="outline" className="w-full">
                                        {tier.cta}
                                    </Button>
                                </a>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
    );
}
