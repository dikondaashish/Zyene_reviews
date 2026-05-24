/**
 * Help articles — Integrations (int1–int4).
 */

import type { HelpArticle } from "./help-types";

export const int1: HelpArticle = {
    slug: "connecting-google",
    category: "integrations",
    title: "Connecting Your Google Account",
    excerpt: "How to connect your Google account to Zyene — for Google Business Profile review monitoring and response publishing.",
    readMinutes: 3,
    body: [
        { type: "p", text: "Connecting your Google account is the primary integration in Zyene. It's required for Google Business Profile review monitoring, response publishing, and GBP keyword performance data." },
        { type: "h2", text: "Permissions Requested" },
        { type: "p", text: "When you connect your Google account, Zyene requests the following permissions:" },
        { type: "ul", items: [
            "View and manage your Google Business Profile locations: Required to access your locations and their review data.",
            "View and respond to reviews on your Google Business Profile: Required to display reviews in your inbox and publish responses.",
            "View Google Business Profile performance data: Required for the GBP keyword performance dashboard.",
        ]},
        { type: "warning", text: "Zyene never requests access to your personal Gmail, Google Drive, or any data outside of your Google Business Profile. If you see a permission request for personal data, do not authorize it and contact support@zyenereviews.com immediately." },
        { type: "h2", text: "Reconnecting an Expired Connection" },
        { type: "p", text: "Google OAuth tokens expire periodically. If your reviews stop updating or you see a 'Connection expired' warning in your dashboard, go to Settings → Integrations → Google and click 'Reconnect' to re-authorize." },
        { type: "h2", text: "Removing the Connection" },
        { type: "p", text: "To remove Zyene's access to your Google account: Settings → Integrations → Google → 'Disconnect'. You can also revoke access directly from your Google account at myaccount.google.com/permissions." },
    ],
};

export const int2: HelpArticle = {
    slug: "setting-up-zapier",
    category: "integrations",
    title: "Setting Up the Zapier Integration",
    excerpt: "How to connect Zyene to thousands of apps via Zapier — to trigger review requests automatically from your POS, booking system, or CRM.",
    readMinutes: 5,
    body: [
        { type: "p", text: "The Zapier integration lets you trigger Zyene review requests automatically from any app in Zapier's library — including Square, Acuity Scheduling, Calendly, Shopify, QuickBooks, and thousands more." },
        { type: "h2", text: "Getting Your Zapier Webhook URL" },
        { type: "ol", items: [
            "Go to Settings → Integrations → Zapier in your Zyene dashboard.",
            "Copy the unique webhook URL for your account.",
            "Save this URL — you'll need it in Zapier.",
        ]},
        { type: "h2", text: "Creating a Zap (Example: Square POS)" },
        { type: "ol", items: [
            "Go to zapier.com and click 'Create Zap'.",
            "Choose your trigger app (e.g., Square) and select the trigger event (e.g., 'New Payment').",
            "Connect your Square account and test the trigger.",
            "For the Action step, choose 'Webhooks by Zapier' → 'POST'.",
            "Paste your Zyene webhook URL in the URL field.",
            "Map the customer data fields: first_name → {{customer name}}, phone → {{customer phone}}, email → {{customer email}}.",
            "Test the Zap and turn it on.",
        ]},
        { type: "h2", text: "Required Data Fields" },
        { type: "table", table: {
            headers: ["Field", "Required", "Notes"],
            rows: [
                ["first_name", "Yes", "Customer's first name for personalization"],
                ["phone", "Conditional", "Required if sending SMS. E.164 format preferred (+1XXXXXXXXXX)"],
                ["email", "Conditional", "Required if sending email. At least one of phone/email required."],
                ["location_id", "Multi-location only", "Your Zyene location ID from Settings → Locations"],
            ],
        }},
        { type: "tip", text: "Set a delay filter in your Zap to only trigger for transactions above a minimum value (e.g., $10+). This filters out small tip adjustments or returns that shouldn't trigger review requests." },
    ],
};

export const int3: HelpArticle = {
    slug: "using-the-api",
    category: "integrations",
    title: "Using the Zyene REST API",
    excerpt: "How to use Zyene's REST API — authentication, available endpoints, and code examples for triggering review requests programmatically.",
    readMinutes: 6,
    body: [
        { type: "p", text: "Zyene's REST API lets developers integrate review request triggering, review data access, and response management directly into custom applications." },
        { type: "h2", text: "Authentication" },
        { type: "p", text: "All API requests require an API key passed as a Bearer token in the Authorization header. Get your API key from Settings → Integrations → API." },
        { type: "quote", text: "Authorization: Bearer YOUR_API_KEY" },
        { type: "h2", text: "Base URL" },
        { type: "quote", text: "https://api.zyenereviews.com/v1" },
        { type: "h2", text: "Key Endpoints" },
        { type: "table", table: {
            headers: ["Endpoint", "Method", "Description"],
            rows: [
                ["/requests", "POST", "Trigger a review request for a customer"],
                ["/reviews", "GET", "List reviews with filters"],
                ["/reviews/:id/reply", "POST", "Publish a reply to a specific review"],
                ["/locations", "GET", "List all connected locations"],
                ["/analytics", "GET", "Retrieve performance analytics"],
            ],
        }},
        { type: "h2", text: "Example: Trigger a Review Request" },
        { type: "quote", text: "POST /v1/requests\nContent-Type: application/json\n\n{\n  \"first_name\": \"Maria\",\n  \"phone\": \"+15551234567\",\n  \"email\": \"maria@example.com\",\n  \"channel\": \"sms\",\n  \"location_id\": \"loc_xxxxxxxxxxxx\",\n  \"delay_minutes\": 90\n}" },
        { type: "p", text: "For complete API documentation including all parameters, error codes, and response formats, visit zyenereviews.com/docs/api." },
        { type: "cta", ctaLabel: "Read the full API documentation →", ctaHref: "/docs/api" },
    ],
};

export const int4: HelpArticle = {
    slug: "embedding-review-widgets",
    category: "integrations",
    title: "Embedding Review Widgets on Your Website",
    excerpt:
        "Add a review carousel or star rating badge to your website with Zyene embeddable widgets — setup, styling, and placement tips.",
    readMinutes: 4,
    body: [
        { type: "p", text: "Zyene's review widgets let you display your Google reviews directly on your website — in a carousel format or as a star rating badge — to build trust with website visitors." },
        { type: "h2", text: "Widget Types" },
        { type: "ul", items: [
            "Review Carousel: A rotating carousel displaying recent 4-star and 5-star reviews with reviewer name, date, and rating.",
            "Star Rating Badge: A compact badge showing your current star rating and review count with a link to your Google profile.",
            "Review Grid: A static grid layout showing your most recent reviews — ideal for a dedicated testimonials page.",
        ]},
        { type: "h2", text: "Getting Your Widget Code" },
        { type: "ol", items: [
            "Go to Settings → Widgets.",
            "Select your widget type.",
            "Configure appearance: color theme, number of reviews to show, minimum star rating to display.",
            "Click 'Generate Code'.",
            "Copy the iframe code snippet.",
            "Paste it into your website's HTML wherever you want the widget to appear.",
        ]},
        { type: "h2", text: "Adding to Common Platforms" },
        { type: "ul", items: [
            "WordPress: Use the 'Custom HTML' block in Gutenberg or paste into a text widget in Classic.",
            "Squarespace: Add an 'Embed' block and paste the iframe code.",
            "Wix: Add a 'Custom Embed' element and paste the code.",
            "Webflow: Add an 'Embed' element and paste the code.",
        ]},
        { type: "tip", text: "Place the Star Rating Badge near your homepage hero, contact page, and any booking/quote forms. Trust signals near conversion points directly improve form completion rates." },
    ],
};
