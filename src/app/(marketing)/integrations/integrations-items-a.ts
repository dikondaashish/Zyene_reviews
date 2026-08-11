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
            "The heart of your local SEO. Zyene connects to your Google Business Profile via official OAuth — syncing every review, monitoring your keyword performance, and letting you publish AI-crafted replies without leaving the dashboard.",
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
            "Trigger review requests from 5,000+ apps",
            "Connect CRMs: HubSpot, Salesforce, Zoho",
            "Trigger after POS sales, bookings, or support tickets",
            "Build multi-step automation workflows",
            "No code required",
        ],
        description:
            "If your workflow lives in another app, Zapier bridges the gap. Trigger a review request the moment a booking is completed, a sale is closed, or a support ticket is resolved — automatically.",
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
            "Square is the most popular POS for local businesses. Connect once and Zyene will automatically send a review request after every completed sale — no manual work required.",
    },
];
