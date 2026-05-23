import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { SecurityHeroSection } from "./security-hero-section";
import { SecuritySection2Section } from "./security-section-2-section";
import { SecuritySection3Section } from "./security-section-3-section";

export default function SecurityPage() {
    return (
        <>
            <BreadcrumbJsonLd
                            items={[
                                { name: "Home", url: "https://zyenereviews.com/" },
                                { name: "Security", url: "https://zyenereviews.com/security" },
                            ]}
                        />
            <SecurityHeroSection />
            <SecuritySection2Section />
            <SecuritySection3Section />
        </>
    );
}
