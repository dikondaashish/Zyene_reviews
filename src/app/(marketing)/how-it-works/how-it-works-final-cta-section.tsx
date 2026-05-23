import type { Metadata } from "next";
import Link from "next/link";
import {
    Link2, Bell, Megaphone, TrendingUp, ArrowRight, Check,
    Star, Sparkles, ShieldCheck, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function HowItWorksFinalCtaSection() {
    return (
        <section className="py-24 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-4xl font-bold text-foreground mb-4">Ready to try it yourself?</h2>
                    <p className="text-xl text-muted-foreground mb-10">
                        7-day free trial. Full access to every feature.<br />
                        No credit card lock-in. Cancel anytime before day 7.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/signup">
                            <Button size="lg" className="px-10 py-7 text-[1.05rem] font-semibold rounded-xl">
                                Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            View all features →
                        </Link>
                    </div>
                </div>
            </section>
    );
}
