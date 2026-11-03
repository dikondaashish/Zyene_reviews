import { MarketingFaqSection } from "@/components/marketing/marketing-faq-section";
import { BreadcrumbJsonLd, FAQPageJsonLd } from "@/components/seo/json-ld";
import { COMPARE_HUB_FAQS } from "./compare-hub-content";
import { CompareHeroSection } from "./compare-hero-section";
import { CompareHubSmallBusinessSection } from "./compare-hub-small-business-section";
import { CompareCardsSection } from "./compare-cards-section";
import { CompareTableSection } from "./compare-table-section";
import { CompareHubHowToChooseSection } from "./compare-hub-how-to-choose-section";
import { CompareHeadToHeadSections } from "./compare-head-to-head-sections";
import { CompareHubLinksSection } from "./compare-hub-links-section";
import { CompareCtaSection } from "./compare-cta-section";

export default function ComparePage() {
    return (
        <>
            <FAQPageJsonLd faqs={COMPARE_HUB_FAQS} />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Compare", url: "https://www.zyenereviews.com/compare" },
                ]}
            />
            <CompareHeroSection />
            <CompareHubSmallBusinessSection />
            <CompareCardsSection />
            <CompareTableSection />
            <CompareHubHowToChooseSection />
            <CompareHeadToHeadSections />
            <CompareHubLinksSection />
            <MarketingFaqSection faqs={COMPARE_HUB_FAQS} headingId="compare-hub-faq-heading" />
            <CompareCtaSection />
        </>
    );
}
