import { PricingClientFaqItem } from "@/components/marketing/pricing-client-faq-item";
import { SMALL_BUSINESS_FAQS } from "@/lib/marketing/small-business-faqs";

export function SmallBusinessFaqSection() {
    return (
        <section className="py-20 px-4 bg-background border-b border-border">
            <div className="container mx-auto max-w-3xl">
                <h2 className="text-[length:var(--fs-h2)] font-semibold mb-8 text-center">Small business review management FAQ</h2>
                <div className="bg-card rounded-xl border border-border px-8">
                    {SMALL_BUSINESS_FAQS.map((faq) => (
                        <PricingClientFaqItem key={faq.question} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>
        </section>
    );
}
