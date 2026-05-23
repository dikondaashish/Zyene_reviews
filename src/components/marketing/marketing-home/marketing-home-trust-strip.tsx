"use client";

import Link from "next/link";
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { CustomerLogoBar } from "@/components/marketing/social-proof";

import type { MarketingHomeMotionProps } from "@/components/marketing/marketing-home/marketing-home-motion-props";

export function MarketingHomeTrustStrip({
    fadeInUp,
    staggerContainer: _staggerContainer,
    prefersReducedMotion: _prefersReducedMotion,
}: MarketingHomeMotionProps) {
    void _staggerContainer;
    void _prefersReducedMotion;
    return (
        <>
      <CustomerLogoBar />

      {/* 1.5 TRUST BADGES */}
      <section className="w-full py-10 px-4 border-y border-border bg-muted/40">
        <div className="container mx-auto max-w-[1200px]">
          <p className="text-center text-xs text-muted-foreground font-bold mb-8 tracking-widest uppercase">
            Built with trust and security
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 hover:opacity-100 transition-all duration-300">
            <Link href="/security" className="flex items-center gap-2 font-bold text-xl tracking-tighter hover:text-primary transition-colors"><Lock className="w-7 h-7" /> 256-bit Encryption</Link>
            <Link href="/security" className="flex items-center gap-2 font-bold text-xl tracking-tighter hover:text-primary transition-colors"><ShieldCheck className="w-7 h-7" /> GDPR Compliant</Link>
            <Link href="/security" className="flex items-center gap-2 font-bold text-xl tracking-tighter hover:text-primary transition-colors"><CheckCircle2 className="w-7 h-7" /> No Review Gating</Link>
            <Link href="/security" className="flex items-center gap-2 font-bold text-xl tracking-tighter hover:text-primary transition-colors"><Lock className="w-7 h-7" /> Secure OAuth</Link>
          </div>
          <p className="text-center mt-6">
            <Link href="/security" className="text-xs font-semibold text-primary hover:brightness-90">
              Read our security &amp; trust overview →
            </Link>
          </p>
        </div>
      </section>

      {/* 2. THE PROBLEM SECTION */}
      <section className="w-full py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-medium tracking-tight text-foreground leading-tight">
              One platform to attract, <br />
              keep & grow your customers
            </h2>
          </motion.div>
        </div>
      </section>
        </>
    );
}
