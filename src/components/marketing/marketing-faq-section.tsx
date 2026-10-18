import { PricingClientFaqItem } from "@/components/marketing/pricing-client-faq-item";
import type { FaqItem } from "@/components/seo/json-ld";

/** FAQ in the homepage layout: heading on the left, hairline accordion on the right. */
export function MarketingFaqSection({
    faqs,
    headingId = "marketing-faq-heading",
    title = "Frequently asked questions",
    lede,
}: {
    faqs: FaqItem[];
    headingId?: string;
    title?: string;
    lede?: string;
}) {
    if (faqs.length === 0) return null;

    return (
        <section className="marketing-section" aria-labelledby={headingId}>
            <div className="marketing-container home-faq-grid">
                <div className="mi-head">
                    <h2 id={headingId}>{title}</h2>
                    {lede && <p>{lede}</p>}
                </div>
                <div className="home-faq-list">
                    {faqs.map((faq) => (
                        <PricingClientFaqItem key={faq.question} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>
        </section>
    );
}
