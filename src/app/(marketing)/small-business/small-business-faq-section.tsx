import { MarketingFaqSection } from "@/components/marketing/marketing-faq-section";
import { SMALL_BUSINESS_FAQS } from "@/lib/marketing/small-business-faqs";

export function SmallBusinessFaqSection() {
    return (
        <MarketingFaqSection
            faqs={SMALL_BUSINESS_FAQS}
            headingId="small-business-faq-heading"
            title="Small business review management FAQ"
        />
    );
}
