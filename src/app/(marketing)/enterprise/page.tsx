import type { Metadata } from "next";
import Link from "next/link";
import {
    ArrowRight,
    Building2,
    Check,
    Shield,
    Users,
    Sparkles,
    FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import {
    ENTERPRISE_COMPARISON_ROWS,
    ENTERPRISE_SLA_BULLETS,
    ENTERPRISE_VALUE_PROPS,
    ENTERPRISE_SALES_EMAIL,
} from "@/lib/phase8/enterprise-data";
import { enterpriseSalesGmailComposeUrl } from "@/lib/enterprise-sales-contact";
import { getEnterprisePlan } from "@/services/stripe/plans";
import { DEFAULT_CAL_COM_BOOKING_URL } from "@/lib/phase8/cal-com-embed";

export const metadata: Metadata = {
    title: "Enterprise — Custom Pricing, SLA, SSO & White-Label | Zyene Reviews",
    description:
        "Enterprise review management for multi-location brands: unlimited locations, dedicated account manager, SSO, uptime SLA, white-label widgets, and custom integrations.",
    alternates: { canonical: "https://zyenereviews.com/enterprise" },
    openGraph: {
        title: "Zyene Reviews Enterprise",
        description: "Scale review operations across unlimited locations with SLA, SSO, and white-label.",
        url: "https://zyenereviews.com/enterprise",
    },
};

export default function EnterprisePage() {
    const enterprisePlan = getEnterprisePlan();

    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Enterprise", url: "https://zyenereviews.com/enterprise" },
                ]}
            />

            <section className="pt-24 pb-16 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-4">
                        <Building2 className="h-3 w-3" /> Enterprise
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Review operations at enterprise scale
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
                        Custom pricing for franchises, multi-location brands, and high-volume operators — without
                        Birdeye-style contracts or per-location surprise fees.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/demo">
                            <Button size="lg" className="rounded-xl px-8">
                                Book a demo <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <a href={DEFAULT_CAL_COM_BOOKING_URL} target="_blank" rel="noopener noreferrer">
                            <Button size="lg" variant="outline" className="rounded-xl px-8">
                                Cal.com — 30 min
                            </Button>
                        </a>
                        <a href={enterpriseSalesGmailComposeUrl()} target="_blank" rel="noopener noreferrer">
                            <Button size="lg" variant="outline" className="rounded-xl px-8">
                                Contact sales
                            </Button>
                        </a>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                        Inbound leads: <a href={`mailto:${ENTERPRISE_SALES_EMAIL}`} className="text-primary hover:underline">{ENTERPRISE_SALES_EMAIL}</a>
                    </p>
                </div>
            </section>

            <section className="py-20 px-4 bg-muted border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold mb-10">Built for scale</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ENTERPRISE_VALUE_PROPS.map((item) => (
                            <article key={item.title} className="bg-card border border-border rounded-xl p-6">
                                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="h-8 w-8 text-primary" />
                        <h2 className="text-3xl font-bold">SLA &amp; support</h2>
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-3">
                        {ENTERPRISE_SLA_BULLETS.map((b) => (
                            <li key={b} className="flex gap-2 text-sm text-muted-foreground">
                                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                {b}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="py-20 px-4 bg-muted border-b border-border">
                <div className="container mx-auto max-w-5xl overflow-x-auto">
                    <h2 className="text-3xl font-bold mb-8">Plan comparison</h2>
                    <table className="w-full text-sm border border-border rounded-xl overflow-hidden bg-card">
                        <thead>
                            <tr className="bg-muted/80 border-b border-border">
                                <th className="text-left p-4 font-semibold">Feature</th>
                                <th className="p-4 font-semibold">Starter</th>
                                <th className="p-4 font-semibold">Professional</th>
                                <th className="p-4 font-semibold text-primary">Enterprise</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ENTERPRISE_COMPARISON_ROWS.map((row) => (
                                <tr key={row.feature} className="border-b border-border last:border-0">
                                    <td className="p-4 font-medium">{row.feature}</td>
                                    <td className="p-4 text-muted-foreground">{row.starter}</td>
                                    <td className="p-4 text-muted-foreground">{row.professional}</td>
                                    <td className="p-4 text-foreground font-medium">{row.enterprise}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="py-20 px-4 bg-background">
                <div className="container mx-auto max-w-5xl grid lg:grid-cols-2 gap-10 items-start">
                    <div>
                        <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                            <Users className="h-8 w-8 text-primary" />
                            What&apos;s included
                        </h2>
                        <ul className="space-y-3">
                            {enterprisePlan.features.map((f) => (
                                <li key={f} className="flex gap-2 text-sm">
                                    <Check className="h-4 w-4 text-primary shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-8">
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Sales deck
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Product overview, case studies, pricing framework, and security summary for your
                            procurement team — maintained in{" "}
                            <code className="text-xs bg-muted px-1 rounded">docs/ENTERPRISE_SALES_DECK.md</code>.
                        </p>
                        <p className="text-sm text-muted-foreground mb-6">
                            Request the latest PDF/Notion export from sales when you book a demo.
                        </p>
                        <Link href="/demo">
                            <Button className="w-full gap-2">
                                <Sparkles className="h-4 w-4" /> Request demo + sales deck
                            </Button>
                        </Link>
                        <Link href="/security" className="block mt-4 text-sm text-primary hover:underline text-center">
                            Security &amp; trust center →
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 bg-primary/5 border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-2xl font-bold mb-4">Ready to talk?</h2>
                    <p className="text-muted-foreground mb-6">
                        Our sales team handles inbound from this page, <Link href="/demo" className="text-primary underline">/demo</Link>, and{" "}
                        {ENTERPRISE_SALES_EMAIL}.
                    </p>
                    <Link href="/demo">
                        <Button size="lg">Schedule a demo</Button>
                    </Link>
                </div>
            </section>
        </>
    );
}
