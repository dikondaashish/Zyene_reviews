"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { marketingImages } from "@/lib/marketing/marketing-images";

import type { MarketingHomeMotionProps } from "@/components/marketing/marketing-home/marketing-home-motion-props";

export function MarketingHomeFeatureAutomation({
    fadeInUp,
    staggerContainer,
    prefersReducedMotion: _prefersReducedMotion,
}: MarketingHomeMotionProps) {
    void _prefersReducedMotion;
    return (
        <section className="w-full py-24 md:py-32 px-4 bg-muted/40">
            <div className="mx-auto max-w-[1200px]">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center"
                >
                    <motion.div variants={fadeInUp} className="order-2 md:order-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-6">
                            Automate
                        </span>
                        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-foreground mb-6">
                            Automate your review collection process
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                            AI-powered replies in your brand voice, plus automated campaigns that bring in new reviews on autopilot.
                        </p>
                        <ul className="space-y-4 mb-8">
                            {[
                                "One-click AI replies in professional, empathetic, or friendly tone",
                                "Auto-request reviews via SMS, email, or shareable links",
                                "Negative Feedback Shield routes low ratings privately",
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-3">
                                    <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                                    <span className="text-foreground">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/features"
                            className="text-primary text-sm font-medium hover:underline underline-offset-4 inline-flex items-center gap-1"
                        >
                            Explore AI features →
                        </Link>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="order-1 md:order-1">
                        <div className="rounded-2xl border border-border overflow-hidden">
                            <Image
                                src={marketingImages.home.featureAutomation.src}
                                alt={marketingImages.home.featureAutomation.alt}
                                width={marketingImages.home.featureAutomation.width}
                                height={marketingImages.home.featureAutomation.height}
                                className="w-full h-auto"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
