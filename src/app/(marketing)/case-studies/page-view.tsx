import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { CaseStudiesHeroSection } from "./case-studies-hero-section";
import { CaseStudiesLogoBarSection } from "./case-studies-logo-bar-section";
import { CaseStudiesGridSection } from "./case-studies-grid-section";
import { CaseStudiesCtaSection } from "./case-studies-cta-section";

export default function CaseStudiesHubPage() {
    return (
        <>
            <BreadcrumbJsonLd
                            items={[
                                { name: "Home", url: "https://www.zyenereviews.com/" },
                                { name: "Case Studies", url: "https://www.zyenereviews.com/case-studies" },
                            ]}
                        />
            <CaseStudiesHeroSection />
            <CaseStudiesLogoBarSection />
            <CaseStudiesGridSection />
            <CaseStudiesCtaSection />
        </>
    );
}
