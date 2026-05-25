import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { PartnersHeroSection } from "./partners-hero-section";
import { PartnersChannelsSection } from "./partners-channels-section";
import { PartnersAgencyPerksSection } from "./partners-agency-perks-section";
import { PartnersOutreachSection } from "./partners-outreach-section";
import { PartnersCtaSection } from "./partners-cta-section";

export default function PartnersPage() {
    return (
        <>
            <BreadcrumbJsonLd
                            items={[
                                { name: "Home", url: "https://www.zyenereviews.com/" },
                                { name: "Partners", url: "https://www.zyenereviews.com/partners" },
                            ]}
                        />
            <PartnersHeroSection />
            <PartnersChannelsSection />
            <PartnersAgencyPerksSection />
            <PartnersOutreachSection />
            <PartnersCtaSection />
        </>
    );
}
