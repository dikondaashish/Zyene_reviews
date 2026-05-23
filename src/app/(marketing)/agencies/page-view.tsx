import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { AgenciesHeroSection } from "./agencies-hero-section";
import { AgenciesSection2Section } from "./agencies-section-2-section";
import { AgenciesSection3Section } from "./agencies-section-3-section";
import { AgenciesSection4Section } from "./agencies-section-4-section";
import { AgenciesSection5Section } from "./agencies-section-5-section";

export default function AgenciesPage() {
    return (
        <>
            <BreadcrumbJsonLd
                            items={[
                                { name: "Home", url: "https://zyenereviews.com/" },
                                { name: "Agencies", url: "https://zyenereviews.com/agencies" },
                            ]}
                        />
            <AgenciesHeroSection />
            <AgenciesSection2Section />
            <AgenciesSection3Section />
            <AgenciesSection4Section />
            <AgenciesSection5Section />
        </>
    );
}
