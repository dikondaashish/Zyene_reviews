import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { IndustriesHeroSection } from "./industries-hero-section";
import { IndustriesIndustryGridSection } from "./industries-industry-grid-section";
import { IndustriesSharedBenefitsStripSection } from "./industries-shared-benefits-strip-section";
import { IndustriesCtaSection } from "./industries-cta-section";

export default function IndustriesHubPage() {
    return (
        <>
            <BreadcrumbJsonLd
                            items={[
                                { name: "Home", url: "https://www.zyenereviews.com/" },
                                { name: "Industries", url: "https://www.zyenereviews.com/industries" },
                            ]}
                        />
            <IndustriesHeroSection />
            <IndustriesIndustryGridSection />
            <IndustriesSharedBenefitsStripSection />
            <IndustriesCtaSection />
        </>
    );
}
