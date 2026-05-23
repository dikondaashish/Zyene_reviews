import type { FaqItem } from "./json-ld-types";
import { JsonLdScript } from "./json-ld-script";

export function FAQPageJsonLd({ faqs }: { faqs: FaqItem[] }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    };

    return <JsonLdScript schema={schema} />;
}
