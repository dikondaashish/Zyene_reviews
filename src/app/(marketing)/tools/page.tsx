import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Link2, BarChart3, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FREE_TOOLS } from "@/lib/phase7/free-tools-data";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
    title: "Free Tools — Review Links, Reputation Score & Response Templates | Zyene Reviews",
    description:
        "Free tools for local businesses: generate a Google review link, check your reputation score, and draft professional review responses. No signup required to try.",
    alternates: { canonical: "https://zyenereviews.com/tools" },
};

const ICONS = {
    link: Link2,
    chart: BarChart3,
    message: MessageSquare,
};

export default function FreeToolsHubPage() {
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Free Tools", url: "https://zyenereviews.com/tools" },
                ]}
            />
            <section className="pt-20 pb-16 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <p className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full inline-block mb-4">
                        Free tools
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                        Grow reviews without signing up first
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        Practical free tools for local business owners. Enter your email only when you want the full result delivered to your inbox.
                    </p>
                </div>
            </section>
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-5xl grid md:grid-cols-3 gap-8">
                    {FREE_TOOLS.map((tool) => {
                        const Icon = ICONS[tool.icon];
                        return (
                            <Link
                                key={tool.slug}
                                href={`/tools/${tool.slug}`}
                                className="group bg-card border border-border rounded-3xl p-8 hover:border-primary/40 hover:shadow-lg transition-all flex flex-col"
                            >
                                <Icon className="h-10 w-10 text-primary mb-4" />
                                <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                    {tool.title}
                                </h2>
                                <p className="text-sm text-muted-foreground flex-1">{tool.description}</p>
                                <span className="mt-6 text-sm font-semibold text-primary inline-flex items-center gap-1">
                                    Use tool <ArrowRight className="h-4 w-4" />
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </section>
            <section className="py-16 px-4 bg-muted/30 border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-2xl font-bold mb-3">Want automation behind these tools?</h2>
                    <p className="text-muted-foreground mb-6">
                        Zyene sends review requests, drafts AI replies, and tracks competitors — from $29.99/mo with a 7-day free trial.
                    </p>
                    <Button asChild size="lg" className="rounded-full">
                        <Link href="/signup">Start free trial</Link>
                    </Button>
                </div>
            </section>
        </>
    );
}
