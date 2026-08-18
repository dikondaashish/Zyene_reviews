import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, BookOpen, Sparkles } from "lucide-react";

export function BlogHeroSection() {
    return (
        <section className="pt-20 pb-12 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                            <BookOpen className="size-3" /> Blog
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                        Review management &amp; local SEO<br />for business owners
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        Practical guides to get more Google reviews, respond professionally, strengthen local search fundamentals, and protect your reputation.
                    </p>
                </div>
            </section>
    );
}
