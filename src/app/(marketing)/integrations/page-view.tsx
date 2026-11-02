import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { IntegrationsComingSoonSection } from "./integrations-coming-soon-section";
import { IntegrationsCtaSection } from "./integrations-cta-section";
import { IntegrationsDeveloperSection } from "./integrations-developer-section";
import { IntegrationsHeroSection } from "./integrations-hero-section";
import { IntegrationsLiveSection } from "./integrations-live-section";

export default function IntegrationsPage() {
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Integrations", url: "https://www.zyenereviews.com/integrations" },
                ]}
            />
            <IntegrationsHeroSection />
            <IntegrationsLiveSection />
            <IntegrationsComingSoonSection />
            <IntegrationsDeveloperSection />
            <IntegrationsCtaSection />
        </>
    );
}
