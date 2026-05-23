import { JSON_LD_BASE_URL } from "./json-ld-constants";
import { JsonLdScript } from "./json-ld-script";

export function OrganizationJsonLd() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${JSON_LD_BASE_URL}/#organization`,
        name: "Zyene Reviews",
        alternateName: "Zyene",
        url: JSON_LD_BASE_URL,
        logo: {
            "@type": "ImageObject",
            url: `${JSON_LD_BASE_URL}/Main%20logo.png`,
            width: 512,
            height: 512,
        },
        description:
            "Zyene Reviews is a review management and local SEO platform for local businesses. Monitor Google, Facebook, and Yelp reviews, respond with AI, collect reviews via SMS and email, and track competitors — starting at $29.99/mo.",
        contactPoint: [
            {
                "@type": "ContactPoint",
                email: "support@zyenereviews.com",
                contactType: "customer support",
                availableLanguage: "English",
                hoursAvailable: {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    opens: "09:00",
                    closes: "18:00",
                },
            },
            {
                "@type": "ContactPoint",
                email: "sales@zyenereviews.com",
                contactType: "sales",
                availableLanguage: "English",
            },
        ],
        address: {
            "@type": "PostalAddress",
            addressCountry: "US",
        },
        foundingDate: "2024",
        legalName: "Zyene, Inc.",
        parentOrganization: {
            "@type": "Organization",
            name: "Zyene, Inc.",
            url: "https://zyene.com",
        },
        sameAs: ["https://zyene.com"],
        areaServed: "Worldwide",
        knowsAbout: [
            "Review Management",
            "Reputation Management",
            "Google Business Profile",
            "Local SEO",
            "AI Review Replies",
            "Customer Reviews",
        ],
    };

    return <JsonLdScript schema={schema} />;
}
