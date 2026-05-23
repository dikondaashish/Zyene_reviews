/**
 * Help articles — Getting Started (gs1–gs4).
 */

import type { HelpArticle } from "./help-types";

export const gs1: HelpArticle = {
    slug: "creating-your-account",
    category: "getting-started",
    title: "Creating Your Account",
    excerpt: "How to sign up for Zyene Reviews, choose your plan, and get started in under 5 minutes.",
    readMinutes: 3,
    body: [
        { type: "p", text: "Signing up for Zyene Reviews takes under 5 minutes. Here's exactly how to do it." },
        { type: "h2", text: "Step 1: Go to the Sign-Up Page" },
        { type: "p", text: "Navigate to zyenereviews.com and click 'Start Free Trial' in the top navigation. You'll be taken directly to the sign-up page." },
        { type: "h2", text: "Step 2: Sign Up With Google or Email" },
        { type: "p", text: "We recommend signing up with Google — it's faster and will be needed later to connect your Google Business Profile. Click 'Sign up with Google' and authorize the connection." },
        { type: "tip", text: "If you sign up with Google, you'll be asked to grant access to your Google Business Profile during the authorization step. This is required for Zyene to monitor and respond to your Google Reviews. See our guide on why we request this access." },
        { type: "h2", text: "Step 3: Enter Your Business Details" },
        { type: "ol", items: [
            "Enter your business name",
            "Select your industry (optional but helps personalize AI replies)",
            "Enter your business address or service area",
        ]},
        { type: "h2", text: "Step 4: Your 7-Day Free Trial Starts" },
        { type: "p", text: "You now have full access to all features for 7 days. Cancel before the trial ends and you won't be charged. At the end of the trial, your subscription starts automatically — no lock-in, cancel anytime from billing settings." },
        { type: "h2", text: "Next Steps" },
        { type: "ul", items: [
            "Connect your Google Business Profile",
            "Send your first review request",
            "Set up the Negative Feedback Shield",
        ]},
    ],
};

export const gs2: HelpArticle = {
    slug: "connecting-google-business-profile",
    category: "getting-started",
    title: "Connecting Your Google Business Profile",
    excerpt: "How to connect your Google Business Profile to Zyene so reviews are monitored and responses can be published in one click.",
    readMinutes: 4,
    body: [
        { type: "p", text: "Connecting your Google Business Profile (GBP) is the most important setup step — it's what allows Zyene to monitor your Google Reviews in real time and let you publish responses directly from your dashboard." },
        { type: "h2", text: "Prerequisites" },
        { type: "ul", items: [
            "You must be a verified owner or manager of the Google Business Profile you want to connect.",
            "You must be signed into Zyene with the same Google account that has access to the GBP, OR you can authorize a different Google account during the connection step.",
        ]},
        { type: "h2", text: "Steps to Connect" },
        { type: "ol", items: [
            "From your Zyene dashboard, click 'Settings' in the left navigation.",
            "Click 'Integrations', then 'Google Business Profile'.",
            "Click 'Connect Google Account'. You'll be redirected to Google's authorization screen.",
            "Sign in with the Google account that manages your GBP.",
            "Grant the requested permissions (these are required for review monitoring and response publishing).",
            "After authorization, you'll be returned to Zyene. Your GBP locations will appear in a list.",
            "Select the location you want to connect and click 'Connect Location'.",
        ]},
        { type: "h2", text: "What Happens After Connecting" },
        { type: "ul", items: [
            "Zyene will import your existing reviews from the last 90 days.",
            "New reviews will appear in your inbox within minutes of being posted on Google.",
            "You'll receive an email and/or SMS notification (based on your settings) for each new review.",
            "You can respond to reviews directly from Zyene — responses are published to your Google Business Profile instantly.",
        ]},
        { type: "h2", text: "Troubleshooting" },
        { type: "ul", items: [
            "If your GBP doesn't appear after connecting: ensure the Google account you authorized is an Owner or Manager of the GBP, not just a Communications Manager.",
            "If you have multiple locations: each location needs to be connected separately from the Locations page.",
            "If you see a 'Permission denied' error: your GBP ownership may need to be re-verified. Visit business.google.com to check your verification status.",
        ]},
    ],
};

export const gs3: HelpArticle = {
    slug: "sending-your-first-review-request",
    category: "getting-started",
    title: "Sending Your First Review Request",
    excerpt: "How to create and send your first review request to a customer — manually or via an automated campaign.",
    readMinutes: 4,
    body: [
        { type: "p", text: "Your first review request can be sent within 2 minutes of completing setup. Here's how." },
        { type: "h2", text: "Option A: Send a Single Manual Request" },
        { type: "ol", items: [
            "From your dashboard, click 'Review Requests' in the left navigation.",
            "Click 'New Request'.",
            "Enter the customer's name, phone number, and/or email address.",
            "Select the channel: SMS, Email, or Both.",
            "Choose or customize the message template.",
            "Click 'Send Now' or schedule for later.",
        ]},
        { type: "tip", text: "SMS requests convert at 15–25% — significantly higher than email (5–10%). Always use SMS when you have a mobile number." },
        { type: "h2", text: "Option B: Set Up Automated Requests" },
        { type: "p", text: "For ongoing review collection, automated requests are far more effective than manual ones. Connect Zyene to your existing workflow (POS, booking system, or via Zapier) to trigger requests automatically after each transaction or appointment." },
        { type: "ul", items: [
            "Go to Settings → Campaigns → Automation.",
            "Choose your trigger: Zapier webhook, Square integration, or manual CSV upload.",
            "Set the delay: We recommend 1–3 hours after the transaction.",
            "Review and activate the campaign.",
        ]},
        { type: "h2", text: "Understanding Your Review Link" },
        { type: "p", text: "Every review request includes your unique Google review link. When a customer clicks it, they're taken directly to your Google Business Profile review form — no searching required. If you've connected multiple locations, each location has its own review link." },
        { type: "h2", text: "The Negative Feedback Shield" },
        { type: "p", text: "Before your review request goes to a customer, Zyene can optionally show them a satisfaction check. Satisfied customers go directly to your Google review page. Customers who are not satisfied are routed to a private feedback form instead — protecting your Google rating from preventable 1-star reviews." },
        { type: "ul", items: [
            "Go to Settings → Negative Feedback Shield to enable this feature.",
            "You can customize the satisfaction threshold (e.g., only route customers who rate below 3/5 to private feedback).",
        ]},
    ],
};

export const gs4: HelpArticle = {
    slug: "understanding-your-dashboard",
    category: "getting-started",
    title: "Understanding Your Dashboard",
    excerpt: "An overview of every section of the Zyene Reviews dashboard — what each metric means and where to find what you need.",
    readMinutes: 5,
    body: [
        { type: "p", text: "Your Zyene dashboard gives you a real-time view of your review performance across all connected platforms and locations. Here's what each section shows." },
        { type: "h2", text: "Dashboard Overview (Home)" },
        { type: "ul", items: [
            "Rating summary: Your current average star rating on Google (and other connected platforms) plus the change over the last 30 days.",
            "Review count: Total reviews received all-time and in the last 30 days.",
            "Response rate: The percentage of reviews you've responded to. Target: 100%.",
            "Review velocity: Chart showing your monthly review volume trend.",
            "New reviews: The 5 most recent unread reviews requiring your attention.",
        ]},
        { type: "h2", text: "Review Inbox" },
        { type: "p", text: "Your central inbox shows all reviews from all connected platforms and locations — sorted by recency. From the inbox you can read reviews, use AI reply suggestions, publish responses, mark reviews as reviewed, and flag suspicious reviews." },
        { type: "h2", text: "Competitor Tracking" },
        { type: "p", text: "The Competitors section shows you the star rating, review count, and response rate of up to 10 competitors you've added. You can see trend lines over time and identify when a competitor is gaining ground." },
        { type: "h2", text: "GBP Keyword Performance" },
        { type: "p", text: "This section shows which Google searches are sending impressions and clicks to your Google Business Profile. Updated weekly from your connected GBP. Use this to understand which keywords are driving your local visibility and where optimization opportunities exist." },
        { type: "h2", text: "Campaigns" },
        { type: "p", text: "The Campaigns section shows your active and scheduled review request campaigns, delivery stats (sent, opened, clicked, converted), and lets you create new campaigns or one-off requests." },
        { type: "h2", text: "Negative Feedback Shield" },
        { type: "p", text: "The Shield inbox shows all private feedback submitted by customers who indicated they were not satisfied in your review request flow. Each submission includes the customer's contact details and their feedback message — so you can follow up and resolve the issue before it becomes a public review." },
        { type: "h2", text: "Locations" },
        { type: "p", text: "If you manage multiple locations, the Locations page shows all connected locations with their individual performance metrics. You can switch between locations or view all-location aggregate metrics." },
    ],
};
