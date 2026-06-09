"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { PlatformStatsBadge } from "@/components/marketing/social-proof";
import { SIGNUP_URL } from "@/config/env";
import Image from "next/image";
import { marketingImages } from "@/lib/marketing/marketing-images";

import type { MarketingHomeMotionProps } from "@/components/marketing/marketing-home/marketing-home-motion-props";
import { HeroGridBg } from "@/components/marketing/marketing-home/hero-grid-bg";

export function MarketingHomeHero({ fadeInUp, staggerContainer, prefersReducedMotion }: MarketingHomeMotionProps) {
    return (
        <section className="relative w-full pt-24 pb-32 px-4">
            <HeroGridBg />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="relative z-10 mx-auto max-w-[1200px] flex flex-col items-center text-center"
            >
                <motion.span
                    variants={fadeInUp}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground mb-8"
                >
                    <span className="size-2 rounded-full bg-primary animate-pulse" />
                    Trusted by 500+ local businesses
                </motion.span>

                <motion.h1
                    variants={fadeInUp}
                    className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.92] text-foreground max-w-4xl"
                >
                    <em className="not-italic text-primary">Review management</em>{" "}
                    that pays for itself
                </motion.h1>

                <motion.p
                    variants={fadeInUp}
                    className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
                >
                    The review management platform built for local businesses, helping owners
                    monitor reviews, respond faster, and build trust.
                </motion.p>

                <motion.div variants={fadeInUp} className="mt-8 flex items-center justify-center gap-4 flex-wrap">
                    <Link href={SIGNUP_URL}>
                        <Button size="lg" className="rounded-md px-6 py-3 font-medium transition-colors">
                            Start 7-Day Free Trial
                        </Button>
                    </Link>
                    <Link
                        href="/features"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Watch 2-min demo →
                    </Link>
                </motion.div>

                <motion.p variants={fadeInUp} className="mt-3 text-xs text-muted-foreground">
                    No credit card required · Cancel anytime
                </motion.p>

                <motion.div variants={fadeInUp} className="mt-6">
                    <PlatformStatsBadge />
                </motion.div>

                <motion.div
                    variants={fadeInUp}
                    className="relative mt-16 w-full max-w-5xl"
                >
                    <div className="rounded-2xl overflow-hidden border border-border shadow-2xl relative">
                        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-background to-transparent z-10" />
                        <Image
                            src={marketingImages.home.hero.src}
                            alt={marketingImages.home.hero.alt}
                            width={marketingImages.home.hero.width}
                            height={marketingImages.home.hero.height}
                            className="w-full h-auto"
                            priority
                        />
                    </div>

                    <motion.div
                        animate={prefersReducedMotion ? false : { y: [0, -8, 0] }}
                        transition={
                            prefersReducedMotion
                                ? undefined
                                : { repeat: Infinity, duration: 5, ease: "easeInOut" }
                        }
                        className="absolute -bottom-5 right-8 md:right-16 bg-card p-5 rounded-xl border border-border shadow-xl max-w-[280px]"
                    >
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="rounded-full bg-primary/10 text-primary flex items-center justify-center size-7">
                                <Star className="fill-current size-3.5" />
                            </div>
                            <p className="font-semibold text-sm text-foreground">Real-time Review Alerts</p>
                        </div>
                        <div className="space-y-2">
                            {([
                                { ...marketingImages.home.heroReviewAlerts.fiveStar, badge: "5-Star", icon: CheckCircle2 },
                                { ...marketingImages.home.heroReviewAlerts.oneStar, badge: "1-Star Alert", icon: AlertCircle },
                            ] as const).map(({ name, src, alt, width, height, badge, icon: Icon }) => (
                                <div key={name} className="flex items-center justify-between bg-muted/60 p-2 rounded-lg">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="relative rounded-full overflow-hidden size-7 shrink-0 border border-border">
                                            <Image src={src} alt={alt} width={width} height={height} className="object-cover size-full" />
                                        </div>
                                        <span className="text-xs font-medium text-foreground truncate">{name}</span>
                                    </div>
                                    <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ml-2">
                                        <Icon className="size-2.5" /> {badge}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </section>
    );
}
