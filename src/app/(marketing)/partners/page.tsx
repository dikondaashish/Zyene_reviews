import type { Metadata } from "next";
import Link from "next/link";
import {
    ArrowRight,
    Handshake,
    Store,
    Users,
    Zap,
    Globe,
    Mail,
    BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    PARTNERSHIP_CHANNELS,
    AGENCY_PARTNER_PERKS,
    PARTNER_CONTACT_EMAIL,
} from "@/lib/phase6/partnerships-data";
import { GOOGLE_ADS_CAMPAIGNS } from "@/lib/phase6/google-ads-data";
import { META_ADS_CAMPAIGNS } from "@/lib/phase6/meta-ads-data";
import { NEWSLETTER_DESCRIPTION } from "@/lib/phase6/email-sequences-data";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { NewsletterSignup } from "@/components/marketing/newsletter-signup";

export const metadata: Metadata = {
    title: "Partners — Agencies, POS, Zapier & More | Zyene Reviews",
    description:
        "Partner with Zyene Reviews: agency referral program, POS marketplace integrations, Zapier automation, and local business association co-marketing.",
    alternates: { canonical: "https://zyenereviews.com/partners" },
    openGraph: {
        title: "Partners — Zyene Reviews",
        description: "Agency partners, POS integrations, Zapier, and growth partnerships for local business software.",
        url: "https://zyenereviews.com/partners",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Partners — Zyene Reviews",
        description: "Agency referral program, POS integrations, and strategic partnerships.",
    },
};

const CHANNEL_ICONS = {
    pos: Store,
    association: Users,
    agency: Handshake,
    zapier: Zap,
    google: Globe,
} as const;

export default function PartnersPage() {
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Partners", url: "https://zyenereviews.com/partners" },
                ]}
            />

            <section className="pt-24 pb-16 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-4">
                        <Handshake className="h-3 w-3" /> Partners
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                        Grow with Zyene Reviews
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Agencies, POS providers, associations, and automation platforms — partner with us to bring
                        affordable review management to local businesses.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <a href={`mailto:${PARTNER_CONTACT_EMAIL}?subject=Partnership%20inquiry`}>
                            <Button size="lg" className="rounded-xl px-8">
                                Contact partnerships <Mail className="ml-2 h-4 w-4" />
                            </Button>
                        </a>
                        <Link href="/agencies">
                            <Button size="lg" variant="outline" className="rounded-xl px-8">
                                Agency program <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/integrations">
                            <Button size="lg" variant="outline" className="rounded-xl px-8">
                                Integrations
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Agency program */}
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
                            Apply as agency partner <ArrowRight className="h-4 w-4" />
                        </Button>
                    </a>
                </div>
            </section>

            {/* Partnership channels */}
            <section className="py-20 px-4 bg-background">
                <div className="container mx-auto max-w-5xl space-y-8">
                    <h2 className="text-3xl font-bold text-foreground">Partnership channels</h2>
                    {PARTNERSHIP_CHANNELS.map((channel) => {
                        const Icon = CHANNEL_ICONS[channel.icon];
                        return (
                            <article
                                key={channel.id}
                                className="bg-card border border-border rounded-2xl p-8 hover:border-primary/20 transition-colors"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">{channel.title}</h3>
                                            <p className="text-sm text-muted-foreground">{channel.partnerType}</p>
                                        </div>
                                    </div>
                                    <span
                                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                                            channel.status === "live"
                                                ? "bg-primary/10 text-primary border-primary/20"
                                                : channel.status === "in_progress"
                                                  ? "bg-muted text-muted-foreground border-border"
                                                  : "bg-muted text-muted-foreground border-border"
                                        }`}
                                    >
                                        {channel.status === "live"
                                            ? "Live"
                                            : channel.status === "in_progress"
                                              ? "In progress"
                                              : "Planned"}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    <strong className="text-foreground">Value exchange:</strong> {channel.valueExchange}
                                </p>
                                <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground mb-6">
                                    {channel.actions.map((action) => (
                                        <li key={action}>{action}</li>
                                    ))}
                                </ul>
                                {channel.ctaHref && channel.ctaLabel && (
                                    <Link
                                        href={channel.ctaHref}
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:brightness-90"
                                    >
                                        {channel.ctaLabel} <ArrowRight className="h-4 w-4" />
                                    </Link>
                                )}
                            </article>
                        );
                    })}
                </div>
            </section>

            {/* Paid acquisition playbook (internal reference, public for transparency) */}
            <section className="py-20 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <h2 className="text-2xl font-bold text-foreground">Paid acquisition playbook</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-10">
                        Campaign structure for Google Ads and Meta — use UTM parameters for attribution (
                        <code className="text-xs bg-background px-1 py-0.5 rounded">utm_source</code>,{" "}
                        <code className="text-xs bg-background px-1 py-0.5 rounded">utm_campaign</code>).
                    </p>

                    <h3 className="text-lg font-semibold text-foreground mb-4">Google Ads</h3>
                    <div className="overflow-x-auto rounded-xl border border-border bg-card mb-12">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 font-semibold">Type</th>
                                    <th className="px-4 py-3 font-semibold">Priority</th>
                                    <th className="px-4 py-3 font-semibold">Landing</th>
                                    <th className="px-4 py-3 font-semibold">UTM campaign</th>
                                </tr>
                            </thead>
                            <tbody>
                                {GOOGLE_ADS_CAMPAIGNS.map((c) => (
                                    <tr key={c.utmCampaign} className="border-b border-border last:border-0">
                                        <td className="px-4 py-3 text-foreground">{c.name}</td>
                                        <td className="px-4 py-3 capitalize">{c.budgetPriority}</td>
                                        <td className="px-4 py-3">
                                            <Link href={c.landingPath} className="text-primary hover:underline">
                                                {c.landingPath}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                            {c.utmCampaign}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-4">Meta (Facebook / Instagram)</h3>
                    <div className="overflow-x-auto rounded-xl border border-border bg-card">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-4 py-3 font-semibold">Audience</th>
                                    <th className="px-4 py-3 font-semibold">Creative</th>
                                    <th className="px-4 py-3 font-semibold">Landing</th>
                                    <th className="px-4 py-3 font-semibold">UTM campaign</th>
                                </tr>
                            </thead>
                            <tbody>
                                {META_ADS_CAMPAIGNS.map((c) => (
                                    <tr key={c.utmCampaign} className="border-b border-border last:border-0">
                                        <td className="px-4 py-3 text-foreground">{c.audienceLabel}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{c.creativeHook}</td>
                                        <td className="px-4 py-3">
                                            <Link href={c.landingPath} className="text-primary hover:underline">
                                                {c.landingPath}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                            {c.utmCampaign}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-20 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-2">{NEWSLETTER_DESCRIPTION.title}</h2>
                    <p className="text-muted-foreground mb-2">{NEWSLETTER_DESCRIPTION.frequency}</p>
                    <p className="text-sm text-muted-foreground mb-8">
                        {NEWSLETTER_DESCRIPTION.topics.join(" · ")}
                    </p>
                    <NewsletterSignup source="partners_page" />
                </div>
            </section>
        </>
    );
}
