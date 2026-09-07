import type { IntegrationItem } from "./integrations-types";

export const INTEGRATIONS_A: IntegrationItem[] = [
    {
        name: "Google Business Profile",
        color: "var(--brand-google)",
        letter: "G",
        domain: "google.com",
        badge: null,
        status: "live",
        features: [
            "Sync all Google reviews in real time",
            "Publish AI replies directly to Google",
            "Track review keywords & GBP performance",
            "Manage Q&A from your dashboard",
            "Access local pack ranking insights",
        ],
        description:
            "The heart of your local SEO. Zyene connects to your Google Business Profile via official OAuth - syncing every review, monitoring your keyword performance, and letting you publish AI-crafted replies without leaving the dashboard.",
    },
    {
        name: "Facebook Reviews",
        color: "var(--brand-facebook)",
        letter: "f",
        domain: "facebook.com",
        badge: null,
        status: "live",
        features: [
            "Sync Facebook page reviews in real time",
            "Reply to Facebook reviews from your inbox",
            "Unified view alongside Google & Yelp",
            "Sentiment analysis on Facebook reviews",
        ],
        description:
            "Manage your Facebook page reviews alongside Google and Yelp in one unified inbox. Never switch tabs to respond to a Facebook review again.",
    },
    {
        name: "Yelp",
        color: "var(--brand-yelp)",
        letter: "Y",
        domain: "yelp.com",
        badge: null,
        status: "live",
        features: [
            "Sync Yelp reviews into your inbox",
            "Monitor new Yelp reviews in real time",
            "Track Yelp star rating trends",
            "Alert when a new review arrives",
        ],
        description:
            "Yelp reviews matter for restaurants, salons, and service businesses. Zyene syncs your Yelp profile so you never miss a new review or a drop in your rating.",
    },
    {
        name: "Zapier",
        color: "var(--brand-zapier)",
        letter: "Z",
        domain: "zapier.com",
        badge: null,
        status: "live",
        features: [
            "Trigger review requests from apps that can send a webhook",
            "Map customer name, email, and phone fields",
            "Trigger after a sale, booking, or completed service",
            "Use Zapier filters and delays before sending",
            "No custom code required for the webhook setup",
        ],
        description:
            "If your workflow lives in another app, use Zapier to send a review request after a sale, booking, or completed service. Map the customer fields, add any filters or delays, and send the request to Zyene.",
    },
    {
        name: "Square",
        color: "var(--brand-square)",
        letter: "S",
        domain: "squareup.com",
        badge: null,
        status: "live",
        features: [
            "Auto-send review requests after every Square sale",
            "Uses customer email/phone from Square transaction",
            "Configurable delay (e.g. send 2 hours after purchase)",
            "Works for retail and food & beverage",
        ],
        description:
            "Connect Square once and Zyene can send a review request after a completed sale. Configure the delay and customer contact fields in the integration settings.",
    },
];
