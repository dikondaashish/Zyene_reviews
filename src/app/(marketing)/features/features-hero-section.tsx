import type { Metadata } from "next";
import Link from "next/link";
import {
    Star, Bot, ShieldCheck, BarChart3, TrendingUp, Sparkles,
    ArrowRight, Check, Globe, MessageSquare, QrCode, Users, Zap, Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { POSITIONING } from "@/lib/growth/product-foundation";

export function FeaturesHeroSection() {
    return (
        <section className="pt-24 pb-20 px-4 text-center bg-background">
                <div className="container mx-auto max-w-4xl">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 mb-6">
                        <Sparkles className="h-3.5 w-3.5" />
                        Product Features
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.05]">
                        Everything you need to<br />
                        <span className="text-primary">own your online reputation</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Ten product pillars for local business owners — six deep-dives below, plus CRM,
                        multi-location, integrations, and team collaboration.
                    </p>
                    <p className="text-sm text-muted-foreground mb-10 max-w-xl mx-auto italic">
                        {POSITIONING.oneLiner}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/signup">
                            <Button size="lg" className="px-8 py-6 text-base font-semibold rounded-xl">
                                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button size="lg" variant="outline" className="px-8 py-6 text-base font-semibold rounded-xl">
                                See Pricing
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
    );
}
