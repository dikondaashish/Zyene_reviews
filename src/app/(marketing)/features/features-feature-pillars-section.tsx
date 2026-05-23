import type { Metadata } from "next";
import Link from "next/link";
import {
    Star, Bot, ShieldCheck, BarChart3, TrendingUp, Sparkles,
    ArrowRight, Check, Globe, MessageSquare, QrCode, Users, Zap, Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerLogoBar, TestimonialGrid } from "@/components/marketing/social-proof";
import { PlatformPillarsSection } from "@/components/marketing/platform-pillars-section";
import { PILLARS } from "./features-data";

export function FeaturesFeaturePillarsSection() {
    return (
        <>
        <section className="py-6 bg-background">
                {PILLARS.map((pillar, i) => {
                    const Icon = pillar.icon;
                    const isEven = i % 2 === 0;
                    return (
                        <div
                            key={pillar.id}
                            id={pillar.id}
                            className={`py-20 px-4 scroll-mt-20 ${isEven ? "bg-background" : "bg-muted/40"} ${pillar.highlight ? "border-y border-primary/20" : ""}`}
                        >
                            <div className={`container mx-auto max-w-6xl grid lg:grid-cols-2 gap-16 items-center ${isEven ? "" : "lg:grid-flow-dense"}`}>
                                {/* Text */}
                                <div className={isEven ? "" : "lg:col-start-2"}>
                                    <div className={`inline-flex items-center gap-2 ${pillar.iconBg} ${pillar.iconColor} text-xs font-bold px-4 py-2 rounded-full border border-current/20 mb-4`}>
                                        <Icon className="h-3.5 w-3.5" />
                                        {pillar.title}
                                    </div>
                                    {pillar.highlight && (
                                        <div className="inline-flex items-center gap-1 ml-2 mb-4 bg-primary/10 text-primary text-[11px] font-bold px-3 py-1 rounded-full border border-primary/20">
                                            ✦ Unique to Zyene
                                        </div>
                                    )}
                                    <h2 className="text-4xl font-bold text-foreground mb-3 leading-tight">{pillar.title}</h2>
                                    <p className="text-lg text-muted-foreground mb-8">{pillar.tagline}</p>
                                    <ul className="space-y-3 mb-8">
                                        {pillar.bullets.map((b) => (
                                            <li key={b} className="flex items-start gap-3">
                                                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground">{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <Link href={pillar.cta.href}>
                                            <Button variant={pillar.highlight ? "default" : "outline"} className="gap-2">
                                                {pillar.cta.label} <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link
                                            href={`/features/${pillar.id}`}
                                            className="text-sm font-medium text-primary hover:underline"
                                        >
                                            Feature page →
                                        </Link>
                                    </div>
                                </div>

                                {/* Visual block */}
                                <div className={isEven ? "" : "lg:col-start-1 lg:row-start-1"}>
                                    <div className={`rounded-2xl border ${pillar.highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"} p-8 h-72 flex items-center justify-center relative overflow-hidden`}>
                                        <div className={`absolute inset-0 ${pillar.iconBg} opacity-30`} />
                                        <div className="relative flex flex-col items-center gap-4 text-center">
                                            <div className={`${pillar.iconBg} p-5 rounded-2xl`}>
                                                <Icon className={`h-12 w-12 ${pillar.iconColor}`} />
                                            </div>
                                            <p className="text-sm font-semibold text-foreground">{pillar.tagline}</p>
                                            <div className="flex gap-1 mt-1">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        className={`h-4 w-4 ${pillar.id === "review-monitoring" || pillar.id === "review-collection" || pillar.id === "analytics" ? "fill-chart-4 text-chart-4" : "text-muted-foreground/20"}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>

            <PlatformPillarsSection />

            <CustomerLogoBar title="Features trusted by local businesses nationwide" />

            <TestimonialGrid limit={3} title="Built for businesses like yours" />
        </>
    );
}
