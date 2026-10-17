import { JSON_LD_BASE_URL, JSON_LD_ORGANIZATION_ID } from "./json-ld-constants";
import { JsonLdScript } from "./json-ld-script";

/**
 * Free marketing tool (`/tools/*`): WebApplication + BreadcrumbList so search
 * and answer engines can cite the tool as a free, no-signup utility.
 */
export function FreeToolJsonLd({
    name,
    description,
    path,
}: {
    name: string;
    description: string;
    path: `/tools/${string}`;
}) {
    const url = `${JSON_LD_BASE_URL}${path}`;
    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebApplication",
                "@id": `${url}#app`,
                name,
                description,
                url,
                applicationCategory: "BusinessApplication",
                operatingSystem: "Any (web browser)",
                isAccessibleForFree: true,
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                publisher: { "@id": JSON_LD_ORGANIZATION_ID },
                inLanguage: "en-US",
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: `${JSON_LD_BASE_URL}/` },
                    { "@type": "ListItem", position: 2, name: "Free tools", item: `${JSON_LD_BASE_URL}/tools` },
                    { "@type": "ListItem", position: 3, name, item: url },
                ],
            },
        ],
    };

    return <JsonLdScript schema={schema} />;
}
