"use client";

import { motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

import type { MarketingHomeMotionProps } from "@/components/marketing/marketing-home/marketing-home-motion-props";

const ROWS = [
    { feature: "AI Review Replies", zyene: true, comp: "Add-on" },
    { feature: "Negative Feedback Shield", zyene: true, comp: false },
    { feature: "Automated SMS Campaigns", zyene: true, comp: true },
    { feature: "Competitor Tracking", zyene: true, comp: "Premium only" },
    { feature: "GBP SEO Dashboard", zyene: true, comp: "Top tier only" },
    { feature: "Developer API (included)", zyene: true, comp: "Enterprise only" },
    { feature: "Annual contract required", zyene: false, comp: true },
    { feature: "Starting Price", zyene: "$29.99/mo", comp: "$299+/mo" },
] as const;

function CellValue({ value }: { value: boolean | string }) {
    if (typeof value === "string") {
        return <span className="text-sm text-muted-foreground">{value}</span>;
    }
    if (value) {
        return <CheckCircle2 className="size-5 text-primary" />;
    }
    return <X className="size-5 text-muted-foreground/50" />;
}

export function MarketingHomeComparison({
    fadeInUp,
    staggerContainer: _staggerContainer,
    prefersReducedMotion: _prefersReducedMotion,
}: MarketingHomeMotionProps) {
    void _staggerContainer;
    void _prefersReducedMotion;
    return (
        <section className="w-full py-24 md:py-32 px-4 bg-muted/40 border-y border-border">
            <div className="mx-auto max-w-[900px]">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4">
                        Why owners switch to Zyene
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Enterprise features at owner-operator pricing.
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="rounded-xl border border-border bg-card overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="p-4 md:p-5 text-sm font-medium text-muted-foreground w-2/5">Feature</th>
                                    <th className="p-4 md:p-5 text-sm font-bold text-primary w-[30%]">Zyene Reviews</th>
                                    <th className="p-4 md:p-5 text-sm font-medium text-muted-foreground w-[30%]">Birdeye / Podium</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ROWS.map((row, i) => (
                                    <tr
                                        key={row.feature}
                                        className={i < ROWS.length - 1 ? "border-b border-border/50" : ""}
                                    >
                                        <td className="p-4 md:p-5 text-sm font-medium text-foreground">{row.feature}</td>
                                        <td className="p-4 md:p-5">
                                            {typeof row.zyene === "string" ? (
                                                <span className="text-sm font-bold text-foreground">{row.zyene}</span>
                                            ) : (
                                                <CellValue value={row.zyene} />
                                            )}
                                        </td>
                                        <td className="p-4 md:p-5">
                                            <CellValue value={row.comp} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
