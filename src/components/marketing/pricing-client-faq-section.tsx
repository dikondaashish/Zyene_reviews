"use client";

import { PRICING_FAQS } from "./pricing-client-constants";
import { PricingClientFaqItem } from "./pricing-client-faq-item";

export function PricingClientFaqSection() {
    return (
        <section className="py-20 px-4 bg-muted border-t border-border">
            <div className="container mx-auto max-w-3xl">
                <h2 className="text-3xl font-bold text-foreground mb-2 text-center">Frequently Asked Questions</h2>
                <p className="text-muted-foreground text-center mb-10">Everything you need to know before signing up.</p>
                <div className="bg-card rounded-xl border border-border p-8">
                    {PRICING_FAQS.map((faq) => (
                        <PricingClientFaqItem key={faq.question} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>
        </section>
    );
}
