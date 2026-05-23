import { JSON_LD_BASE_URL } from "./json-ld-constants";
import { JsonLdScript } from "./json-ld-script";

export function ProductJsonLd({
    name,
    description,
    price,
    currency = "USD",
    url,
}: {
    name: string;
    description: string;
    price: string;
    currency?: string;
    url: string;
}) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        brand: {
            "@type": "Brand",
            name: "Zyene Reviews",
        },
        offers: {
            "@type": "Offer",
            price,
            priceCurrency: currency,
            availability: "https://schema.org/InStock",
            url,
            seller: {
                "@id": `${JSON_LD_BASE_URL}/#organization`,
            },
        },
    };

    return <JsonLdScript schema={schema} />;
}
