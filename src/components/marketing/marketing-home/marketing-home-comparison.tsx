"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import type { MarketingHomeMotionProps } from "@/components/marketing/marketing-home/marketing-home-motion-props";

export function MarketingHomeComparison({
    fadeInUp,
    staggerContainer: _staggerContainer,
    prefersReducedMotion: _prefersReducedMotion,
}: MarketingHomeMotionProps) {
    void _staggerContainer;
    void _prefersReducedMotion;
    return (
        <>
      {/* 5.6 COMPARISON TABLE */}
      <section className="w-full py-24 px-4 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4">Why we win</h2>
            <p className="text-muted-foreground">Enterprise features. Owner-operator pricing.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-6 font-semibold text-muted-foreground border-b border-r border-border w-1/3">Feature</th>
                    <th className="p-6 font-bold text-xl text-primary border-b border-r border-border bg-primary/10 w-1/3">Zyene Reviews</th>
                    <th className="p-6 font-semibold text-muted-foreground border-b border-border w-1/3">Birdeye / Podium</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "AI Review Replies", zyene: true, comp: "Upcharge / add-on" },
                    { feature: "Negative Feedback Shield", zyene: true, comp: false },
                    { feature: "Automated SMS Campaigns", zyene: true, comp: true },
                    { feature: "Competitor Tracking", zyene: true, comp: "Premium tiers only" },
                    { feature: "GBP SEO Dashboard + Keywords", zyene: true, comp: "Dominate tier only" },
                    { feature: "Developer API (included)", zyene: true, comp: "Enterprise only" },
                    { feature: "Annual contract required", zyene: false, comp: true },
                    { feature: "Starting Price", zyene: "$29.99/mo", comp: "$299–$599/mo" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="p-6 text-foreground font-medium border-r border-border">{row.feature}</td>
                      <td className="p-6 border-r border-border bg-primary/5">
                        {typeof row.zyene === 'boolean'
                          ? (row.zyene
                              ? <CheckCircle2 className="text-primary w-6 h-6" />
                              : <span className="text-sm text-muted-foreground">No</span>)
                          : <span className="font-bold text-foreground">{row.zyene}</span>
                        }
                      </td>
                      <td className="p-6">
                        {typeof row.comp === 'boolean'
                          ? (row.comp
                              ? <CheckCircle2 className="text-primary w-6 h-6" />
                              : <span className="text-sm text-muted-foreground">No</span>)
                          : <span className="text-muted-foreground text-sm">{row.comp}</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>
        </>
    );
}
