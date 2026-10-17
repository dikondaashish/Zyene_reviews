import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { FeatureLandingClosing } from "@/components/marketing/feature-landing/feature-landing-closing";
import { FeatureLandingStage } from "@/components/marketing/feature-landing/feature-landing-stage";
import { FeaturesHeroSection } from "./features-hero-section";
import { FeaturesFeaturePillarsSection } from "./features-feature-pillars-section";
import { FeaturesIntegrationsBarSection } from "./features-integrations-bar-section";

export default function FeaturesPage() {
    return (
        <div className="fl-hub">
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Features", url: "https://www.zyenereviews.com/features" },
                ]}
            />
            <FeaturesHeroSection />
            <div className="marketing-container">
                <FeatureLandingStage label="Interactive Zyene Reviews workspace" />
            </div>
            <FeaturesFeaturePillarsSection />
            <FeaturesIntegrationsBarSection />
            <FeatureLandingClosing title="One workspace for every review." location="features-cta" />
        </div>
    );
}
