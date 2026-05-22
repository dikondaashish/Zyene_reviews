"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Zap,
  LayoutDashboard,
  Clock,
  DollarSign,
  ShieldCheck,
  Smartphone,
  Star,
  AlertCircle,
  Check,
  Crown,
  ChevronDown,
  Lock
} from "lucide-react";
import { useMemo, useState } from "react";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex cursor-pointer items-center justify-between w-full py-5 text-left"
      >
        <span className="text-lg font-medium text-foreground">{question}</span>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <p className="pb-5 text-muted-foreground leading-relaxed">{answer}</p>
      )}
    </div>
  );
}
import { motion, useReducedMotion, type Variants } from "framer-motion";

export default function MarketingPage() {
  const prefersReducedMotion = useReducedMotion();

  const fadeInUp: Variants = useMemo(
    () =>
      prefersReducedMotion
        ? {
            hidden: { opacity: 1, y: 0 },
            visible: { opacity: 1, y: 0, transition: { duration: 0 } },
          }
        : {
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
          },
    [prefersReducedMotion]
  );

  const staggerContainer: Variants = useMemo(
    () =>
      prefersReducedMotion
        ? {
            hidden: { opacity: 1 },
            visible: { opacity: 1, transition: { staggerChildren: 0 } },
          }
        : {
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
          },
    [prefersReducedMotion]
  );

  return (
    <div className="flex flex-col items-center w-full bg-background text-foreground overflow-hidden font-sans pt-20">

      {/* 1. HERO SECTION */}
      <section className="w-full pt-16 pb-24 md:pt-24 md:pb-32 px-4 md:px-8">
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
                The review management platform built for <span className="font-bold text-foreground">local businesses</span> —
                helping owners monitor reviews, respond faster, and build trust in a digital-first world.
              </motion.p>
              <motion.div variants={fadeInUp}>
                <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/signup" : `https://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/signup`}>
                  <Button size="lg" className="rounded-md px-8 py-7 text-[1.1rem] font-medium transition-all">
                    Start Your 7-Day Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Visual (SpotHopper Petal Shape) */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, x: 50 }}
              animate={prefersReducedMotion ? false : { opacity: 1, x: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: "easeOut" }}
              className="w-full lg:w-[50%] relative"
            >
              {/* Petal Container */}
              <div className="relative aspect-[4/3] w-full rounded-tl-[4rem] rounded-bl-[4rem] rounded-br-[4rem] rounded-tr-lg overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&q=80"
                  alt="Business owner checking reviews on tablet"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
              </div>

              {/* Floating Overlap Card (SpotHopper Style) */}
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
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <h3 className="font-semibold text-foreground">Real-time Review Alerts</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-border"></div>
                      <span className="text-sm font-medium text-muted-foreground">John Doe</span>
                    </div>
                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1 border border-primary/20">
                      <CheckCircle2 className="w-3 h-3" /> 5-Star Left
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-border"></div>
                      <span className="text-sm font-medium text-muted-foreground">Sarah Smith</span>
                    </div>
                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1 border border-primary/20">
                      <AlertCircle className="w-3 h-3" /> 1-Star Alert
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 1.5 TRUST BADGES */}
      <section className="w-full py-10 px-4 border-y border-border bg-muted/40">
        <div className="container mx-auto max-w-[1200px]">
          <p className="text-center text-xs text-muted-foreground font-bold mb-8 tracking-widest uppercase">
            Built with trust and security
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-300">
            <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter"><Lock className="w-8 h-8" /> 256-bit Encryption</div>
            <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter"><ShieldCheck className="w-8 h-8" /> GDPR Compliant</div>
            <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter"><CheckCircle2 className="w-8 h-8" /> No Review Gating</div>
            <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter"><Lock className="w-8 h-8" /> Secure OAuth</div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM SECTION (Header only, matching SpotHopper sections) */}
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

      {/* 3. FEATURE 1: 50/50 Split Container (SpotHopper Style) */}
      <section id="features" className="w-full px-4 mb-24">
        <div className="container mx-auto max-w-[1400px]">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="bg-card rounded-[2rem] border border-border overflow-hidden flex flex-col md:flex-row"
          >
            {/* Left Side (White) */}
            <div className="w-full md:w-1/2 p-12 md:p-16 lg:p-20">
              <div className="flex items-center gap-2 text-primary font-semibold mb-8">
                <Zap className="h-5 w-5" /> Effortless Monitoring
              </div>

              <h3 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-foreground mb-12 leading-tight">
                Never get blindsided by a <br /> bad review again
              </h3>

              <div className="space-y-8">
                <div className="flex max-w-md">
                  <div className="mr-4 mt-1">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-1">Instant SMS Alerts</h4>
                    <p className="text-muted-foreground font-light leading-relaxed">Get a text message the moment someone leaves a review. Catch 1-star issues while the customer is still in the building.</p>
                  </div>
                </div>

                <div className="flex max-w-md">
                  <div className="mr-4 mt-1">
                    <LayoutDashboard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-1">Centralized Dashboard</h4>
                    <p className="text-muted-foreground font-light leading-relaxed">Manage Google, Yelp, and Facebook from one single place instead of constantly checking three different apps.</p>
                  </div>
                </div>
              </div>

              <Link href="#pricing">
                <Button variant="outline" className="mt-12 text-foreground bg-muted hover:bg-accent rounded-md px-6 py-6 font-medium">
                  See Pricing <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Right Side (Beige with mockup) */}
            <div className="w-full md:w-1/2 bg-muted p-8 md:p-16 flex items-center justify-center min-h-[500px]">
              <div className="bg-card p-6 rounded-lg w-full max-w-md border border-border">
                <div className="w-full h-48 rounded-lg mb-6 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=300&fit=crop&q=80"
                    alt="Local business storefront"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute bottom-3 left-3 bg-card px-4 py-2 rounded-full border border-border text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" /> Ping: 12:45 PM
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-primary/20 rounded-lg bg-primary/10 flex gap-4 items-center">
                    <div className="h-10 w-10 bg-primary/20 rounded-md flex items-center justify-center shrink-0">
                      <span className="font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-foreground">Your Business</h5>
                      <div className="flex text-primary text-xs mt-1">
                        ★★★★★ 4.8
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border border-border rounded-lg bg-muted flex gap-4 items-center opacity-60">
                    <div className="h-10 w-10 bg-border rounded-md flex items-center justify-center shrink-0">
                      <span className="font-bold text-muted-foreground">2</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-foreground">Competitor A</h5>
                      <div className="flex text-muted-foreground text-xs mt-1">
                        ★★★★☆ 3.8
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. FEATURE 2: 50/50 Split Container (Reversed) */}
      <section className="w-full px-4 mb-24">
        <div className="container mx-auto max-w-[1400px]">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="bg-card rounded-[2rem] border border-border overflow-hidden flex flex-col md:flex-row-reverse"
          >
            {/* Right Side (White Content) */}
            <div className="w-full md:w-1/2 p-12 md:p-16 lg:p-20">
              <div className="flex items-center gap-2 text-primary font-semibold mb-8">
                <Star className="h-5 w-5" /> Automated Reputation
              </div>

              <h3 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-foreground mb-12 leading-tight">
                Automate your review <br /> collection process
              </h3>

              <div className="space-y-8">
                <div className="flex max-w-md">
                  <div className="mr-4 mt-1">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-1">AI-Powered Replies</h4>
                    <p className="text-muted-foreground font-light leading-relaxed">Instantly generate professional, empathetic, or friendly replies in your brand's voice with a single click.</p>
                  </div>
                </div>

                <div className="flex max-w-md">
                  <div className="mr-4 mt-1">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-1">Auto-Request Reviews</h4>
                    <p className="text-muted-foreground font-light leading-relaxed">Automatically send SMS or email campaigns to recent customers asking for reviews via email, SMS, or shareable links.</p>
                  </div>
                </div>
              </div>

              <Link href="#pricing">
                <Button variant="outline" className="mt-12 text-foreground bg-muted hover:bg-accent rounded-md px-6 py-6 font-medium">
                  See Pricing <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Left Side (Beige with mockup) */}
            <div className="w-full md:w-1/2 bg-muted p-8 md:p-16 flex items-center justify-center min-h-[500px]">
              <div className="bg-card p-6 rounded-lg w-full max-w-md border border-border">
                {/* Fake AI Reply UI */}
                <div className="flex gap-4 mb-6 pb-6 border-b border-border">
                  <div className="w-12 h-12 rounded-full shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80" alt="Customer" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="h-4 w-24 bg-border rounded-full mb-2"></div>
                    <div className="flex gap-1 text-chart-4 mb-2">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <p className="text-sm text-muted-foreground">"This place was amazing! Definitely coming back."</p>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-primary text-sm relative">
                  <div className="absolute -top-3 right-4 bg-primary text-primary-foreground text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" /> AI Generated
                  </div>
                  "Thank you so much! We are thrilled to hear you enjoyed your visit and look forward to welcoming you back soon."
                </div>

                <div className="mt-6 flex gap-3">
                  <Button className="w-full rounded-md">Publish to Google</Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

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
            {/* Step 1 */}
            <motion.div variants={fadeInUp} className="flex flex-col items-center text-center px-4">
              <div className="h-20 w-20 bg-primary text-primary-foreground rounded-md border border-primary flex items-center justify-center mb-8 text-3xl font-bold z-10">
                1
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Connect</h3>
              <p className="text-muted-foreground text-lg leading-relaxed font-light">
                Securely connect your Google Business Profile through Google&apos;s official authorization. We request only the permissions needed to read and help you respond to reviews.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={fadeInUp} className="flex flex-col items-center text-center px-4">
              <div className="h-20 w-20 bg-primary text-primary-foreground rounded-md border border-primary flex items-center justify-center mb-8 text-3xl font-bold z-10">
                2
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Get Alerted</h3>
              <p className="text-muted-foreground text-lg leading-relaxed font-light">
                Instant SMS when reviews arrive. Our AI analyzes sentiment and flags urgency.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={fadeInUp} className="flex flex-col items-center text-center px-4">
              <div className="h-20 w-20 bg-primary text-primary-foreground rounded-md border border-primary flex items-center justify-center mb-8 text-3xl font-bold z-10">
                3
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Reply & Grow</h3>
              <p className="text-muted-foreground text-lg leading-relaxed font-light">
                One-tap AI replies. Ask customers for reviews via email, SMS, or shareable links.
              </p>
            </motion.div>
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
            {/* Testimonial 1 */}
            <motion.div variants={fadeInUp} className="bg-muted border border-border p-8 rounded-lg relative">
              <div className="flex gap-1 text-chart-4 mb-6">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-lg text-muted-foreground mb-8 font-light leading-relaxed">
                "We were stuck at 4.1 stars for nearly two years. Since switching to Zyene, we've jumped to 4.8 stars and our incoming calls have literally doubled. The AI replies save me 3 hours a week."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80" alt="Michael T." className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Michael T.</h4>
                  <p className="text-sm text-muted-foreground">Owner, Riverfront Dining</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div variants={fadeInUp} className="bg-muted border border-border p-8 rounded-lg relative">
              <div className="flex gap-1 text-chart-4 mb-6">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-lg text-muted-foreground mb-8 font-light leading-relaxed">
                "I was paying $300/mo for Birdeye. Zyene does exactly the same thing but the interface is actually modern and the AI response generator is much better. No brainer switch."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80" alt="Sarah Jenkins" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Sarah Jenkins</h4>
                  <p className="text-sm text-muted-foreground">Director, Apex Dental Care</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div variants={fadeInUp} className="bg-muted border border-border p-8 rounded-lg relative">
              <div className="flex gap-1 text-chart-4 mb-6">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-lg text-muted-foreground mb-8 font-light leading-relaxed">
                "The feedback collection feature alone is worth it. We heard from a concerned customer directly, resolved their issue quickly, and they updated their review to 5 stars. Incredible."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80" alt="David Chen" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">David Chen</h4>
                  <p className="text-sm text-muted-foreground">Manager, Chen Auto Repair</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 5.6 COMPARISON TABLE */}
      <section className="w-full py-24 px-4 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4">Why we win</h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="bg-card rounded-lg border border-border overflow-hidden">
            {/* Table code */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-6 font-semibold text-muted-foreground border-b border-r border-border w-1/3">Features</th>
                    <th className="p-6 font-bold text-xl text-primary border-b border-r border-border bg-primary/10 w-1/3">Zyene Reviews</th>
                    <th className="p-6 font-semibold text-muted-foreground border-b border-border w-1/3">Expensive Competitors</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "AI Review Replies", zyene: true, comp: "Upcharge" },
                    { feature: "Customer Feedback Collection", zyene: true, comp: true },
                    { feature: "Automated SMS Campaigns", zyene: true, comp: true },
                    { feature: "Custom Branded Review Pages", zyene: true, comp: false },
                    { feature: "Embeddable Website Widgets", zyene: true, comp: true },
                    { feature: "Starting Price", zyene: "$29.99/mo", comp: "$299/mo+" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="p-6 text-foreground font-medium border-r border-border">{row.feature}</td>
                      <td className="p-6 border-r border-border bg-primary/5">
                        {typeof row.zyene === 'boolean'
                          ? (row.zyene ? <CheckCircle2 className="text-primary w-6 h-6" /> : <AlertCircle className="text-muted-foreground w-6 h-6" />)
                          : <span className="font-bold text-foreground">{row.zyene}</span>
                        }
                      </td>
                      <td className="p-6">
                        {typeof row.comp === 'boolean'
                          ? (row.comp ? <CheckCircle2 className="text-primary w-6 h-6" /> : <AlertCircle className="text-muted-foreground w-6 h-6" />)
                          : <span className="text-muted-foreground">{row.comp}</span>
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

      {/* 6. PRICING SECTION */}
      <section id="pricing" className="w-full py-24 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground font-light">
              Start with a 7-day free trial. Cancel before the trial ends and you won&apos;t be charged.
            </p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {/* Starter */}
            <motion.div variants={fadeInUp} className="bg-card border border-border rounded-lg p-8 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Starter</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Perfect for single-location businesses</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-lg line-through text-muted-foreground">$49.99</span>
                <span className="text-4xl font-bold text-foreground">$29.99</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <p className="text-sm text-primary font-medium mb-6">7-day free trial — cancel anytime, no charge</p>
              <ul className="space-y-3 text-sm text-muted-foreground flex-1 mb-8">
                {["1 business location", "Google Business Profile, Facebook, and Yelp review sync", "500 email review requests / month", "500 SMS review requests / month", "1,500 AI-generated review draft requests / month", "1,500 AI reply suggestions / month + Auto commenter", "Competitor tracking", "Dashboard, analytics & team alerts", "Zapier, API, and POS automation triggers", "Developer API", "Up to 5 team members"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/signup" : `https://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/signup`}>
                <Button className="w-full rounded-md py-6 font-medium">
                  Start 7-day free trial
                </Button>
              </Link>
            </motion.div>

            {/* Professional */}
            <motion.div variants={fadeInUp} className="bg-[color:var(--marketing-footer-bg)] text-[color:var(--marketing-footer-fg)] border-2 border-primary rounded-lg p-8 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Professional</h3>
              </div>
              <p className="text-sm text-[color:var(--marketing-footer-muted)] mb-6">For growing multi-location businesses</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-lg line-through text-[color:var(--marketing-footer-muted)]">$89.99</span>
                <span className="text-4xl font-bold">$59.99</span>
                <span className="text-[color:var(--marketing-footer-muted)]">/mo</span>
              </div>
              <p className="text-sm text-primary font-medium mb-6">7-day free trial — cancel anytime, no charge</p>
              <ul className="space-y-3 text-sm text-[color:var(--marketing-footer-list)] flex-1 mb-8">
                {["Everything in Starter, plus:", "Up to 3 business locations (limits scale per location)", "700 email + 700 SMS review requests / month per location", "2,000 AI reply suggestions / month per location", "Priority customer support", "Up to 15 team members"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/signup" : `https://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/signup`}>
                <Button className="w-full rounded-md py-6 font-medium">
                  Start 7-day free trial
                </Button>
              </Link>
            </motion.div>

            {/* Enterprise */}
            <motion.div variants={fadeInUp} className="bg-card border border-border rounded-lg p-8 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Enterprise</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">For large organizations with custom needs.</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-foreground">Custom</span>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground flex-1 mb-8">
                {["Everything in Professional, plus:", "Unlimited business locations", "Unlimited email, SMS & link requests", "Unlimited AI / smart replies (contract terms)", "Managed API keys and integration support", "Embeddable and white-label review widgets", "Priority sync pipelines and proactive monitoring", "Dedicated account manager", "Custom integrations & SSO (as agreed)", "Uptime SLA & security review options"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="mailto:sales@zyenereviews.com?subject=Interested%20in%20Zyene%20Enterprise">
                <Button variant="outline" className="w-full rounded-md py-6 font-medium">
                  Contact Sales
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="w-full py-24 px-4 bg-muted">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="bg-card rounded-lg p-8 border border-border"
          >
            <FAQItem
              question="How does the 7-day free trial work?"
              answer="Sign up for Starter or Professional and get full access to every feature for 7 days. Cancel before the trial ends and you won't be charged. No hidden fees, no annual contracts — cancel anytime from your billing settings."
            />
            <FAQItem
              question="How do review requests work?"
              answer="You can send review requests via email, SMS, or a shareable link. Each request directs your customer to your custom review page where they can leave feedback or be guided to Google/Yelp/Facebook."
            />
            <FAQItem
              question="Does Zyene post AI replies directly to Google?"
              answer="Zyene generates AI-powered reply suggestions in one click. You can review, edit, and copy them to post on Google — keeping you in full control of your responses."
            />
            <FAQItem
              question="Can I manage multiple locations?"
              answer="Yes! The Professional plan supports up to 3 locations with independent limits per location. Enterprise plans offer unlimited locations."
            />
            <FAQItem
              question="What happens to negative feedback?"
              answer="Customers who rate their experience 4–5 stars are guided to leave a public review on Google. Customers who rate 1–3 stars are directed to a private feedback form so you can resolve the issue before it goes public. You're notified instantly either way. This is the Negative Feedback Shield — it's included on every paid plan."
            />
            <FAQItem
              question="Can I cancel anytime?"
              answer="Absolutely. You can cancel your subscription anytime from your billing settings. No contracts, no hidden fees."
            />
          </motion.div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="w-full py-32 px-4 bg-muted">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
          className="container mx-auto max-w-5xl bg-[color:var(--marketing-footer-bg)] rounded-[2rem] p-12 md:p-20 text-center text-[color:var(--marketing-footer-fg)] relative overflow-hidden border border-border"
        >
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-primary opacity-20 rounded-full blur-3xl"></div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-8 relative z-10 leading-tight">
            Ready to grow your business?
          </h2>
          <p className="text-[color:var(--marketing-footer-muted)] text-xl mb-12 max-w-2xl mx-auto font-light relative z-10">
            Join local businesses who are managing their reputation and saving time every day.
          </p>
          <div className="flex items-center justify-center relative z-10">
            <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/signup" : `https://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/signup`}>
              <Button size="lg" className="text-[1.1rem] px-10 py-7 rounded-md font-medium transition-all">
                Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
