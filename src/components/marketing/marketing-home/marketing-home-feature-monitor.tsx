"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { marketingImages } from "@/lib/marketing/marketing-images";

import type { MarketingHomeMotionProps } from "@/components/marketing/marketing-home/marketing-home-motion-props";

export function MarketingHomeFeatureMonitor({
    fadeInUp,
    staggerContainer,
    prefersReducedMotion: _prefersReducedMotion,
}: MarketingHomeMotionProps) {
    void _prefersReducedMotion;
    return (
        <section id="features" className="w-full py-24 md:py-32 px-4">
            <div className="mx-auto max-w-[1200px]">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center"
                >
                    <motion.div variants={fadeInUp} className="order-2 md:order-1">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-6">
                            Monitor
                        </span>
                        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-foreground mb-6">
                            Never get blindsided by a bad review again
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                            Get instant SMS alerts the moment someone leaves a review. Catch issues while the customer is still nearby.
                        </p>
                        <ul className="space-y-4 mb-8">
                            {[
                                "Instant SMS and email alerts for every new review",
                                "Centralized dashboard for Google, Yelp, and Facebook",
                                "Sentiment analysis flags urgent reviews first",
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
                            Learn more about monitoring →
                        </Link>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="order-1 md:order-2">
                        <div className="rounded-2xl border border-border overflow-hidden">
                            <Image
                                src={marketingImages.home.featureMonitor.src}
                                alt={marketingImages.home.featureMonitor.alt}
                                width={marketingImages.home.featureMonitor.width}
                                height={marketingImages.home.featureMonitor.height}
                                className="w-full h-auto"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
