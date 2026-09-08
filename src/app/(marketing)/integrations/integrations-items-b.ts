import type { IntegrationItem } from "./integrations-types";

export const INTEGRATIONS_B: IntegrationItem[] = [
    {
        name: "REST API",
        color: "var(--brand-api-neutral)",
        letter: "</>",
        badge: "Available",
        status: "live",
        features: [
            "Create a scoped API key in Zyene",
            "Send review requests programmatically",
            "List reviews for your connected business",
            "Retrieve aggregate review and request activity",
            "Use CORS-friendly REST endpoints",
        ],
        description:
            "Use a scoped API key to send review requests from your system, list review records, and retrieve aggregate review and request activity.",
    },
    {
        name: "Website Review Widget",
        color: "var(--brand-hubspot)",
        letter: "W",
        badge: "Paid accounts",
        status: "live",
        features: [
            "Available to paid accounts",
            "Show selected public reviews rated 4 stars or higher",
            "Embed a review carousel or badge on your website",
            "Customize the widget’s layout and appearance",
            "Use a standard embed snippet on your site",
        ],
        description:
            "Turn selected 4-star-and-up public reviews into social proof on your site. Choose the widget’s look, then add the provided embed snippet where visitors will see it.",
    },
    {
        name: "Clover POS",
        color: "var(--brand-clover)",
        letter: "C",
        domain: "clover.com",
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
        domain: "toasttab.com",
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
