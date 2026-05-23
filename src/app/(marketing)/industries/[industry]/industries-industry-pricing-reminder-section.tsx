import type { Metadata } from "next";
import Link from "next/link";
import {
    ArrowRight, Star, Check, ShieldCheck, Bot, TrendingUp,
    Globe, Sparkles, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Static Generation ────────────────────────────────────────────────────────


// ─── Metadata ─────────────────────────────────────────────────────────────────


// ─── Page ─────────────────────────────────────────────────────────────────────
import type { IndustryData } from "@/lib/phase3/industry-data";

export function IndustriesIndustryPricingReminderSection({ data }: { data: IndustryData }) {
    return (
        <section className="py-20 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-4xl">
                    <div className="bg-card border border-border rounded-3xl p-10">
                        <div className="grid lg:grid-cols-2 gap-10 items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-foreground mb-3">
                                    Pricing built for {data.name.toLowerCase()}
                                </h2>
                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    No per-location surcharges. No annual contracts. Full access to every feature ,  AI replies, Negative Feedback Shield, competitor tracking ,  starting at $29.99/mo.
                                </p>
                                <ul className="space-y-2.5 mb-8">
                                    {[
                                        "7-day free trial, full access, no charge",
                                        "Cancel anytime, no cancellation fees",
                                        "Starter: 1 location, $29.99/mo",
                                        "Professional: up to 3 locations, $59.99/mo",
                                        "Enterprise: unlimited locations, contact us",
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                            <Check className="text-primary shrink-0 mt-0.5 size-4" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex gap-4">
                                    <Link href="/signup">
                                        <Button className="gap-2">
                                            Start Free Trial <ArrowRight className="size-4" />
                                        </Button>
                                    </Link>
                                    <Link href="/pricing">
                                        <Button variant="outline">Full pricing →</Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-8xl font-black text-primary mb-2">$29.99</div>
                                <div className="text-muted-foreground font-medium">per month</div>
                                <div className="text-sm text-muted-foreground mt-1">No annual contract · Cancel anytime</div>
                                <div className="mt-6 inline-block bg-primary/10 text-primary font-bold text-sm px-5 py-2.5 rounded-full border border-primary/20">
                                    vs $299–$399/mo at competitors
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
    );
}
