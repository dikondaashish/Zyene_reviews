import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import { INDUSTRIES } from "@/lib/phase3/industry-data";

export function IndustriesIndustryGridSection() {
    return (
        <section className="py-20 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl font-bold text-foreground text-center mb-3">Choose your industry</h2>
                    <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
                        See exactly how Zyene solves reputation challenges specific to your type of business.
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {INDUSTRIES.map((industry) => (
                            <Link
                                key={industry.slug}
                                href={`/industries/${industry.slug}`}
                                className="group bg-card border border-border rounded-2xl p-7 hover:border-primary/50 hover:shadow-lg transition-all flex flex-col"
                            >
                                <div className="text-5xl mb-4">{industry.emoji}</div>
                                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                    {industry.name}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">
                                    {industry.heroSub.split(".")[0]}.
                                </p>
                                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                    Learn more <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
    );
}
