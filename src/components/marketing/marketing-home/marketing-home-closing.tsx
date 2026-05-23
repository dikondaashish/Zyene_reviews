"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import {
    TestimonialGrid,
    LiveWidgetPreview,
    ThirdPartyTrustRow,
} from "@/components/marketing/social-proof";
import { NewsletterSignup } from "@/components/marketing/newsletter-signup";
import { SIGNUP_URL } from "@/config/env";
import { MarketingHomeFaqItem } from "@/components/marketing/marketing-home/marketing-home-faq-item";

import type { MarketingHomeMotionProps } from "@/components/marketing/marketing-home/marketing-home-motion-props";

export function MarketingHomeClosing({ fadeInUp }: MarketingHomeMotionProps) {
    return (
        <>
      <TestimonialGrid limit={3} />

      <LiveWidgetPreview />

      <ThirdPartyTrustRow />

      <section className="w-full py-16 px-4 bg-muted border-t border-border">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Zyene Reviews Monthly</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Product updates, Google review tips, and case studies — once a month.
          </p>
          <NewsletterSignup source="homepage" />
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
            <MarketingHomeFaqItem
              question="How does the 7-day free trial work?"
              answer="Sign up for Starter or Professional and get full access to every feature for 7 days. Cancel before the trial ends and you won't be charged. No hidden fees, no annual contracts — cancel anytime from your billing settings."
            />
            <MarketingHomeFaqItem
              question="How do review requests work?"
              answer="You can send review requests via email, SMS, or a shareable link. Each request directs your customer to your custom review page where they can leave feedback or be guided to Google, Yelp, or Facebook."
            />
            <MarketingHomeFaqItem
              question="Does Zyene post AI replies directly to Google?"
              answer="Zyene generates AI-powered reply suggestions in one click. You can review, edit, and post them to Google — keeping you in full control of your responses. The Auto commenter feature can post replies automatically on your behalf."
            />
            <MarketingHomeFaqItem
              question="Can I manage multiple locations?"
              answer="Yes. The Professional plan supports up to 3 locations with independent limits per location. Enterprise plans offer unlimited locations."
            />
            <MarketingHomeFaqItem
              question="What happens to negative feedback?"
              answer="Customers who rate their experience 4–5 stars are guided to leave a public review on Google. Customers who rate 1–3 stars are directed to a private feedback form so you can resolve the issue before it goes public. You're notified instantly either way. This is the Negative Feedback Shield — included on every paid plan."
            />
            <MarketingHomeFaqItem
              question="Can I cancel anytime?"
              answer="Absolutely. You can cancel your subscription anytime from your billing settings. No contracts, no hidden fees, no questions asked."
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
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary opacity-20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-primary opacity-20 rounded-full blur-3xl" />

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-8 relative z-10 leading-tight">
            Ready to grow your business?
          </h2>
          <p className="text-[color:var(--marketing-footer-muted)] text-xl mb-12 max-w-2xl mx-auto font-light relative z-10">
            Join local businesses who are managing their reputation and growing their Google ratings every day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link href={SIGNUP_URL}>
              <Button size="lg" className="text-[1.1rem] px-10 py-7 rounded-md font-medium transition-all">
                Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="mailto:sales@zyenereviews.com?subject=Enterprise%20Inquiry" className="text-[color:var(--marketing-footer-muted)] hover:text-[color:var(--marketing-footer-fg)] text-sm font-medium transition-colors">
              Talk to sales →
            </a>
          </div>
        </motion.div>
      </section>
        </>
    );
}
