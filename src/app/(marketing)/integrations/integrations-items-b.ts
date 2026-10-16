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
            "20 ready-made templates: carousels, grids, badges, stickers, lists and a review wall",
            "Show selected public reviews rated 4 stars or higher",
            "Customize the widget’s layout, filters and colors",
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
            "Connect your Clover account",
            "Send review requests after Clover sales",
            "Match customers by email or phone from payments",
        ],
        description:
            "Clover is in early access with select accounts. Automatic review requests after Clover sales are in development. Join the waitlist to be notified when it launches.",
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
            "Use customer contact details from Toast orders",
            "Ideal for restaurants and quick service",
        ],
        description:
            "Toast POS integration is coming for restaurants. Join the waitlist to be notified when it launches.",
    },
];
