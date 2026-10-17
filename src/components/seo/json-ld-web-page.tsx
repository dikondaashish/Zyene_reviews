import { JSON_LD_BASE_URL, JSON_LD_ORGANIZATION_ID } from "./json-ld-constants";
import { JsonLdScript } from "./json-ld-script";

type WebPageType = "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";

export function WebPageJsonLd({
    name,
    description,
    url,
    type = "WebPage",
}: {
    name: string;
    description: string;
    url: string;
    type?: WebPageType;
}) {
    const schema = {
        "@context": "https://schema.org",
        "@type": type,
        "@id": url,
        url,
        name,
        description,
        isPartOf: {
            "@id": `${JSON_LD_BASE_URL}/#website`,
        },
        // About/Contact pages describe the brand entity itself (entity SEO / AEO).
        ...(type === "AboutPage" || type === "ContactPage"
            ? { about: { "@id": JSON_LD_ORGANIZATION_ID }, mainEntity: { "@id": JSON_LD_ORGANIZATION_ID } }
            : {}),
        inLanguage: "en-US",
    };

    return <JsonLdScript schema={schema} />;
}
