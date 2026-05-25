import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { HowItWorksHeroSection } from "./how-it-works-hero-section";
import { HowItWorksStepsSection } from "./how-it-works-steps-section";
import { HowItWorksProofPointsSection } from "./how-it-works-proof-points-section";
import { HowItWorksFinalCtaSection } from "./how-it-works-final-cta-section";

export default function HowItWorksPage() {
    return (
        <>
            <BreadcrumbJsonLd
                            items={[
                                { name: "Home", url: "https://www.zyenereviews.com/" },
                                { name: "How It Works", url: "https://www.zyenereviews.com/how-it-works" },
                            ]}
                        />
            <HowItWorksHeroSection />
            <HowItWorksStepsSection />
            <HowItWorksProofPointsSection />
            <HowItWorksFinalCtaSection />
        </>
    );
}
