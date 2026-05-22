import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { NEGATIVE_FEEDBACK_SHIELD } from "@/lib/growth/product-foundation";
import type { FeaturePillarPage as Pillar } from "@/lib/growth/feature-pillars";

export function FeaturePillarPageView({ pillar }: { pillar: Pillar }) {
    const path = `/features/${pillar.slug}`;

    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Features", url: "https://zyenereviews.com/features" },
                    { name: pillar.title, url: `https://zyenereviews.com${path}` },
                ]}
            />

            <section className="pt-20 pb-12 px-4 bg-muted border-b border-border">
                <div className="container mx-auto max-w-4xl">
                    <Link
                        href="/features"
                        className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block"
                    >
                        ← All features
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{pillar.title}</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">{pillar.tagline}</p>
                </div>
            </section>

            <section className="py-16 px-4 bg-background">
                <div className="container mx-auto max-w-4xl space-y-8">
                    <ul className="space-y-4">
                        {pillar.bullets.map((b) => (
                            <li key={b} className="flex gap-3 text-muted-foreground">
                                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <span>{b}</span>
                            </li>
                        ))}
                    </ul>

                    {pillar.slug === "review-collection" ? (
                        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-6">
                            <div className="flex items-center gap-2 text-primary font-semibold mb-3">
                                <Sparkles className="h-4 w-4" />
                                {NEGATIVE_FEEDBACK_SHIELD.headline}
                            </div>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                                {NEGATIVE_FEEDBACK_SHIELD.steps.map((s) => (
                                    <li key={s}>{s}</li>
                                ))}
                            </ol>
                            <p className="text-sm font-medium text-foreground mt-4">
                                {NEGATIVE_FEEDBACK_SHIELD.result}
                            </p>
                        </div>
                    ) : null}

                    <div className="flex flex-wrap gap-4 pt-4">
                        <Link href={pillar.cta.href}>
                            <Button size="lg" className="gap-2">
                                {pillar.cta.label} <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="lg" variant="outline">
                                Start 7-day free trial
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
