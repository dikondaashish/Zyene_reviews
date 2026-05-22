import type { Metadata } from "next";
import Link from "next/link";
import {
    Shield,
    Lock,
    Database,
    Globe,
    KeyRound,
    FileCheck,
    Mail,
    ArrowRight,
    ShieldCheck,
    Server,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
    title: "Security & Trust — Zyene Reviews",
    description:
        "How Zyene Reviews protects your data: Row Level Security multi-tenant isolation, 256-bit encryption, GDPR compliance, no review gating, Google OAuth Limited Use, and transparent data retention.",
    alternates: { canonical: "https://zyenereviews.com/security" },
    openGraph: {
        title: "Security & Trust — Zyene Reviews",
        description:
            "Multi-tenant RLS, encryption in transit and at rest, GDPR compliance, ethical review collection, and secure Google OAuth.",
        url: "https://zyenereviews.com/security",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Security & Trust — Zyene Reviews",
        description: "Enterprise-grade security practices built for local business data — RLS, encryption, GDPR, no review gating.",
    },
};

const SECURITY_SECTIONS = [
    {
        icon: Database,
        title: "Row Level Security (RLS)",
        body: "Every table in our PostgreSQL database uses Supabase Row Level Security. Queries are scoped to your organization via get_user_org_ids() — one tenant cannot read, update, or delete another tenant's reviews, customers, or settings. This is enforced at the database layer, not only in application code.",
    },
    {
        icon: Lock,
        title: "256-bit encryption",
        body: "All traffic between your browser and Zyene uses TLS 1.2+ (HTTPS). Data at rest in our database and object storage is encrypted using industry-standard AES-256. API keys and OAuth tokens are stored encrypted and never exposed in client-side code or logs.",
    },
    {
        icon: Globe,
        title: "GDPR & privacy compliance",
        body: "We process personal data under lawful bases documented in our Privacy Policy. You can export or delete customer data from your dashboard. We honor data subject requests and maintain a Data Processing Agreement for enterprise customers upon request.",
    },
    {
        icon: ShieldCheck,
        title: "No review gating policy",
        body: "Zyene does not filter which customers may leave a public review based on star rating. Our Negative Feedback Shield routes low ratings to private resolution first — but we never block legitimate public reviews. This aligns with Google and FTC guidance on deceptive review practices.",
    },
    {
        icon: KeyRound,
        title: "Secure Google OAuth (Limited Use)",
        body: "Google Business Profile access uses official OAuth 2.0 with the minimum scopes required. We comply with Google's API Services User Data Policy and Limited Use requirements — your Google data is used only to sync and reply to reviews you authorize, never for advertising or unrelated purposes.",
    },
    {
        icon: FileCheck,
        title: "SOC 2 readiness",
        body: "We follow security controls aligned with SOC 2 Type II expectations: access logging, least-privilege admin access, dependency scanning, and incident response procedures. Formal SOC 2 certification will be pursued as we scale enterprise contracts.",
    },
    {
        icon: Server,
        title: "Infrastructure & availability",
        body: "Production runs on Vercel and Supabase with geographically distributed infrastructure. Status and uptime are published at status.zyenereviews.com. We monitor sync pipelines and alert on integration failures affecting review delivery.",
    },
    {
        icon: Eye,
        title: "Responsible disclosure",
        body: "If you discover a security vulnerability, report it responsibly to security@zyenereviews.com. We acknowledge valid reports within 5 business days and work with researchers under coordinated disclosure. We do not pursue legal action against good-faith security research.",
    },
];

export default function SecurityPage() {
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Security", url: "https://zyenereviews.com/security" },
                ]}
            />

            <section className="pt-24 pb-16 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-4xl text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-6">
                        <Shield className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                        Security &amp; trust
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Your reputation data deserves the same protection as your finances. Here is how Zyene Reviews
                        secures multi-tenant data, integrations, and customer information.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                        <Link href="/data-retention">
                            <Button variant="outline" className="gap-2">
                                Data retention policy <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/privacy">
                            <Button variant="ghost" className="gap-2 text-muted-foreground">
                                Privacy policy <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-20 px-4 bg-background">
                <div className="container mx-auto max-w-4xl space-y-10">
                    {SECURITY_SECTIONS.map((section) => {
                        const Icon = section.icon;
                        return (
                            <div
                                key={section.title}
                                className="flex flex-col sm:flex-row gap-6 p-8 rounded-2xl border border-border bg-card hover:border-primary/20 transition-colors"
                            >
                                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground mb-2">{section.title}</h2>
                                    <p className="text-muted-foreground leading-relaxed">{section.body}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="py-16 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-3">Questions about security?</h2>
                    <p className="text-muted-foreground mb-6">
                        Enterprise customers can request our security overview, DPA, and subprocessors list.
                    </p>
                    <a
                        href="mailto:security@zyenereviews.com?subject=Security%20inquiry"
                        className="inline-flex items-center gap-2 text-primary font-semibold hover:brightness-90"
                    >
                        <Mail className="h-4 w-4" />
                        security@zyenereviews.com
                    </a>
                </div>
            </section>
        </>
    );
}
