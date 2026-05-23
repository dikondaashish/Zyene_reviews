"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Smartphone, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";

import type { MarketingHomeMotionProps } from "@/components/marketing/marketing-home/marketing-home-motion-props";

export function MarketingHomeFeatureAutomation({
    fadeInUp,
    staggerContainer: _staggerContainer,
    prefersReducedMotion: _prefersReducedMotion,
}: MarketingHomeMotionProps) {
    void _staggerContainer;
    void _prefersReducedMotion;
    return (
        <>
      {/* 4. FEATURE 2: AI Replies + Collection */}
      <section className="w-full px-4 mb-24">
        <div className="container mx-auto max-w-[1400px]">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="bg-card rounded-[2rem] border border-border overflow-hidden flex flex-col md:flex-row-reverse"
          >
            {/* Content */}
            <div className="w-full md:w-1/2 p-12 md:p-16 lg:p-20">
              <div className="flex items-center gap-2 text-primary font-semibold mb-8">
                <Star className="size-5" /> Automated Reputation
              </div>

              <h3 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-foreground mb-12 leading-tight">
                Automate your review <br /> collection process
              </h3>

              <div className="space-y-8">
                <div className="flex max-w-md">
                  <div className="mr-4 mt-1">
                    <ShieldCheck className="text-primary size-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-1">AI-Powered Replies</h4>
                    <p className="text-muted-foreground font-light leading-relaxed">Instantly generate professional, empathetic, or friendly replies in your brand&apos;s voice with a single click.</p>
                  </div>
                </div>

                <div className="flex max-w-md">
                  <div className="mr-4 mt-1">
                    <Smartphone className="text-primary size-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-1">Auto-Request Reviews</h4>
                    <p className="text-muted-foreground font-light leading-relaxed">Automatically send SMS or email campaigns to recent customers asking for reviews — while the Negative Feedback Shield routes low ratings privately.</p>
                  </div>
                </div>
              </div>

              <Link href="/#pricing">
                <Button variant="outline" className="mt-12 text-foreground bg-muted hover:bg-accent rounded-md px-6 py-6 font-medium">
                  See Pricing <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>

            {/* Mockup */}
            <div className="w-full md:w-1/2 bg-muted p-8 md:p-16 flex items-center justify-center min-h-[500px]">
              <div className="bg-card p-6 rounded-lg w-full max-w-md border border-border">
                {/* Fake AI Reply UI */}
                <div className="flex gap-4 mb-6 pb-6 border-b border-border">
                  <div className="rounded-full shrink-0 overflow-hidden size-12">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80" alt="Customer" className="object-cover size-full" />
                  </div>
                  <div>
                    <div className="h-4 w-24 bg-border rounded-full mb-2"></div>
                    <div className="flex gap-1 text-chart-4 mb-2">
                      {[1,2,3,4,5].map(i => <Star key={i} className="fill-current size-4" />)}
                    </div>
                    <p className="text-sm text-muted-foreground">&quot;This place was amazing! Definitely coming back.&quot;</p>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-primary text-sm relative">
                  <div className="absolute -top-3 right-4 bg-primary text-primary-foreground text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Zap className="size-3" /> AI Generated
                  </div>
                  &quot;Thank you so much! We are thrilled to hear you enjoyed your visit and look forward to welcoming you back soon.&quot;
                </div>

                <div className="mt-6 flex gap-3">
                  <Button className="w-full rounded-md">Publish to Google</Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
        </>
    );
}
