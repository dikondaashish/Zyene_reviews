import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IndustriesCtaSection() {
    return (
        <section className="py-24 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-3xl text-center">
                    <div className="flex justify-center gap-1 mb-5">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="fill-chart-4 text-chart-4 size-7" />
                        ))}
                    </div>
                    <h2 className="text-4xl font-bold text-foreground mb-4">
                        Start getting more 5-star reviews today
                    </h2>
                    <p className="text-xl text-muted-foreground mb-10">
                        7-day free trial. Full access. No credit card lock-in.<br />
                        Works for every industry on this page ,  starting at $29.99/mo.
                    </p>
                    <Link href="/signup">
                        <Button size="lg" className="px-12 py-7 text-[1.05rem] font-semibold rounded-xl">
                            Start Your Free Trial <ArrowRight className="ml-2 size-5" />
                        </Button>
                    </Link>
                </div>
            </section>
    );
}
