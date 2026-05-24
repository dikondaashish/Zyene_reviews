import { PricingClientFaqItem } from "@/components/marketing/pricing-client-faq-item";
import type { BlogFaq } from "@/lib/phase4/blog-types";

export function BlogSlugFaqSection({ faqs }: { faqs: BlogFaq[] }) {
    if (faqs.length === 0) return null;

    return (
        <section className="mt-12 pt-8 border-t border-border" aria-labelledby="blog-faq-heading">
            <h2 id="blog-faq-heading" className="text-2xl font-bold text-foreground mb-6">
                Frequently asked questions
            </h2>
            <div className="space-y-3">
                {faqs.map((faq) => (
                    <PricingClientFaqItem key={faq.question} question={faq.question} answer={faq.answer} />
                ))}
            </div>
        </section>
    );
}
