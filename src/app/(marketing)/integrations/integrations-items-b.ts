import type { IntegrationItem } from "./integrations-types";

export const INTEGRATIONS_B: IntegrationItem[] = [
    {
        name: "REST API",
        color: "var(--brand-api-neutral)",
        letter: "</>",
        badge: null,
        status: "live",
        features: [
            "Full API access on all paid plans",
            "Send review requests programmatically",
            "Read and write reviews, responses, and analytics",
            "Webhook support for real-time events",
            "OpenAPI spec + Postman collection available",
        ],
        description:
            "Build exactly what your business needs. Our REST API gives developers full access to review data, request automation, and analytics — with webhooks for real-time triggers.",
    },
    {
        name: "Website Review Widget",
        color: "var(--brand-hubspot)",
        letter: "W",
        badge: null,
        status: "live",
        features: [
            "Embed your latest Google reviews on any website",
            "Responsive, customizable design",
            "Automatically updates as new reviews arrive",
            "Supports all major website builders",
            "Increases conversion from visitors to customers",
        ],
        description:
            "Turn your 5-star reviews into website social proof. Embed a live review feed on your homepage, about page, or checkout page — it updates automatically as new reviews come in.",
    },
    {
        name: "Clover POS",
        color: "var(--brand-clover)",
        letter: "C",
        badge: "Coming Soon",
        status: "soon",
        features: [
            "Auto-send review requests after Clover sales",
            "Native Clover app marketplace integration",
            "Works with all Clover hardware",
        ],
        description:
            "Native Clover POS integration is in development. Join the waitlist to be notified when it launches.",
    },
    {
        name: "Toast POS",
        color: "var(--brand-toast)",
        letter: "T",
        badge: "Coming Soon",
        status: "soon",
        features: [
            "Auto-send review requests after Toast orders",
            "Syncs customer data from Toast",
            "Ideal for restaurants and quick service",
        ],
        description:
            "Toast POS integration is coming for restaurants. Join the waitlist to be notified when it launches.",
    },
];
