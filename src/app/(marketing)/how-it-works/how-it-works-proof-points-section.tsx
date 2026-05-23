import type { Metadata } from "next";
import Link from "next/link";
import { PROOF_POINTS } from "./how-it-works-data";

export function HowItWorksProofPointsSection() {
    return (
        <section className="py-20 px-4 bg-primary/5 border-t border-primary/20">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-foreground text-center mb-12">What businesses see after 90 days</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {PROOF_POINTS.map((point) => {
                            const Icon = point.icon;
                            return (
                                <div key={point.label} className="bg-card border border-border rounded-2xl p-6 text-center">
                                    <Icon className="text-primary mx-auto mb-3 size-8" />
                                    <div className="text-4xl font-black text-foreground mb-2">{point.value}</div>
                                    <div className="text-sm text-muted-foreground leading-snug">{point.label}</div>
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-6">
                        Based on platform averages. Individual results vary by industry, location, and review request frequency.
                    </p>
                </div>
            </section>
    );
}
