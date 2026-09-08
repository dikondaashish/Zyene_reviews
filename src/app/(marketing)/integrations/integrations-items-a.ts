import type { IntegrationItem } from "./integrations-types";

export const INTEGRATIONS_A: IntegrationItem[] = [
    {
        name: "Google Business Profile",
        color: "var(--brand-google)",
        letter: "G",
        domain: "google.com",
        badge: "Sync & publish",
        status: "live",
        features: [
            "Sync Google Business Profile reviews into Zyene",
            "Publish approved review responses to Google",
            "Track review keywords & GBP performance",
            "Monitor incoming reviews and rating changes",
        ],
        description:
            "Connect your Google Business Profile to sync reviews, track review activity and GBP performance, and publish approved review responses from Zyene.",
    },
    {
        name: "Facebook Reviews",
        color: "var(--brand-facebook)",
        letter: "f",
        domain: "facebook.com",
        badge: "Sync",
        status: "live",
        features: [
            "Sync Facebook Page reviews into Zyene",
            "Unified view alongside Google & Yelp",
            "Monitor rating trends and new feedback",
            "Respond in Facebook (sync only)",
        ],
        description:
            "Bring Facebook Page reviews into Zyene alongside other connected sources. Zyene syncs this feedback for monitoring; responses stay on Facebook.",
    },
    {
        name: "Yelp",
        color: "var(--brand-yelp)",
        letter: "Y",
        domain: "yelp.com",
        badge: "Sync",
        status: "live",
        features: [
            "Sync Yelp reviews into your inbox",
            "Monitor rating trends and new feedback",
            "Track Yelp star rating trends",
            "Respond in Yelp (sync only)",
        ],
        description:
            "Keep Yelp feedback visible alongside your other connected review sources. Zyene syncs it for monitoring; responses stay on Yelp.",
    },
    {
        name: "Generic inbound webhook",
        color: "var(--brand-api-neutral)",
        letter: "↗",
        badge: "Zapier-compatible",
        status: "live",
        features: [
            "Accept customer events from webhook-capable tools",
            "Map a name plus email and/or phone fields",
            "Start a review request after a sale, booking, or completed service",
            "Use a DIY Zapier webhook step or custom system",
            "DIY setup; no Zapier Marketplace app",
        ],
        description:
            "Create a generic inbound webhook in Zyene and let a webhook-capable system post a customer event after a sale, booking, or completed service. It works with a DIY Zapier webhook step, not a marketplace app.",
    },
    {
        name: "Square",
        color: "var(--brand-square)",
        letter: "S",
        domain: "squareup.com",
        badge: "Early access",
        status: "live",
        features: [
            "Available in early access for enabled accounts",
            "Connect Square with the available OAuth flow",
            "Use supported payment events to start a review request",
            "Review the connection and auto-send setting in Zyene",
        ],
        description:
            "Square is available in early access where enabled. Connect it to test payment-event review requests with the customer contact information available in Square.",
    },
];
