import { buildOrganizationSchema } from "@/lib/seo/organization-schema";
import { JSON_LD_BASE_URL } from "./json-ld-constants";
import { JsonLdScript } from "./json-ld-script";

export function WebSiteJsonLd() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${JSON_LD_BASE_URL}/#website`,
        name: "Zyene Reviews",
        url: JSON_LD_BASE_URL,
        publisher: buildOrganizationSchema(),
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${JSON_LD_BASE_URL}/docs?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    };

    return <JsonLdScript schema={schema} />;
}
