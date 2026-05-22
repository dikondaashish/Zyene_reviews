/**
 * JSON-LD Structured Data Components
 *
 * Each component renders a <script type="application/ld+json"> tag that Google
 * and other search engines use for rich results, sitelinks, knowledge panels, etc.
 *
 * Usage: import and place directly in server component page.tsx or layout.tsx.
 * Do NOT wrap in "use client" — these must be server-rendered.
 *
 * Schemas implemented:
 *  - OrganizationJsonLd      → Knowledge panel, brand signals
 *  - WebSiteJsonLd           → Sitelinks Searchbox eligibility
 *  - SoftwareApplicationJsonLd → App category + pricing rich results
 *  - FAQPageJsonLd           → Expandable FAQ in SERPs
 *  - BreadcrumbJsonLd        → Breadcrumb trail in SERPs
 *  - LocalBusinessJsonLd     → For industry landing pages (Phase 3)
 */

const BASE_URL = "https://zyenereviews.com";

// ─────────────────────────────────────────────────────────────
// Organization — global, place in root layout
// ─────────────────────────────────────────────────────────────

export function OrganizationJsonLd() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: "Zyene Reviews",
        alternateName: "Zyene",
        url: BASE_URL,
        logo: {
            "@type": "ImageObject",
            url: `${BASE_URL}/Main%20logo.png`,
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
                    dayOfWeek: [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                    ],
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
        sameAs: [
            "https://zyene.com",
        ],
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

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ─────────────────────────────────────────────────────────────
// WebSite — global, place in root layout
// Enables Sitelinks Searchbox in Google results
// ─────────────────────────────────────────────────────────────

export function WebSiteJsonLd() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        name: "Zyene Reviews",
        url: BASE_URL,
        publisher: {
            "@id": `${BASE_URL}/#organization`,
        },
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${BASE_URL}/docs?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ─────────────────────────────────────────────────────────────
// SoftwareApplication — homepage / features page
// ─────────────────────────────────────────────────────────────

export function SoftwareApplicationJsonLd() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": `${BASE_URL}/#software`,
        name: "Zyene Reviews",
        url: BASE_URL,
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Reputation Management Software",
        operatingSystem: "Web, iOS, Android",
        browserRequirements: "Requires JavaScript. Modern browser recommended.",
        description:
            "Zyene Reviews is a full-stack review management platform for local businesses. Monitor Google, Facebook, and Yelp reviews in one inbox. Respond with AI-generated replies in one click. Automatically collect reviews via SMS, email, and shareable links. Route negative feedback privately before it hits Google. Track competitors and optimize your Google Business Profile for local SEO.",
        screenshot: `${BASE_URL}/og/og-default.png`,
        featureList: [
            "Review monitoring from Google, Facebook, Yelp",
            "AI-powered review reply suggestions",
            "Auto-commenter for hands-free Google replies",
            "Negative Feedback Shield — private routing for 1-3 star feedback",
            "SMS, email, and link review request campaigns",
            "Competitor tracking with AI market briefs",
            "Google Business Profile SEO dashboard",
            "Keyword and performance analytics",
            "Multi-location management",
            "Zapier integration and REST API",
            "Embeddable review widgets",
        ],
        offers: [
            {
                "@type": "Offer",
                name: "Starter",
                price: "29.99",
                priceCurrency: "USD",
                priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    price: "29.99",
                    priceCurrency: "USD",
                    billingDuration: "P1M",
                    billingIncrement: 1,
                    unitText: "month",
                },
                description:
                    "Full review management platform for single-location businesses. Includes 500 email requests, 500 SMS requests, 1,500 AI replies/month, and 5 team seats.",
                availability: "https://schema.org/InStock",
                url: `${BASE_URL}/#pricing`,
            },
            {
                "@type": "Offer",
                name: "Professional",
                price: "59.99",
                priceCurrency: "USD",
                priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    price: "59.99",
                    priceCurrency: "USD",
                    billingDuration: "P1M",
                    billingIncrement: 1,
                    unitText: "month",
                },
                description:
                    "Multi-location review management for up to 3 locations. Includes per-location request limits, 2,000 AI replies/month, and 15 team seats.",
                availability: "https://schema.org/InStock",
                url: `${BASE_URL}/#pricing`,
            },
        ],
        publisher: {
            "@id": `${BASE_URL}/#organization`,
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            reviewCount: "47",
            bestRating: "5",
            worstRating: "1",
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ─────────────────────────────────────────────────────────────
// FAQPage — homepage FAQ section, future /pricing page
// ─────────────────────────────────────────────────────────────

export interface FaqItem {
    question: string;
    answer: string;
}

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

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ─────────────────────────────────────────────────────────────
// Breadcrumb — for industry, compare, blog pages
// ─────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
    name: string;
    url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ─────────────────────────────────────────────────────────────
// Product — for pricing page (Phase 2)
// ─────────────────────────────────────────────────────────────

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
                "@id": `${BASE_URL}/#organization`,
            },
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
