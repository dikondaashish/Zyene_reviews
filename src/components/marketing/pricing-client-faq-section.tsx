"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PRICING_FAQS } from "./pricing-client-constants";
import { PricingClientFaqItem } from "./pricing-client-faq-item";

export function PricingClientFaqSection() {
    return (
        <section className="marketing-section home-faq" aria-labelledby="pricing-faq-heading">
            <div className="marketing-container home-faq-grid">
                <div>
                    <p className="marketing-eyebrow">FAQ</p>
                    <h2 id="pricing-faq-heading">Questions about plans.</h2>
                    <p className="home-section-lede">Everything you need to know before signing up.</p>
                    <Link href="/contact" className="home-text-link">
                        Talk to a real person <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                </div>
                <div className="home-faq-list">
                    {PRICING_FAQS.map((faq) => (
                        <PricingClientFaqItem key={faq.question} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>
        </section>
    );
}
