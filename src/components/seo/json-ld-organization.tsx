import { buildOrganizationSchema } from "@/lib/seo/organization-schema";
import { JsonLdScript } from "./json-ld-script";

export function OrganizationJsonLd() {
    const schema = {
        "@context": "https://schema.org",
        ...buildOrganizationSchema(),
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
