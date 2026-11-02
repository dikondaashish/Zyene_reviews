import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { getEnterprisePlan } from "@/services/stripe/plans";
import { EnterpriseHeroSection } from "./enterprise-hero-section";
import { EnterpriseSection2Section } from "./enterprise-section-2-section";
import { EnterpriseSection3Section } from "./enterprise-section-3-section";
import { EnterpriseSection4Section } from "./enterprise-section-4-section";
import { EnterpriseSection5Section } from "./enterprise-section-5-section";
import { EnterpriseSection6Section } from "./enterprise-section-6-section";

export default function EnterprisePage() {
    const enterprisePlan = getEnterprisePlan();

    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Enterprise", url: "https://www.zyenereviews.com/enterprise" },
                ]}
            />
            <EnterpriseHeroSection />
            <EnterpriseSection2Section />
            <EnterpriseSection3Section />
            <EnterpriseSection4Section />
            <EnterpriseSection5Section enterprisePlan={enterprisePlan} />
            <EnterpriseSection6Section />
        </>
    );
}
