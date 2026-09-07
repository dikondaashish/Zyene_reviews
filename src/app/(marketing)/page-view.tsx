import { MarketingHomeClient } from "@/components/marketing/marketing-home-client";
import {
    FAQPageJsonLd,
    OrganizationJsonLd,
    SoftwareApplicationJsonLd,
} from "@/components/seo/json-ld";

import { HOME_FAQS } from "@/components/marketing/marketing-home/home-faqs";


export default function MarketingHomePageView() {
    return (
        <>
            <OrganizationJsonLd />
            <SoftwareApplicationJsonLd />
            <FAQPageJsonLd faqs={HOME_FAQS} />
            <MarketingHomeClient />
        </>
    );
}
