"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

import type { MarketingHomeMotionProps } from "@/components/marketing/marketing-home/marketing-home-motion-props";

export function MarketingHomeHowAndTestimonials({
    fadeInUp,
    staggerContainer,
    prefersReducedMotion: _prefersReducedMotion,
}: MarketingHomeMotionProps) {
    void _prefersReducedMotion;
    return (
        <>
      {/* 5. HOW IT WORKS */}
      <section className="w-full py-24 px-4 bg-muted">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-6">
              How it Works
            </h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid md:grid-cols-3 gap-12 relative max-w-5xl mx-auto"
          >
            {[
              { step: "1", title: "Connect", body: "Securely connect your Google Business Profile through Google's official authorization. We request only the permissions needed to read and help you respond to reviews." },
              { step: "2", title: "Get Alerted", body: "Instant SMS when reviews arrive. Our AI analyzes sentiment and flags urgency so you know which reviews need attention first." },
              { step: "3", title: "Reply & Grow", body: "One-tap AI replies. Ask customers for reviews via email, SMS, or shareable links, while the Negative Feedback Shield routes low ratings to private resolution." },
            ].map(({ step, title, body }) => (
              <motion.div key={step} variants={fadeInUp} className="flex flex-col items-center text-center px-4">
                <div className="bg-primary text-primary-foreground rounded-md border border-primary flex items-center justify-center mb-8 text-3xl font-bold z-10 size-20">
                  {step}
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">{title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed font-light">{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5.5 TESTIMONIALS */}
      <section className="w-full py-24 px-4 bg-background border-b border-border">
        <div className="container mx-auto max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="text-center mb-16">
            <p className="text-primary font-semibold mb-3 tracking-wide uppercase text-sm">Customer Stories</p>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4">Loved by local business owners</h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "We were stuck at 4.1 stars for nearly two years. Since switching to Zyene, we've jumped to 4.8 stars and our incoming calls have literally doubled. The AI replies save me 3 hours a week.",
                name: "Michael T.",
                role: "Owner, Riverfront Dining",
                photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80",
              },
              {
                quote: "I was paying $300/mo for Birdeye. Zyene does exactly the same thing but the interface is actually modern and the AI response generator is much better. No brainer switch.",
                name: "Sarah Jenkins",
                role: "Director, Apex Dental Care",
                photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80",
              },
              {
                quote: "The feedback collection feature alone is worth it. We heard from a concerned customer directly, resolved their issue quickly, and they updated their review to 5 stars. Incredible.",
                name: "David Chen",
                role: "Manager, Chen Auto Repair",
                photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80",
              },
            ].map(({ quote, name, role, photo }) => (
              <motion.div key={name} variants={fadeInUp} className="bg-muted border border-border p-8 rounded-lg relative">
                <div className="flex gap-1 text-chart-4 mb-6">
                  {[1,2,3,4,5].map(i => <Star key={i} className="fill-current size-5" />)}
                </div>
                <p className="text-lg text-muted-foreground mb-8 font-light leading-relaxed">
                  &quot;{quote}&quot;
                </p>
                <div className="flex items-center gap-4">
                  <div className="rounded-full overflow-hidden size-12">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt={name} className="object-cover size-full" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{name}</h3>
                    <p className="text-sm text-muted-foreground">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
        </>
    );
}
