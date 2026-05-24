import type { IndustryData } from "@/lib/phase3/industry-data";
import { ZYENE_REVIEWS_LOGO_SRC } from "@/lib/brand/logo";
import { buildOrganizationSchema } from "@/lib/seo/organization-schema";
import { JSON_LD_BASE_URL } from "./json-ld-constants";
import { JsonLdScript } from "./json-ld-script";

/** Industry vertical landing pages — LocalBusiness / ProfessionalService for local SEO relevance. */
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
        "@type": "LocalBusiness",
        "@id": `${url}#localbusiness`,
        name: `Zyene Reviews for ${data.name}`,
        description: data.metaDescription,
        url,
        image: `${JSON_LD_BASE_URL}${ZYENE_REVIEWS_LOGO_SRC}`,
        areaServed: {
            "@type": "AdministrativeArea",
            name: data.name,
        },
        parentOrganization: buildOrganizationSchema(),
        knowsAbout: data.targetKeywords,
    };

    return <JsonLdScript schema={schema} />;
}
