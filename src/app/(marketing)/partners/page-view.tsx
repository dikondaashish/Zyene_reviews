import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { PartnersHeroSection } from "./partners-hero-section";
import { PartnersTypesSection } from "./partners-types-section";
import { PartnersContactSection } from "./partners-contact-section";
import { PartnersClosingSection } from "./partners-closing-section";

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
            <PartnersTypesSection />
            <PartnersContactSection />
            <PartnersClosingSection />
        </>
    );
}
