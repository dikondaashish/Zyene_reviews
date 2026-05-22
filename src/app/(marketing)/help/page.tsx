import Link from "next/link";
import { ArrowRight, Mail, FileText, BarChart3, Megaphone, CreditCard, BookOpen, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Help Center — Zyene Reviews",
    description: "Find guides, tutorials, and answers to common questions about Zyene Reviews. Get started quickly or troubleshoot any issue.",
    alternates: { canonical: "https://zyenereviews.com/help" },
    openGraph: {
        title: "Help Center — Zyene Reviews",
        description: "Guides, tutorials, and answers for Getting Started, Analytics, Campaigns, Billing, Integrations, and Plugins.",
        url: "https://zyenereviews.com/help",
    },
    twitter: {
        card: "summary_large_image",
        title: "Help Center — Zyene Reviews",
        description: "Guides, tutorials, and answers for Getting Started, Analytics, Campaigns, Billing, and Integrations.",
    },
};

const categories = [
    {
        title: "Getting Started",
        description: "Connect your Google Business Profile, send your first review request, and set up your dashboard.",
        icon: BookOpen,
        href: "/docs",
        badge: "Start here",
    },
    {
        title: "Dashboard & Analytics",
        description: "Understand your review metrics, track competitor performance, and read the engagement funnel.",
        icon: BarChart3,
        href: "/docs/how-it-works",
        badge: null,
    },
    {
        title: "Automated Campaigns",
        description: "Set up SMS and email campaigns to automatically request reviews from your customers.",
        icon: Megaphone,
        href: "/docs",
        badge: null,
    },
    {
        title: "Integrations & API",
        description: "Connect Zapier, use the REST API, embed review widgets, and set up POS triggers.",
        icon: Zap,
        href: "/docs/api",
        badge: null,
    },
    {
        title: "Account & Billing",
        description: "Manage your subscription, upgrade your plan, invite team members, and set notifications.",
        icon: CreditCard,
        href: "/contact",
        badge: null,
    },
    {
        title: "Plugins & Embeds",
        description: "Add a review carousel or rating badge to your website with a simple iframe snippet.",
        icon: FileText,
        href: "/docs/plugins",
        badge: null,
    },
];

export default function HelpCenterPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <section className="bg-muted border-b border-border py-20">
                <div className="container px-4 md:px-6 mx-auto max-w-5xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">How can we help you today?</h1>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Browse categories below or email our team — we&apos;re here Monday through Friday, 9am–6pm EST.
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

            {/* Categories */}
            <section className="py-20 bg-background">
                <div className="container px-4 md:px-6 mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold mb-2">Browse by topic</h2>
                    <p className="text-muted-foreground mb-8">
                        Most answers live in our{" "}
                        <Link href="/docs" className="text-primary hover:brightness-90 underline underline-offset-2">
                            developer docs
                        </Link>
                        . Full help articles are coming soon.
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <Link
                                href={category.href}
                                key={category.title}
                                className="group flex flex-col p-6 rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2.5 bg-primary/10 text-primary rounded-md border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                                        <category.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
                                        {category.title}
                                    </h3>
                                    {category.badge && (
                                        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                            {category.badge}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                                    {category.description}
                                </p>
                                <span className="mt-4 text-primary text-sm font-medium flex items-center gap-1">
                                    View guides <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Support */}
            <section className="py-20 bg-muted border-t border-border">
                <div className="container px-4 md:px-6 mx-auto max-w-4xl text-center">
                    <div className="p-10 bg-card rounded-lg border border-border">
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
        </div>
    );
}
