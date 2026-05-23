import type { Metadata } from "next";
import Link from "next/link";
import {
    Star, Bot, ShieldCheck, BarChart3, TrendingUp, Sparkles,
    ArrowRight, Check, Globe, MessageSquare, QrCode, Users, Zap, Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function FeaturesFinalCtaSection() {
    return (
        <section className="py-24 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-4xl font-bold text-foreground mb-4">All features. One platform. One price.</h2>
                    <p className="text-xl text-muted-foreground mb-10">
                        Starting at $29.99/mo — no annual contracts, no add-ons, no surprises.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/signup">
                            <Button size="lg" className="px-10 py-7 text-[1.05rem] font-semibold rounded-xl">
                                Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            View full pricing →
                        </Link>
                    </div>
                </div>
            </section>
    );
}
