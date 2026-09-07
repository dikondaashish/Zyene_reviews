import Link from "next/link";
import { ArrowRight, Link2, BarChart3, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FREE_TOOLS } from "@/lib/free-tools/free-tools-data";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { SIGNUP_URL } from "@/config/env";
import { LandingHero } from "@/components/marketing/landing-hero";
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
            <LandingHero image={{ src: "/marketing/home/cafe-conversation.webp", alt: "A barista talking with a customer at work" }} eyebrow="Free tools for local business" title="A useful next step. On us." description="Create a Google review link, check your reputation, or find the words for your next reply. No signup needed to try." />

            <section className="py-20 px-4">
                <div className="container mx-auto max-w-5xl grid grid-cols-1 gap-5">
                    {FREE_TOOLS.map((tool) => {
                        const Icon = ICONS[tool.icon];
                        return (
                            <Link
                                key={tool.slug}
                                href={`/tools/${tool.slug}`}
                                className="group bg-card border border-border rounded-2xl p-6 sm:p-8 hover:border-primary transition-colors grid grid-cols-1 gap-3 sm:grid-cols-[56px_1fr_auto] sm:items-center"
                            >
                                <Icon className="text-primary size-7" aria-hidden="true" />
                                <div><h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                    {tool.title}
                                </h2>
                                <p className="text-sm text-muted-foreground flex-1">{tool.description}</p></div>
                                <span className="text-sm font-semibold text-primary inline-flex items-center gap-1">
                                    Use tool <ArrowRight className="size-4" />
                                </span>
                            </Link>
                        );
                    })}
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
            <section className="py-16 px-4 bg-muted/30 border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-2xl font-bold mb-3">Want automation behind these tools?</h2>
                    <p className="text-muted-foreground mb-6">
                        Zyene Reviews sends review requests, drafts AI replies, and tracks competitors - from $29.99/mo with a 7-day free trial.
                    </p>
                    <Button asChild size="lg" className="rounded-full">
                        <Link href={SIGNUP_URL}>Start free trial</Link>
                    </Button>
                </div>
            </section>
        </>
    );
}
