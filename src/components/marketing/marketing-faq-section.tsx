import { PricingClientFaqItem } from "@/components/marketing/pricing-client-faq-item";
import type { FaqItem } from "@/components/seo/json-ld";

export function MarketingFaqSection({
    faqs,
    headingId = "marketing-faq-heading",
}: {
    faqs: FaqItem[];
    headingId?: string;
}) {
    if (faqs.length === 0) return null;

    return (
        <section className="py-16 px-4 bg-muted/30 border-t border-border" aria-labelledby={headingId}>
            <div className="container mx-auto max-w-3xl">
                <h2 id={headingId} className="text-2xl font-bold text-foreground mb-6">
                    Frequently asked questions
                </h2>
                <div className="space-y-3">
                    {faqs.map((faq) => (
                        <PricingClientFaqItem key={faq.question} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>
        </section>
    );
}
