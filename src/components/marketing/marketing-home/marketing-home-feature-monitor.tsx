"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, LayoutDashboard, MessageSquare, Zap } from "lucide-react";
import { motion } from "framer-motion";

import type { MarketingHomeMotionProps } from "@/components/marketing/marketing-home/marketing-home-motion-props";

export function MarketingHomeFeatureMonitor({
    fadeInUp,
    staggerContainer: _staggerContainer,
    prefersReducedMotion: _prefersReducedMotion,
}: MarketingHomeMotionProps) {
    void _staggerContainer;
    void _prefersReducedMotion;
    return (
        <>
      {/* 3. FEATURE 1: Monitor */}
      <section id="features" className="w-full px-4 mb-24">
        <div className="container mx-auto max-w-[1400px]">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="bg-card rounded-[2rem] border border-border overflow-hidden flex flex-col md:flex-row"
          >
            {/* Left Side */}
            <div className="w-full md:w-1/2 p-12 md:p-16 lg:p-20">
              <div className="flex items-center gap-2 text-primary font-semibold mb-8">
                <Zap className="size-5" /> Effortless Monitoring
              </div>

              <h3 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-foreground mb-12 leading-tight">
                Never get blindsided by a <br /> bad review again
              </h3>

              <div className="space-y-8">
                <div className="flex max-w-md">
                  <div className="mr-4 mt-1">
                    <MessageSquare className="text-primary size-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-1">Instant SMS Alerts</h4>
                    <p className="text-muted-foreground font-light leading-relaxed">Get a text message the moment someone leaves a review. Catch 1-star issues while the customer is still in the building.</p>
                  </div>
                </div>

                <div className="flex max-w-md">
                  <div className="mr-4 mt-1">
                    <LayoutDashboard className="text-primary size-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-1">Centralized Dashboard</h4>
                    <p className="text-muted-foreground font-light leading-relaxed">Manage Google, Yelp, and Facebook from one single place instead of constantly checking three different apps.</p>
                  </div>
                </div>
              </div>

              <Link href="/#pricing">
                <Button variant="outline" className="mt-12 text-foreground bg-muted hover:bg-accent rounded-md px-6 py-6 font-medium">
                  See Pricing <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>

            {/* Right Side ,  Mockup */}
            <div className="w-full md:w-1/2 bg-muted p-8 md:p-16 flex items-center justify-center min-h-[500px]">
              <div className="bg-card p-6 rounded-lg w-full max-w-md border border-border">
                <div className="w-full h-48 rounded-lg mb-6 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=300&fit=crop&q=80"
                    alt="Local business storefront"
                    className="object-cover rounded-lg size-full"
                  />
                  <div className="absolute bottom-3 left-3 bg-card px-4 py-2 rounded-full border border-border text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                    <Clock className="text-primary size-4" /> Ping: 12:45 PM
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-primary/20 rounded-lg bg-primary/10 flex gap-4 items-center">
                    <div className="bg-primary/20 rounded-md flex items-center justify-center shrink-0 size-10">
                      <span className="font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-foreground">Your Business</h5>
                      <div className="flex text-primary text-xs mt-1">★★★★★ 4.8</div>
                    </div>
                  </div>
                  <div className="p-4 border border-border rounded-lg bg-muted flex gap-4 items-center opacity-60">
                    <div className="bg-border rounded-md flex items-center justify-center shrink-0 size-10">
                      <span className="font-bold text-muted-foreground">2</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-foreground">Competitor A</h5>
                      <div className="flex text-muted-foreground text-xs mt-1">★★★★☆ 3.8</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
        </>
    );
}
