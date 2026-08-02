import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
import Link from "next/link";
import { ArrowRight, Link2, BarChart3, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FREE_TOOLS } from "@/lib/phase7/free-tools-data";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { SIGNUP_URL } from "@/config/env";
export const metadata: Metadata = mergeMarketingSocial({
    title: "Free Review Tools for Local Businesses",
    description:
        "Free tools for local businesses: generate a Google review link, check your reputation score, and draft professional review responses. No signup required to try.",
    alternates: { canonical: "https://www.zyenereviews.com/tools" },
    openGraph: {
        title: "Free Review Tools",
        description: "Generate a Google review link, check your reputation score, and draft review responses, free, no signup required.",
        url: "https://www.zyenereviews.com/tools",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Review Tools",
        description: "Generate a Google review link, check your reputation score, and draft review responses, free.",
    },
});
const ICONS = { link: Link2, chart: BarChart3, message: MessageSquare };
export default function FreeToolsHubPage() {
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Free Tools", url: "https://www.zyenereviews.com/tools" },
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
            <section className="py-12 px-4 border-b border-border bg-muted/20">
                <div className="container mx-auto max-w-3xl space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">Free review tools for local businesses</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        These tools help you take the first step toward a stronger Google reputation: a direct review
                        link customers can click, a quick snapshot of your public rating, and draft replies you can
                        customize before posting.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        When you are ready to automate requests, monitor every platform in one inbox, and use AI replies
                        at scale, Zyene Reviews includes everything in plans from $29.99/mo with a 7-day free trial.
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
                                className="group bg-card border border-border rounded-3xl p-8 hover:border-primary/40 hover:shadow-lg transition-[border-color,box-shadow] flex flex-col"
                            >
                                <Icon className="text-primary mb-4 size-10" />
                                <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                    {tool.title}
                                </h2>
                                <p className="text-sm text-muted-foreground flex-1">{tool.description}</p>
                                <span className="mt-6 text-sm font-semibold text-primary inline-flex items-center gap-1">
                                    Use tool <ArrowRight className="size-4" />
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
                        Zyene Reviews sends review requests, drafts AI replies, and tracks competitors—from $29.99/mo with a 7-day free trial.
                    </p>
                    <Button asChild size="lg" className="rounded-full">
                        <Link href={SIGNUP_URL}>Start free trial</Link>
                    </Button>
                </div>
            </section>
        </>
    );
}
