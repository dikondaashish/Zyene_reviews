

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AGENCY_PRICING_TIERS } from "@/lib/enterprise/agency-pricing-data";
import { PARTNER_CONTACT_EMAIL } from "@/lib/campaign-content/partnerships-data";

export function AgenciesSection3Section() {
    return (
        <section className="py-20 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold mb-8">Agency pricing tiers</h2>
                    <p className="text-muted-foreground mb-10 max-w-2xl">
                        Choose pricing that grows with your client roster. Configure automatic Google replies for each eligible client business with its own tone and star threshold. Our partnerships team can help scope your rollout.
                    </p>
                    <Link href="/features/ai-replies" className="mb-6 inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4">See automatic Google replies →</Link>
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
                                <Button variant="outline" className="w-full" asChild>
                                    <a
                                    href={`mailto:${PARTNER_CONTACT_EMAIL}?subject=${encodeURIComponent(tier.cta)}`}
                                >
                                        {tier.cta}
                                    </a>
                                </Button>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
    );
}
