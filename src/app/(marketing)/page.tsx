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
import { useState } from "react";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-5 text-left"
      >
        <span className="text-lg font-medium text-[#262626]">{question}</span>
        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <p className="pb-5 text-slate-600 leading-relaxed">{answer}</p>
      )}
    </div>
  );
}
import { motion, Variants } from "framer-motion";

export default function MarketingPage() {
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full bg-[#f5f5f4] text-[#262626] overflow-hidden font-sans pt-20">

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
                className="text-5xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tighter text-[#262626] mb-8 leading-[1.05]"
              >
                Know about every review in 15 minutes
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed font-light"
              >
                Zyene powers more than <span className="font-bold">1,000</span> businesses with
                the <span className="font-bold text-slate-900">#1 review management platform</span> —
                helping local owners win more trust, and thrive in a digital-first world.
              </motion.p>
              <motion.div variants={fadeInUp}>
                <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/signup" : `https://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/signup`}>
                  <Button size="lg" className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg px-8 py-7 text-[1.1rem] font-medium transition-all">
                    Start Your 7-Day Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Visual (SpotHopper Petal Shape) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full lg:w-[50%] relative"
            >
              {/* Petal Container */}
              <div className="relative aspect-[4/3] w-full bg-slate-800 rounded-tl-[4rem] rounded-bl-[4rem] rounded-br-[4rem] rounded-tr-lg overflow-hidden shadow-2xl flex items-center justify-center p-8">
                {/* Abstract Background for Hero instead of photo */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 mix-blend-multiply opacity-80" />
                <div className="relative z-10 w-full h-full flex flex-col justify-between opacity-30">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/50"></div>
                    <div className="w-3 h-3 rounded-full bg-white/50"></div>
                    <div className="w-3 h-3 rounded-full bg-white/50"></div>
                  </div>
                  <div className="space-y-4 w-full">
                    <div className="h-4 bg-white/40 rounded-full w-3/4"></div>
                    <div className="h-4 bg-white/40 rounded-full w-full"></div>
                    <div className="h-4 bg-white/40 rounded-full w-5/6"></div>
                  </div>
                  <div className="h-1/2 w-full flex items-end justify-between gap-3">
                    <div className="w-1/5 bg-white/30 rounded-t-lg h-full"></div>
                    <div className="w-1/5 bg-white/30 rounded-t-lg h-2/3"></div>
                    <div className="w-1/5 bg-white/30 rounded-t-lg h-5/6"></div>
                    <div className="w-1/5 bg-white/30 rounded-t-lg h-1/3"></div>
                    <div className="w-1/5 bg-white/30 rounded-t-lg h-3/4"></div>
                  </div>
                </div>
              </div>

              {/* Floating Overlap Card (SpotHopper Style) */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -bottom-8 -left-8 md:bottom-12 md:-left-16 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 max-w-[320px] w-[90%]"
              >
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                  <div className="h-8 w-8 rounded-full bg-orange-50 text-[#f97316] flex items-center justify-center">
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <h3 className="font-semibold text-[#262626]">Real-time Review Alerts</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                      <span className="text-sm font-medium text-slate-600">John Doe</span>
                    </div>
                    <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 5-Star Left
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                      <span className="text-sm font-medium text-slate-600">Sarah Smith</span>
                    </div>
                    <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1">
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
      <section className="w-full py-10 px-4 border-y border-slate-200/60 bg-white/50">
        <div className="container mx-auto max-w-[1200px]">
          <p className="text-center text-xs text-slate-400 font-bold mb-8 tracking-widest uppercase">
            Trusted deeply by local heroes
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-300">
            <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter"><ShieldCheck className="w-8 h-8" /> GDPR Ready</div>
            <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter"><Star className="fill-current w-8 h-8" /> 5.0 Capterra</div>
            <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter"><Zap className="w-8 h-8" /> Faster</div>
            <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter"><Lock className="w-8 h-8" /> SOC2</div>
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
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-medium tracking-tight text-[#262626] leading-tight">
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
            className="bg-white rounded-[2rem] border border-black/5 overflow-hidden flex flex-col md:flex-row shadow-sm"
          >
            {/* Left Side (White) */}
            <div className="w-full md:w-1/2 p-12 md:p-16 lg:p-20">
              <div className="flex items-center gap-2 text-orange-600 font-semibold mb-8">
                <Zap className="h-5 w-5" /> Effortless Monitoring
              </div>

              <h3 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-[#262626] mb-12 leading-tight">
                Never get blindsided by a <br /> bad review again
              </h3>

              <div className="space-y-8">
                <div className="flex max-w-md">
                  <div className="mr-4 mt-1">
                    <MessageSquare className="h-6 w-6 text-[#f97316]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#262626] mb-1">Instant SMS Alerts</h4>
                    <p className="text-slate-500 font-light leading-relaxed">Get a text message the moment someone leaves a review. Catch 1-star issues while the customer is still in the building.</p>
                  </div>
                </div>

                <div className="flex max-w-md">
                  <div className="mr-4 mt-1">
                    <LayoutDashboard className="h-6 w-6 text-[#f97316]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#262626] mb-1">Centralized Dashboard</h4>
                    <p className="text-slate-500 font-light leading-relaxed">Manage Google, Yelp, and Facebook from one single place instead of constantly checking three different apps.</p>
                  </div>
                </div>
              </div>

              <Link href="#pricing">
                <Button variant="outline" className="mt-12 text-[#262626] border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg px-6 py-6 font-medium">
                  See Pricing <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Right Side (Beige with mockup) */}
            <div className="w-full md:w-1/2 bg-[#f3f4f6] p-8 md:p-16 flex items-center justify-center min-h-[500px]">
              <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-md border border-black/5">
                {/* Fake Map / Dashboard UI */}
                <div className="w-full h-48 bg-slate-100 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1 opacity-10">
                    {Array.from({ length: 16 }).map((_, i) => <div key={i} className="bg-slate-400"></div>)}
                  </div>
                  <div className="relative bg-white px-4 py-2 rounded-full shadow-md text-sm font-semibold flex items-center gap-2 text-slate-700">
                    <Clock className="w-4 h-4 text-orange-500" /> Ping: 12:45 PM
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-orange-100 rounded-2xl bg-orange-50/50 flex gap-4 items-center">
                    <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="font-bold text-orange-600">1</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-[#262626]">Your Business</h5>
                      <div className="flex text-orange-500 text-xs mt-1">
                        ★★★★★ 4.8
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 flex gap-4 items-center opacity-60">
                    <div className="h-10 w-10 bg-slate-200 rounded-lg flex items-center justify-center shrink-0">
                      <span className="font-bold text-slate-500">2</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-[#262626]">Competitor A</h5>
                      <div className="flex text-slate-400 text-xs mt-1">
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
            className="bg-white rounded-[2rem] border border-black/5 overflow-hidden flex flex-col md:flex-row-reverse shadow-sm"
          >
            {/* Right Side (White Content) */}
            <div className="w-full md:w-1/2 p-12 md:p-16 lg:p-20">
              <div className="flex items-center gap-2 text-orange-600 font-semibold mb-8">
                <Star className="h-5 w-5" /> Automated Reputation
              </div>

              <h3 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-[#262626] mb-12 leading-tight">
                Turn happy customers into <br /> your best marketers
              </h3>

              <div className="space-y-8">
                <div className="flex max-w-md">
                  <div className="mr-4 mt-1">
                    <ShieldCheck className="h-6 w-6 text-[#f97316]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#262626] mb-1">AI-Powered Replies</h4>
                    <p className="text-slate-500 font-light leading-relaxed">Instantly generate professional, empathetic, or friendly replies in your brand's voice with a single click.</p>
                  </div>
                </div>

                <div className="flex max-w-md">
                  <div className="mr-4 mt-1">
                    <Smartphone className="h-6 w-6 text-[#f97316]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#262626] mb-1">Auto-Request Reviews</h4>
                    <p className="text-slate-500 font-light leading-relaxed">Automatically send SMS or email campaigns to recent customers asking for reviews on autopilot.</p>
                  </div>
                </div>
              </div>

              <Link href="#pricing">
                <Button variant="outline" className="mt-12 text-[#262626] border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg px-6 py-6 font-medium">
                  See Pricing <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Left Side (Beige with mockup) */}
            <div className="w-full md:w-1/2 bg-[#f3f4f6] p-8 md:p-16 flex items-center justify-center min-h-[500px]">
              <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-md border border-black/5">
                {/* Fake AI Reply UI */}
                <div className="flex gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0"></div>
                  <div>
                    <div className="h-4 w-24 bg-slate-200 rounded-full mb-2"></div>
                    <div className="flex gap-1 text-yellow-400 mb-2">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <p className="text-sm text-slate-500">"This place was amazing! Definitely coming back."</p>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-[#ea580c] text-sm relative">
                  <div className="absolute -top-3 right-4 bg-orange-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" /> AI Generated
                  </div>
                  "Thank you so much! We are thrilled to hear you enjoyed your visit and look forward to welcoming you back soon."
                </div>

                <div className="mt-6 flex gap-3">
                  <Button className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg">Publish to Google</Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="w-full py-24 px-4 bg-[#f3f4f6]">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-[#262626] mb-6">
              How it Works
            </h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid md:grid-cols-3 gap-12 relative max-w-5xl mx-auto"
          >
            {/* Step 1 */}
            <motion.div variants={fadeInUp} className="flex flex-col items-center text-center px-4">
              <div className="h-20 w-20 bg-[#f97316] text-white rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-orange-600/20 text-3xl font-bold z-10">
                1
              </div>
              <h3 className="text-2xl font-semibold text-[#262626] mb-4">Connect</h3>
              <p className="text-slate-600 text-lg leading-relaxed font-light">
                One click to link your Google Business Profile. We sync your data in seconds.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={fadeInUp} className="flex flex-col items-center text-center px-4">
              <div className="h-20 w-20 bg-[#f97316] text-white rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-orange-600/20 text-3xl font-bold z-10">
                2
              </div>
              <h3 className="text-2xl font-semibold text-[#262626] mb-4">Get Alerted</h3>
              <p className="text-slate-600 text-lg leading-relaxed font-light">
                Instant SMS when reviews arrive. Our AI analyzes sentiment and flags urgency.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={fadeInUp} className="flex flex-col items-center text-center px-4">
              <div className="h-20 w-20 bg-[#f97316] text-white rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-orange-600/20 text-3xl font-bold z-10">
                3
              </div>
              <h3 className="text-2xl font-semibold text-[#262626] mb-4">Reply & Grow</h3>
              <p className="text-slate-600 text-lg leading-relaxed font-light">
                One-tap AI replies. Ask happy customers for reviews on autopilot.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 5.5 TESTIMONIALS */}
      <section className="w-full py-24 px-4 bg-white border-b border-slate-100">
        <div className="container mx-auto max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="text-center mb-16">
            <p className="text-orange-600 font-semibold mb-3 tracking-wide uppercase text-sm">Customer Stories</p>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-[#262626] mb-4">Loved by local business owners</h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <motion.div variants={fadeInUp} className="bg-slate-50 border border-slate-100 p-8 rounded-3xl relative">
              <div className="flex gap-1 text-yellow-500 mb-6">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-lg text-slate-700 mb-8 font-light leading-relaxed">
                "We were stuck at 4.1 stars for nearly two years. Since switching to Zyene, we've jumped to 4.8 stars and our incoming calls have literally doubled. The AI replies save me 3 hours a week."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-300"></div>
                <div>
                  <h4 className="font-semibold text-[#262626]">Michael T.</h4>
                  <p className="text-sm text-slate-500">Owner, Riverfront Dining</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div variants={fadeInUp} className="bg-slate-50 border border-slate-100 p-8 rounded-3xl relative">
              <div className="flex gap-1 text-yellow-500 mb-6">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-lg text-slate-700 mb-8 font-light leading-relaxed">
                "I was paying $300/mo for Birdeye. Zyene does exactly the same thing but the interface is actually modern and the AI response generator is much better. No brainer switch."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-300"></div>
                <div>
                  <h4 className="font-semibold text-[#262626]">Sarah Jenkins</h4>
                  <p className="text-sm text-slate-500">Director, Apex Dental Care</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div variants={fadeInUp} className="bg-slate-50 border border-slate-100 p-8 rounded-3xl relative">
              <div className="flex gap-1 text-yellow-500 mb-6">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-lg text-slate-700 mb-8 font-light leading-relaxed">
                "The private feedback feature alone is worth it. We caught a furious customer's complaint privately, resolved it, and they went on to leave a 5-star review instead. Incredible."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-300"></div>
                <div>
                  <h4 className="font-semibold text-[#262626]">David Chen</h4>
                  <p className="text-sm text-slate-500">Manager, Chen Auto Repair</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 5.6 COMPARISON TABLE */}
      <section className="w-full py-24 px-4 bg-[#fafaf9]">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-[#262626] mb-4">Why we win</h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Table code */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-6 font-semibold text-slate-600 border-b border-r w-1/3">Features</th>
                    <th className="p-6 font-bold text-xl text-orange-600 border-b border-r bg-orange-50/30 w-1/3">Zyene Reviews</th>
                    <th className="p-6 font-semibold text-slate-500 border-b w-1/3">Expensive Competitors</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "AI Review Replies", zyene: true, comp: "Upcharge" },
                    { feature: "Private Negative Feedback", zyene: true, comp: true },
                    { feature: "Automated SMS Campaigns", zyene: true, comp: true },
                    { feature: "Custom Branded Review Pages", zyene: true, comp: false },
                    { feature: "Embeddable Website Widgets", zyene: true, comp: true },
                    { feature: "Starting Price", zyene: "$29.99/mo", comp: "$299/mo+" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-slate-50/50">
                      <td className="p-6 text-slate-700 font-medium border-r">{row.feature}</td>
                      <td className="p-6 border-r bg-orange-50/10">
                        {typeof row.zyene === 'boolean'
                          ? (row.zyene ? <CheckCircle2 className="text-green-500 w-6 h-6" /> : <AlertCircle className="text-slate-300 w-6 h-6" />)
                          : <span className="font-bold text-[#262626]">{row.zyene}</span>
                        }
                      </td>
                      <td className="p-6">
                        {typeof row.comp === 'boolean'
                          ? (row.comp ? <CheckCircle2 className="text-green-500 w-6 h-6" /> : <AlertCircle className="text-slate-300 w-6 h-6" />)
                          : <span className="text-slate-500">{row.comp}</span>
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
      <section id="pricing" className="w-full py-24 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-[#262626] mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-500 font-light">
              Start with a 7-day free trial. No credit card required.
            </p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {/* Starter */}
            <motion.div variants={fadeInUp} className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-orange-500" />
                <h3 className="text-xl font-semibold text-[#262626]">Starter</h3>
              </div>
              <p className="text-sm text-slate-500 mb-6">Perfect for single-location businesses</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-lg line-through text-gray-400">$49.99</span>
                <span className="text-4xl font-bold text-[#262626]">$29.99</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <p className="text-sm text-green-600 font-medium mb-6">7-day free trial included</p>
              <ul className="space-y-3 text-sm text-slate-600 flex-1 mb-8">
                {["Easy to use dashboard", "SEO optimized AI reviews", "1 Location", "2,500 email requests/month", "2,500 SMS requests/month", "5,000 review link requests/month", "Campaign automation", "Customizable review page", "Private feedback capture", "Google, Yelp, Facebook integration", "AI-powered replies"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/signup" : `https://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/signup`}>
                <Button className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg py-6 font-medium">
                  Start Free Trial
                </Button>
              </Link>
            </motion.div>

            {/* Professional */}
            <motion.div variants={fadeInUp} className="bg-[#262626] text-white border-2 border-orange-500 rounded-2xl p-8 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-orange-400" />
                <h3 className="text-xl font-semibold">Professional</h3>
              </div>
              <p className="text-sm text-slate-400 mb-6">For growing multi-location businesses</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-lg line-through text-gray-500">$89.99</span>
                <span className="text-4xl font-bold">$59.99</span>
                <span className="text-slate-400">/mo</span>
              </div>
              <p className="text-sm text-green-400 font-medium mb-6">7-day free trial included</p>
              <ul className="space-y-3 text-sm text-slate-300 flex-1 mb-8">
                {["Everything in Starter, plus:", "3 Locations", "3,000 email requests/month per location", "3,000 SMS requests/month per location", "6,000 review link requests/month per location", "Priority support"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/signup" : `https://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/signup`}>
                <Button className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg py-6 font-medium">
                  Start Free Trial
                </Button>
              </Link>
            </motion.div>

            {/* Enterprise */}
            <motion.div variants={fadeInUp} className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-5 w-5 text-orange-500" />
                <h3 className="text-xl font-semibold text-[#262626]">Enterprise</h3>
              </div>
              <p className="text-sm text-slate-500 mb-6">For franchises & large organizations</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-[#262626]">Custom</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 flex-1 mb-8">
                {["Everything in Professional, plus:", "Unlimited locations", "Custom request limits", "Dedicated account manager", "Custom integrations", "SLA guarantee", "White-label options"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="mailto:sales@zyenereviews.com?subject=Interested%20in%20Zyene%20Enterprise">
                <Button variant="outline" className="w-full rounded-lg py-6 font-medium">
                  Contact Sales
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="w-full py-24 px-4 bg-[#f3f4f6]">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-[#262626] mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100"
          >
            <FAQItem
              question="How does the 7-day free trial work?"
              answer="Sign up with any plan and get full access for 7 days — no credit card required until the trial ends. If you cancel within 7 days, you won't be charged."
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
              question="What happens to negative reviews?"
              answer="Our smart review page captures negative feedback privately — so unhappy customers reach you directly instead of posting a 1-star public review. You get notified instantly."
            />
            <FAQItem
              question="Can I cancel anytime?"
              answer="Absolutely. You can cancel your subscription anytime from your billing settings. No contracts, no hidden fees."
            />
          </motion.div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="w-full py-32 px-4 bg-[#f3f4f6]">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
          className="container mx-auto max-w-5xl bg-[#262626] rounded-[2rem] p-12 md:p-20 text-center text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-orange-600 opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-orange-600 opacity-20 rounded-full blur-3xl"></div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-8 relative z-10 leading-tight">
            Ready to grow your business?
          </h2>
          <p className="text-slate-300 text-xl mb-12 max-w-2xl mx-auto font-light relative z-10">
            Join thousands of local businesses who are automating their reputation and saving time every day.
          </p>
          <div className="flex items-center justify-center relative z-10">
            <Link href={process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes("localhost") ? "/signup" : `https://auth.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/signup`}>
              <Button size="lg" className="bg-[#f97316] hover:bg-[#ea580c] text-white text-[1.1rem] px-10 py-7 rounded-lg font-medium transition-all">
                Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
