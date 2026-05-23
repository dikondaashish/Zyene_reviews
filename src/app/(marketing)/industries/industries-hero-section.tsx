import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IndustriesHeroSection() {
    return (
        <section className="pt-24 pb-20 px-4 text-center bg-background">
                <div className="container mx-auto max-w-4xl">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 mb-6">
                        <Sparkles className="h-3.5 w-3.5" />
                        Industry Solutions
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.05]">
                        Review management built<br />
                        <span className="text-primary">for your industry</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Every industry has unique challenges when it comes to online reputation. Zyene is tailored to help local businesses in each vertical grow their reviews, protect their reputation, and rank higher on Google Maps.
                    </p>
                    <p className="text-sm text-muted-foreground mb-10">
                        <Link href="/es/industries" className="text-primary hover:underline font-medium">
                            Ver soluciones en español →
                        </Link>
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
