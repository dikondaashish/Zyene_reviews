import {
    BreadcrumbJsonLd,
    FAQPageJsonLd,
    SoftwareApplicationJsonLd,
} from "@/components/seo/json-ld";
import { marketingCanonicalUrl } from "@/lib/seo/marketing-site-url";
import { SMALL_BUSINESS_PATH } from "@/lib/marketing/small-business-content";
import { SMALL_BUSINESS_FAQS } from "@/lib/marketing/small-business-faqs";
import { SmallBusinessHeroSection } from "./small-business-hero-section";
import { SmallBusinessFeaturesSection } from "./small-business-features-section";
import { SmallBusinessPricingSection } from "./small-business-pricing-section";
import { SmallBusinessSetupSection } from "./small-business-setup-section";
import { SmallBusinessFaqSection } from "./small-business-faq-section";
import { SmallBusinessFinalCtaSection } from "./small-business-final-cta-section";

export default function SmallBusinessPage() {
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: marketingCanonicalUrl("/") },
                    { name: "Small Business", url: marketingCanonicalUrl(SMALL_BUSINESS_PATH) },
                ]}
            />
            <SoftwareApplicationJsonLd />
            <FAQPageJsonLd faqs={SMALL_BUSINESS_FAQS} />
            <SmallBusinessHeroSection />
            <SmallBusinessFeaturesSection />
            <SmallBusinessPricingSection />
            <SmallBusinessSetupSection />
            <SmallBusinessFaqSection />
            <SmallBusinessFinalCtaSection />
        </>
    );
}
