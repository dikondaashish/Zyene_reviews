import type { IndustryData } from "@/lib/industries/industry-data";
import { ZYENE_REVIEWS_LOGO_SRC } from "@/lib/brand/logo";
import { buildOrganizationSchema } from "@/lib/seo/organization-schema";
import { JSON_LD_BASE_URL } from "./json-ld-constants";
import { JsonLdScript } from "./json-ld-script";

/** This page describes software for an industry, not a physical local business. */
export function IndustryLocalBusinessJsonLd({
    data,
    slug,
}: {
    data: IndustryData;
    slug: string;
}) {
    const url = `${JSON_LD_BASE_URL}/industries/${slug}`;

    const schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": `${url}#service`,
        name: `Zyene Reviews for ${data.name}`,
        description: data.metaDescription,
        url,
        image: `${JSON_LD_BASE_URL}${ZYENE_REVIEWS_LOGO_SRC}`,
        audience: {
            "@type": "BusinessAudience",
            audienceType: data.name,
        },
        provider: buildOrganizationSchema(),
        serviceType: "Review management software",
    };

    return <JsonLdScript schema={schema} />;
}
