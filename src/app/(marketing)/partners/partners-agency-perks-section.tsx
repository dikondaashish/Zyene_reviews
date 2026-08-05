import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AGENCY_PARTNER_PERKS, PARTNER_CONTACT_EMAIL } from "@/lib/campaign-content/partnerships-data";

export function PartnersAgencyPerksSection() {
    return (
        <section className="py-20 px-4 bg-muted border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-foreground mb-3">Agency &amp; reseller program</h2>
                    <p className="text-muted-foreground mb-8 max-w-2xl">
                        Manage client reputations under your brand. White-label widgets and referral commissions available today.
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-4 mb-10">
                        {AGENCY_PARTNER_PERKS.map((perk) => (
                            <li
                                key={perk}
                                className="bg-card border border-border rounded-xl p-4 text-sm text-foreground"
                            >
                                {perk}
                            </li>
                        ))}
                    </ul>
                    <a href={`mailto:${PARTNER_CONTACT_EMAIL}?subject=Agency%20partner%20application`}>
                        <Button variant="outline" className="gap-2">
                            Apply as agency partner <ArrowRight className="size-4" />
                        </Button>
                    </a>
                </div>
            </section>
    );
}
