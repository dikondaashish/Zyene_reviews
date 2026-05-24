import { JSON_LD_BASE_URL } from "./json-ld-constants";
import { JsonLdScript } from "./json-ld-script";

export function WebPageJsonLd({
    name,
    description,
    url,
}: {
    name: string;
    description: string;
    url: string;
}) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": url,
        url,
        name,
        description,
        isPartOf: {
            "@id": `${JSON_LD_BASE_URL}/#website`,
        },
        inLanguage: "en-US",
    };

    return <JsonLdScript schema={schema} />;
}
