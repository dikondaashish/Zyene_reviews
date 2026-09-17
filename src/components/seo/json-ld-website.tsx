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
    };

    return <JsonLdScript schema={schema} />;
}
