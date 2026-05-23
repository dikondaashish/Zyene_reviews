import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { CompareHeroSection } from "./compare-hero-section";
import { CompareCardsSection } from "./compare-cards-section";
import { CompareTableSection } from "./compare-table-section";
import { CompareCtaSection } from "./compare-cta-section";

export default function ComparePage() {
    return (
        <>
            <BreadcrumbJsonLd
                            items={[
                                { name: "Home", url: "https://zyenereviews.com/" },
                                { name: "Compare", url: "https://zyenereviews.com/compare" },
                            ]}
                        />
            <CompareHeroSection />
            <CompareCardsSection />
            <CompareTableSection />
            <CompareCtaSection />
        </>
    );
}
