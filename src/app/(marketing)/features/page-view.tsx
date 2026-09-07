import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { FeaturesHeroSection } from "./features-hero-section";
import { ProductShowcase } from "@/components/marketing/product-tour/product-showcase";
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
            <ProductShowcase title="Meet your new everyday workspace." />
            <FeaturesFeaturePillarsSection />
            <FeaturesIntegrationsBarSection />
            <FeaturesFinalCtaSection />
        </>
    );
}
