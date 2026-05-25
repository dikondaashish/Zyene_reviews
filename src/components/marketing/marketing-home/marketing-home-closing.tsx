"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { SIGNUP_URL } from "@/config/env";
import { MarketingHomeFaqItem } from "@/components/marketing/marketing-home/marketing-home-faq-item";

import type { MarketingHomeMotionProps } from "@/components/marketing/marketing-home/marketing-home-motion-props";

const STATS = [
    { value: "500+", label: "Businesses" },
    { value: "50k+", label: "Reviews managed" },
    { value: "4.9", label: "Avg rating" },
    { value: "< 15 min", label: "Response time" },
];

export function MarketingHomeClosing({ fadeInUp }: MarketingHomeMotionProps) {
    return (
        <>
            {/* Stats Bar */}
            <section className="w-full py-16 px-4 bg-muted/40 border-y border-border">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="mx-auto max-w-[1200px] grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                >
                    {STATS.map(({ value, label }) => (
                        <div key={label}>
                            <p className="text-4xl md:text-5xl font-bold text-foreground">{value}</p>
                            <p className="text-sm text-muted-foreground uppercase tracking-wide mt-2">{label}</p>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* FAQ */}
            <section className="w-full py-24 md:py-32 px-4">
                <div className="mx-auto max-w-3xl">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
                            Frequently asked questions
                        </h2>
                    </motion.div>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                    >
                        <MarketingHomeFaqItem
                            question="How does the 7-day free trial work?"
                            answer="Sign up for Starter or Professional and get full access to every feature for 7 days. Cancel before the trial ends and you won't be charged."
                        />
                        <MarketingHomeFaqItem
                            question="How do review requests work?"
                            answer="You can send review requests via email, SMS, or a shareable link. Each request directs your customer to your custom review page where they can leave feedback or be guided to Google, Yelp, or Facebook."
                        />
                        <MarketingHomeFaqItem
                            question="Does Zyene post AI replies directly to Google?"
                            answer="Zyene generates AI-powered reply suggestions in one click. You can review, edit, and post them to Google. The Auto commenter feature can post replies automatically on your behalf."
                        />
                        <MarketingHomeFaqItem
                            question="Can I manage multiple locations?"
                            answer="Yes. The Professional plan supports up to 3 locations with independent limits per location. Enterprise plans offer unlimited locations."
                        />
                        <MarketingHomeFaqItem
                            question="What happens to negative feedback?"
                            answer="Customers who rate 4-5 stars are guided to leave a public review. Those who rate 1-3 stars are directed to a private feedback form so you can resolve the issue before it goes public."
                        />
                        <MarketingHomeFaqItem
                            question="Can I cancel anytime?"
                            answer="Yes. Cancel your subscription anytime from your billing settings. No contracts, no hidden fees."
                        />
                    </motion.div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="w-full py-24 md:py-32 px-4 bg-foreground">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="mx-auto max-w-3xl text-center"
                >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-background leading-tight mb-6">
                        Ready to grow your reviews?
                    </h2>
                    <p className="text-lg text-background/70 mb-10 max-w-xl mx-auto">
                        Join local businesses managing their reputation and growing their Google ratings every day.
                    </p>
                    <Link href={SIGNUP_URL}>
                        <Button
                            size="lg"
                            className="rounded-md px-8 py-3 font-medium bg-background text-foreground hover:bg-background/90 transition-colors"
                        >
                            Start Your Free Trial
                        </Button>
                    </Link>
                </motion.div>
            </section>
        </>
    );
}
