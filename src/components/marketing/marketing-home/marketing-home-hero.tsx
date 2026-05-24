"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Star, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { PlatformStatsBadge } from "@/components/marketing/social-proof";
import { SIGNUP_URL } from "@/config/env";
import Image from "next/image";
import { marketingImages } from "@/lib/marketing/marketing-images";

import type { MarketingHomeMotionProps } from "@/components/marketing/marketing-home/marketing-home-motion-props";

export function MarketingHomeHero({ fadeInUp, staggerContainer, prefersReducedMotion }: MarketingHomeMotionProps) {
    return (
        <>
      {/* 1. HERO SECTION */}
      <section className="w-full pt-6 pb-24 md:pt-12 md:pb-32 px-4 md:px-8">
        <div className="container mx-auto max-w-[1400px]">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="w-full lg:w-[45%] pr-0 lg:pr-8"
            >
              <motion.h1
                variants={fadeInUp}
                className="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight text-foreground mb-8 leading-[0.9]"
              >
                Know about every review in 15 minutes
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed font-light"
              >
                The review management platform built for{" "}
                <span className="font-bold text-foreground">local businesses</span>, helping owners monitor
                reviews, respond faster, and build trust in a digital-first world.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 items-center">
                <Link href={SIGNUP_URL}>
                  <Button size="lg" className="rounded-md px-8 py-7 text-[1.1rem] font-medium transition-all">
                    Start Your 7-Day Free Trial <ArrowRight className="ml-2 size-5" />
                  </Button>
                </Link>
                <Link href="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  View pricing →
                </Link>
              </motion.div>
              <motion.div variants={fadeInUp} className="mt-8">
                <PlatformStatsBadge />
              </motion.div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, x: 50 }}
              animate={prefersReducedMotion ? false : { opacity: 1, x: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: "easeOut" }}
              className="w-full lg:w-[50%] relative"
            >
              {/* Petal Container */}
              <div className="relative aspect-[4/3] w-full rounded-tl-[4rem] rounded-bl-[4rem] rounded-br-[4rem] rounded-tr-lg overflow-hidden border border-border">
                <Image
                  src={marketingImages.home.hero.src}
                  alt={marketingImages.home.hero.alt}
                  width={marketingImages.home.hero.width}
                  height={marketingImages.home.hero.height}
                  className="absolute inset-0 object-cover size-full"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
              </div>

              {/* Floating Review Alert Card */}
              <motion.div
                animate={prefersReducedMotion ? false : { y: [0, -10, 0] }}
                transition={
                  prefersReducedMotion
                    ? undefined
                    : { repeat: Infinity, duration: 4, ease: "easeInOut" }
                }
                className="absolute -bottom-8 -left-8 md:bottom-12 md:-left-16 bg-card p-6 rounded-lg border border-border max-w-[320px] w-[90%]"
              >
                <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
                  <div className="rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 size-8">
                    <Star className="fill-current size-4" />
                  </div>
                  <p className="font-semibold text-foreground">Real-time Review Alerts</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-border size-8"></div>
                      <span className="text-sm font-medium text-muted-foreground">John Doe</span>
                    </div>
                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1 border border-primary/20">
                      <CheckCircle2 className="size-3" /> 5-Star Left
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-border size-8"></div>
                      <span className="text-sm font-medium text-muted-foreground">Sarah Smith</span>
                    </div>
                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1 border border-primary/20">
                      <AlertCircle className="size-3" /> 1-Star Alert
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
        </>
    );
}
