import Link from "next/link";
import { ArrowRight, Mail, Search } from "lucide-react";
import type { Metadata } from "next";
import {
    HELP_BY_CATEGORY,
    HELP_CATEGORIES,
    helpArticleNestedPath,
    type HelpCategory,
} from "@/lib/phase4/help-data";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
    title: "Help Center — Zyene Reviews",
    description: "Find guides and answers to common questions about Zyene Reviews. Getting started, reviews, campaigns, analytics, billing, and integrations.",
    alternates: { canonical: "https://zyenereviews.com/help" },
    openGraph: {
        title: "Help Center — Zyene Reviews",
        description: "Guides and answers for Getting Started, Reviews, Campaigns, Analytics, Billing, and Integrations.",
        url: "https://zyenereviews.com/help",
    },
    twitter: {
        card: "summary_large_image",
        title: "Help Center — Zyene Reviews",
        description: "Guides and answers for Getting Started, Reviews, Campaigns, Analytics, Billing, and Integrations.",
    },
};

const CATEGORY_ORDER: HelpCategory[] = [
    "getting-started",
    "reviews",
    "campaigns",
    "analytics",
    "billing",
    "integrations",
];

export default function HelpCenterPage() {
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Help Center", url: "https://zyenereviews.com/help" },
                ]}
            />

            {/* ── Hero ── */}
            <section className="bg-muted border-b border-border py-20 px-4">
                <div className="container mx-auto max-w-5xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">How can we help you?</h1>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Browse guides by topic below, or email our support team — available Monday through Friday, 9am–6pm EST.
                    </p>
                    <a
                        href="mailto:support@zyenereviews.com"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground border border-primary px-6 py-3 rounded-md font-medium hover:brightness-95 transition"
                    >
                        <Mail className="w-4 h-4" />
                        Email support@zyenereviews.com
                    </a>
                </div>
            </section>

            {/* ── Article Listings by Category ── */}
            <section className="py-20 px-4 bg-background">
                <div className="container mx-auto max-w-5xl space-y-16">
                    {CATEGORY_ORDER.map((categoryKey) => {
                        const catInfo = HELP_CATEGORIES[categoryKey];
                        const articles = HELP_BY_CATEGORY[categoryKey] ?? [];
                        return (
                            <div key={categoryKey}>
                                {/* Category header */}
                                <Link
                                    href={`/help/${categoryKey}`}
                                    className="flex items-center gap-3 mb-6 group w-fit"
                                >
                                    <div className="p-2.5 bg-primary/10 text-primary rounded-lg border border-primary/20 text-xl leading-none">
                                        {catInfo.emoji}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                            {catInfo.label}
                                        </h2>
                                        <p className="text-sm text-muted-foreground">{catInfo.description}</p>
                                    </div>
                                </Link>

                                {/* Article list */}
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {articles.map((article) => (
                                        <Link
                                            key={article.slug}
                                            href={helpArticleNestedPath(article)}
                                            className="group flex items-start justify-between gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-1">
                                                    {article.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                                    {article.excerpt}
                                                </p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-0.5" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── Contact Support ── */}
            <section className="py-20 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-4xl text-center">
                    <div className="p-10 bg-card rounded-2xl border border-border">
                        <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
                        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                            Our support team is available Monday through Friday, 9am–6pm EST.
                            We typically respond within 24 hours.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <a
                                href="mailto:support@zyenereviews.com"
                                className="inline-flex items-center justify-center bg-primary text-primary-foreground border border-primary px-6 py-3 rounded-md font-medium hover:brightness-95 transition"
                            >
                                <Mail className="w-5 h-5 mr-2" />
                                Email Support
                            </a>
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center bg-background border border-border text-foreground px-6 py-3 rounded-md font-medium hover:bg-accent transition"
                            >
                                View all contact options
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
