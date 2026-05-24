import { MarketingFaqSection } from "@/components/marketing/marketing-faq-section";
import { BreadcrumbJsonLd, FAQPageJsonLd } from "@/components/seo/json-ld";
import { COMPARE_HUB_FAQS } from "./compare-hub-content";
import { CompareHeroSection } from "./compare-hero-section";
import { CompareCardsSection } from "./compare-cards-section";
import { CompareTableSection } from "./compare-table-section";
import { CompareCtaSection } from "./compare-cta-section";

export default function ComparePage() {
    return (
        <>
            <FAQPageJsonLd faqs={COMPARE_HUB_FAQS} />
            <BreadcrumbJsonLd
                            items={[
                                { name: "Home", url: "https://zyenereviews.com/" },
                                { name: "Compare", url: "https://zyenereviews.com/compare" },
                            ]}
                        />
            <CompareHeroSection />
            <CompareCardsSection />
            <CompareTableSection />
            <MarketingFaqSection faqs={COMPARE_HUB_FAQS} headingId="compare-hub-faq-heading" />
            <CompareCtaSection />
        </>
    );
}
