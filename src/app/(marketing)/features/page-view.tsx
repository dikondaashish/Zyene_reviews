import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { FeaturesHeroSection } from "./features-hero-section";
import { FeaturesQuickFeatureGridSection } from "./features-quick-feature-grid-section";
import { FeaturesFeaturePillarsSection } from "./features-feature-pillars-section";
import { FeaturesIntegrationsBarSection } from "./features-integrations-bar-section";
import { FeaturesFinalCtaSection } from "./features-final-cta-section";

export default function FeaturesPage() {
    return (
        <>
            <BreadcrumbJsonLd
                            items={[
                                { name: "Home", url: "https://www.zyenereviews.com/" },
                                { name: "Features", url: "https://www.zyenereviews.com/features" },
                            ]}
                        />
            <FeaturesHeroSection />
            <FeaturesQuickFeatureGridSection />
            <FeaturesFeaturePillarsSection />
            <FeaturesIntegrationsBarSection />
            <FeaturesFinalCtaSection />
        </>
    );
}
