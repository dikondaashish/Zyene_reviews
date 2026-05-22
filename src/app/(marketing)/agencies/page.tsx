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
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { AgencyWaitlistForm } from "@/components/marketing/agency-waitlist-form";
import {
    AGENCY_DASHBOARD_ROADMAP,
    AGENCY_PRICING_TIERS,
    WHITE_LABEL_FEATURES,
} from "@/lib/phase8/agency-pricing-data";
import { PARTNER_CONTACT_EMAIL } from "@/lib/phase6/partnerships-data";

export const metadata: Metadata = {
    title: "Agencies — White-Label Review Management | Zyene Reviews",
    description:
        "Manage client reputations under your brand. Agency pricing tiers, white-label widgets, referral commissions, and multi-client dashboard roadmap.",
    alternates: { canonical: "https://zyenereviews.com/agencies" },
    openGraph: {
        title: "Agencies — Zyene Reviews",
        description: "White-label review management for marketing and web agencies.",
        url: "https://zyenereviews.com/agencies",
    },
    twitter: {
        card: "summary_large_image",
        title: "Agencies — Zyene Reviews",
        description: "White-label review management for marketing and web agencies.",
    },
};

export default function AgenciesPage() {
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Agencies", url: "https://zyenereviews.com/agencies" },
                ]}
            />

            <section className="pt-24 pb-16 px-4 border-b border-border bg-background">
                <div className="container mx-auto max-w-5xl">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-4">
                        <Handshake className="h-3 w-3" /> Agencies
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Manage client reputations under your brand
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
                        Zyene Reviews gives agencies a affordable alternative to Birdeye — with white-label widgets,
                        bulk pricing, and referral revenue on every client you bring.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a href={`mailto:${PARTNER_CONTACT_EMAIL}?subject=Agency%20partner%20application`}>
                            <Button size="lg" className="rounded-xl px-8">
                                Apply as agency partner <Mail className="ml-2 h-4 w-4" />
                            </Button>
                        </a>
                        <Link href="/partners">
                            <Button size="lg" variant="outline" className="rounded-xl px-8">
                                All partnerships <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 bg-muted border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex items-center gap-3 mb-8">
                        <Palette className="h-8 w-8 text-primary" />
                        <h2 className="text-3xl font-bold">White-label branding</h2>
                    </div>
                    <p className="text-muted-foreground mb-8 max-w-2xl">
                        We already support <strong>hide_branding</strong> on review collection flows — market it to
                        clients as your proprietary reputation stack. Enterprise client accounts unlock full white-label
                        widgets without the “Powered by Zyene” footer.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {WHITE_LABEL_FEATURES.map((f) => (
                            <article key={f.title} className="bg-card border border-border rounded-xl p-6">
                                <h3 className="font-semibold mb-2">{f.title}</h3>
                                <p className="text-sm text-muted-foreground">{f.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold mb-8">Agency pricing tiers</h2>
                    <p className="text-muted-foreground mb-10 max-w-2xl">
                        Custom per-client pricing and bulk discounts — contact partnerships to activate. Stripe plan IDs
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
                                            <Check className="h-4 w-4 text-primary shrink-0" />
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

            <section className="py-20 px-4 bg-muted border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex items-center gap-3 mb-4">
                        <LayoutDashboard className="h-8 w-8 text-primary" />
                        <h2 className="text-3xl font-bold">{AGENCY_DASHBOARD_ROADMAP.title}</h2>
                        <span className="text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {AGENCY_DASHBOARD_ROADMAP.status}
                        </span>
                    </div>
                    <p className="text-muted-foreground max-w-2xl mb-8">{AGENCY_DASHBOARD_ROADMAP.description}</p>
                    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                        <p className="text-sm font-medium mb-4">Join the beta waitlist</p>
                        <AgencyWaitlistForm />
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 bg-background">
                <div className="container mx-auto max-w-3xl text-center">
                    <p className="text-muted-foreground mb-6">
                        Also exploring POS, Zapier, and association partnerships? See the full{" "}
                        <Link href="/partners" className="text-primary underline">partners page</Link>.
                    </p>
                    <Link href="/enterprise">
                        <Button variant="outline">Enterprise for 16+ locations</Button>
                    </Link>
                </div>
            </section>
        </>
    );
}
