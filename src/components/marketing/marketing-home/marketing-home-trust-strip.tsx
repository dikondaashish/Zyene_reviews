"use client";

import Link from "next/link";
import { Lock, ShieldCheck, CheckCircle2, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import { CustomerLogoBar } from "@/components/marketing/social-proof";

import type { MarketingHomeMotionProps } from "@/components/marketing/marketing-home/marketing-home-motion-props";

export function MarketingHomeTrustStrip({
    fadeInUp,
    staggerContainer,
    prefersReducedMotion: _prefersReducedMotion,
}: MarketingHomeMotionProps) {
    void _prefersReducedMotion;
    return (
        <section className="w-full py-24 md:py-32 px-4">
            <div className="mx-auto max-w-[1200px]">
                <motion.p
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="text-xs uppercase tracking-widest text-muted-foreground font-medium text-center mb-8"
                >
                    Trusted by local businesses everywhere
                </motion.p>

                <CustomerLogoBar />

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="mt-12 flex flex-wrap justify-center items-center gap-3"
                >
                    {[
                        { icon: Lock, label: "256-bit Encryption" },
                        { icon: ShieldCheck, label: "GDPR Compliant" },
                        { icon: CheckCircle2, label: "No Review Gating" },
                        { icon: KeyRound, label: "Secure OAuth" },
                    ].map(({ icon: Icon, label }) => (
                        <motion.div key={label} variants={fadeInUp}>
                            <Link
                                href="/security"
                                className="inline-flex items-center gap-2 border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                            >
                                <Icon className="size-4 text-primary" />
                                {label}
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
