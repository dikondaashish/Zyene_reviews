import type { Metadata } from "next";
import Link from "next/link";
import {
    Link2, Bell, Megaphone, TrendingUp, ArrowRight, Check,
    Star, Sparkles, ShieldCheck, BarChart3,
} from "lucide-react";
import { STEPS } from "./how-it-works-data";

export function HowItWorksHeroSection() {
    return (
        <section className="pt-24 pb-20 px-4 text-center bg-background">
                <div className="container mx-auto max-w-4xl">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 mb-6">
                        <Sparkles className="size-3.5" />
                        How It Works
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.05]">
                        Get your first review<br />
                        <span className="text-primary">within 24 hours</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Four steps, no tech skills required. Most local businesses are up and running in under 10 minutes.
                    </p>

                    {/* Step Navigator */}
                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                        {STEPS.map((s) => (
                            <a
                                key={s.step}
                                href={`#step-${s.step}`}
                                className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:border-primary hover:text-primary text-sm font-medium text-muted-foreground transition-all"
                            >
                                <span className="text-primary font-bold">{s.step}</span>
                                {s.title}
                            </a>
                        ))}
                    </div>
                </div>
            </section>
    );
}
