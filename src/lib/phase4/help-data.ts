// ─────────────────────────────────────────────────────────────────────────────
// Help Center Article Data — Phase 4
// 23 articles across 6 categories replacing dead # links.
// ─────────────────────────────────────────────────────────────────────────────

import type { ContentSection } from "./blog-data";

export type HelpCategory =
    | "getting-started"
    | "reviews"
    | "campaigns"
    | "analytics"
    | "billing"
    | "integrations";

export interface HelpArticle {
    slug: string;
    category: HelpCategory;
    title: string;
    excerpt: string;
    readMinutes: number;
    body: ContentSection[];
}

export const HELP_CATEGORIES: Record<HelpCategory, { label: string; description: string; emoji: string }> = {
    "getting-started": { label: "Getting Started", description: "Set up your account, connect Google Business Profile, and send your first review request.", emoji: "🚀" },
    "reviews": { label: "Reviews", description: "Monitor your inbox, use AI replies, set up auto-commenter, and export reviews.", emoji: "⭐" },
    "campaigns": { label: "Campaigns", description: "Create review request campaigns, manage SMS and email settings, and set up follow-ups.", emoji: "📣" },
    "analytics": { label: "Analytics", description: "Understand your dashboard metrics, read the engagement funnel, and export reports.", emoji: "📊" },
    "billing": { label: "Billing", description: "Manage your subscription, understand usage limits, and change your plan.", emoji: "💳" },
    "integrations": { label: "Integrations", description: "Connect Zapier, use the REST API, embed review widgets, and link external services.", emoji: "🔌" },
};

// ─── Getting Started ─────────────────────────────────────────────────────────

const gs1: HelpArticle = {
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

const gs2: HelpArticle = {
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

const gs3: HelpArticle = {
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

const gs4: HelpArticle = {
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

// ─── Reviews ─────────────────────────────────────────────────────────────────

const rev1: HelpArticle = {
    slug: "reading-your-review-inbox",
    category: "reviews",
    title: "Reading and Managing Your Review Inbox",
    excerpt: "How to use the Zyene review inbox — filtering, sorting, marking as reviewed, and managing reviews across multiple platforms.",
    readMinutes: 3,
    body: [
        { type: "p", text: "Your Zyene review inbox aggregates all reviews from connected platforms (Google, Facebook, Yelp) into a single, sorted view." },
        { type: "h2", text: "Inbox Filters" },
        { type: "ul", items: [
            "Platform: Filter to show only Google, only Facebook, or only Yelp reviews.",
            "Star rating: Filter by star rating to focus on 1-star reviews (requiring urgent attention) or 5-star reviews (to respond to positively).",
            "Status: Filter by Unresponded, Responded, Flagged, or All.",
            "Date range: View reviews from a specific time period.",
            "Location: For multi-location accounts, filter by location.",
        ]},
        { type: "h2", text: "Review Status" },
        { type: "ul", items: [
            "New (orange dot): Review has arrived but hasn't been viewed yet.",
            "Unresponded (grey): Review has been viewed but not yet responded to.",
            "Responded (green): Response has been published.",
            "Flagged (yellow): Review has been flagged for Google's review (suspected fake or policy violation).",
        ]},
        { type: "h2", text: "Bulk Actions" },
        { type: "p", text: "Select multiple reviews to bulk-mark them as reviewed, export them to CSV, or assign them to a team member for response." },
        { type: "tip", text: "Use the 'Unresponded + 1-2 star' filter daily to prioritize urgent reviews. These are the highest-priority responses for protecting your reputation." },
    ],
};

const rev2: HelpArticle = {
    slug: "using-ai-replies",
    category: "reviews",
    title: "Using AI Reply Suggestions",
    excerpt: "How to use Zyene's AI reply feature to generate, edit, and publish professional responses to any review in seconds.",
    readMinutes: 4,
    body: [
        { type: "p", text: "Zyene's AI reply feature generates a professional, contextually appropriate response draft for any review in seconds. Here's how to use it effectively." },
        { type: "h2", text: "Generating an AI Reply" },
        { type: "ol", items: [
            "Open any review in your inbox.",
            "Click the 'AI Reply' button below the review text.",
            "Zyene will generate a response draft based on the review content, your business type, and your configured tone.",
            "Read the draft — it will appear in the response field.",
        ]},
        { type: "h2", text: "Editing and Publishing" },
        { type: "ol", items: [
            "Always personalize the draft: add the reviewer's name and at least one specific detail from their review.",
            "Adjust the tone if needed: make it more formal, warmer, or more specific to your business.",
            "Click 'Publish Reply' to post it directly to Google (or other connected platforms).",
            "The response will appear on your Google Business Profile within seconds.",
        ]},
        { type: "warning", text: "Never publish an AI reply without reading and editing it first. AI-generated responses that are clearly generic (mentioning 'culinary offerings' to a plumber, for example) will undermine your credibility." },
        { type: "h2", text: "Configuring AI Tone" },
        { type: "p", text: "Go to Settings → AI Replies to configure your preferred response tone: Warm & Personal, Professional & Formal, or Casual & Conversational. You can also add brand-specific phrases or context that the AI should incorporate." },
        { type: "h2", text: "AI Reply Limits" },
        { type: "p", text: "AI reply suggestions are available on all paid plans with no monthly limit. On the free trial, AI replies are available with unlimited usage for the duration of your 7-day trial." },
    ],
};

const rev3: HelpArticle = {
    slug: "setting-up-auto-commenter",
    category: "reviews",
    title: "Setting Up the Auto-Commenter",
    excerpt: "The Auto-Commenter automatically publishes AI responses to 4-star and 5-star reviews — so your review inbox stays current even when you're busy.",
    readMinutes: 4,
    body: [
        { type: "p", text: "The Auto-Commenter is a hands-free mode that automatically generates and publishes AI responses to positive reviews without requiring your manual review. It's designed for businesses that receive high review volume and want to maintain 100% response rate with minimal effort." },
        { type: "warning", text: "We recommend enabling Auto-Commenter only for 4-star and 5-star reviews. All 1-3 star reviews should be reviewed manually to ensure the response is appropriate for the specific situation." },
        { type: "h2", text: "Enabling Auto-Commenter" },
        { type: "ol", items: [
            "Go to Settings → AI Replies → Auto-Commenter.",
            "Toggle 'Enable Auto-Commenter' to on.",
            "Select which star ratings to auto-respond to (recommended: 4-star and 5-star only).",
            "Select which locations to enable it for (you can enable per-location).",
            "Click 'Save Settings'.",
        ]},
        { type: "h2", text: "How It Works" },
        { type: "p", text: "When a review matching your criteria arrives, Auto-Commenter generates a response using Zyene's AI (with your configured tone and brand context) and publishes it to your Google Business Profile. The response is logged in your inbox so you can review it after the fact." },
        { type: "h2", text: "Quality Control" },
        { type: "p", text: "Auto-Commenter includes built-in quality controls: responses are never identical across consecutive reviews, each response references a distinct element of the review text when available, and responses never include placeholder text or incomplete phrases." },
        { type: "tip", text: "Even with Auto-Commenter enabled, review your auto-published responses once a week to ensure they're reading naturally. You can always edit a published response by clicking 'Edit Response' in your inbox." },
    ],
};

const rev4: HelpArticle = {
    slug: "exporting-reviews",
    category: "reviews",
    title: "Exporting Your Reviews",
    excerpt: "How to export your reviews to CSV — for reporting, analysis, or importing into other tools.",
    readMinutes: 2,
    body: [
        { type: "p", text: "You can export your review data from Zyene at any time for reporting, analysis, or importing into spreadsheets or other tools." },
        { type: "h2", text: "How to Export" },
        { type: "ol", items: [
            "Go to Reviews → Inbox.",
            "Apply any filters you want (date range, platform, star rating, location).",
            "Click the 'Export' button in the top right of the inbox.",
            "Choose CSV format.",
            "Click 'Export'. The file will download to your browser.",
        ]},
        { type: "h2", text: "What's Included in the Export" },
        { type: "ul", items: [
            "Review date and time",
            "Reviewer name (as shown on Google)",
            "Star rating",
            "Review text",
            "Platform (Google, Facebook, Yelp)",
            "Location (for multi-location accounts)",
            "Response text (if responded)",
            "Response date",
            "Review status",
        ]},
        { type: "tip", text: "The review export is useful for monthly reporting, sharing performance with stakeholders, or analyzing common themes in positive and negative feedback." },
    ],
};

// ─── Campaigns ───────────────────────────────────────────────────────────────

const camp1: HelpArticle = {
    slug: "creating-a-review-request-campaign",
    category: "campaigns",
    title: "Creating a Review Request Campaign",
    excerpt: "How to set up a review request campaign in Zyene — from choosing your audience to configuring timing, message, and channel.",
    readMinutes: 5,
    body: [
        { type: "p", text: "A review request campaign in Zyene is a scheduled or automated sequence of review request messages sent to your customers. Campaigns can be one-time batches (e.g., to your last 90 days of customers) or ongoing automations triggered by each new transaction." },
        { type: "h2", text: "Creating a One-Time Batch Campaign" },
        { type: "ol", items: [
            "Go to Campaigns → New Campaign.",
            "Select 'One-Time Batch'.",
            "Upload your customer list via CSV (required fields: name, phone or email).",
            "Select the message template (or customize your own).",
            "Choose the channel: SMS, Email, or Both.",
            "Set the send time (now or schedule for a specific date/time).",
            "Enable the Negative Feedback Shield if desired.",
            "Review the campaign summary and click 'Launch Campaign'.",
        ]},
        { type: "h2", text: "Creating an Ongoing Automated Campaign" },
        { type: "ol", items: [
            "Go to Campaigns → New Campaign.",
            "Select 'Ongoing Automation'.",
            "Choose your trigger source: Zapier webhook, Square integration, manual API, or scheduled CSV uploads.",
            "Set the send delay (recommended: 1–3 hours after trigger).",
            "Select your message template and channel.",
            "Set follow-up rules (optional: send 1 follow-up after X days if no response).",
            "Click 'Activate Campaign'.",
        ]},
        { type: "tip", text: "Ongoing automated campaigns require a connection to your transaction data source. See the Zapier Integration or Square Integration guides for setup instructions." },
    ],
};

const camp2: HelpArticle = {
    slug: "sms-vs-email-campaigns",
    category: "campaigns",
    title: "SMS vs. Email Campaigns: Which Should You Use?",
    excerpt: "Comparing SMS and email review requests — response rates, best use cases, and when to use both together.",
    readMinutes: 3,
    body: [
        { type: "p", text: "Both SMS and email are effective channels for review requests, but they have different strengths depending on your business type and customer relationship." },
        { type: "table", table: {
            headers: ["Factor", "SMS", "Email"],
            rows: [
                ["Open rate", "98%", "22–28%"],
                ["Review conversion rate", "15–25%", "5–10%"],
                ["Best for", "Restaurants, retail, auto repair, salons", "Healthcare, B2B, high-value services"],
                ["Message length", "Under 160 characters", "3–5 sentences"],
                ["Requires", "Mobile phone number", "Email address"],
                ["Cost", "Uses SMS credits", "Free (within plan)"],
            ],
        }},
        { type: "h2", text: "When to Use SMS" },
        { type: "p", text: "SMS is the highest-converting channel for most local businesses, especially those with quick transaction types (restaurants, retail, auto repair, salons). Use SMS when you have the customer's mobile number and the interaction was completed recently." },
        { type: "h2", text: "When to Use Email" },
        { type: "p", text: "Email is better suited for healthcare, professional services, or situations where you don't have a mobile number. Email also works well for follow-up sequences where SMS may feel intrusive." },
        { type: "h2", text: "Using Both Together" },
        { type: "p", text: "For maximum review collection: send SMS first (within 1–3 hours), then send an email follow-up 5–7 days later to customers who didn't respond to the SMS. This combination typically results in 20–30% review conversion — the highest of any single approach." },
    ],
};

const camp3: HelpArticle = {
    slug: "campaign-templates",
    category: "campaigns",
    title: "Campaign Message Templates",
    excerpt: "How to use, customize, and create your own review request message templates in Zyene.",
    readMinutes: 3,
    body: [
        { type: "p", text: "Zyene includes pre-built message templates for different industries and scenarios. You can use them as-is, customize them, or create your own from scratch." },
        { type: "h2", text: "Accessing Built-In Templates" },
        { type: "ol", items: [
            "Go to Settings → Templates.",
            "Browse the library of SMS and email templates.",
            "Click any template to preview it.",
            "Click 'Use Template' to add it to a campaign.",
        ]},
        { type: "h2", text: "Template Personalization Variables" },
        { type: "p", text: "All templates support the following variables that are automatically replaced with customer data when sent:" },
        { type: "ul", items: [
            "{{first_name}} — Customer's first name",
            "{{business_name}} — Your business name",
            "{{review_link}} — Your unique Google review link",
            "{{location_name}} — The specific location name (for multi-location)",
            "{{date}} — The date of the interaction",
        ]},
        { type: "h2", text: "Creating a Custom Template" },
        { type: "ol", items: [
            "Go to Settings → Templates → New Template.",
            "Choose SMS or Email.",
            "Write your message using the variables above.",
            "Click 'Preview' to see how it will look with sample data.",
            "Click 'Save Template'.",
        ]},
        { type: "tip", text: "The best-converting templates are personal, brief, and include one clear call to action — the review link. Avoid mentioning anything that could be perceived as pressure or incentive." },
    ],
};

const camp4: HelpArticle = {
    slug: "follow-up-messages",
    category: "campaigns",
    title: "Setting Up Follow-Up Messages",
    excerpt: "How to configure automatic follow-up review request messages for customers who didn't respond to the initial request.",
    readMinutes: 3,
    body: [
        { type: "p", text: "A single follow-up message sent 5–7 days after the initial review request typically increases your campaign conversion rate by 30–50%. Zyene can send this automatically." },
        { type: "h2", text: "Configuring Follow-Ups for a Campaign" },
        { type: "ol", items: [
            "When creating or editing a campaign, scroll to the 'Follow-Up' section.",
            "Toggle 'Enable Follow-Up' to on.",
            "Set the follow-up delay (recommended: 5–7 days after the initial send).",
            "Choose the follow-up channel (can be different from the initial — e.g., email follow-up after SMS initial).",
            "Select or customize the follow-up message template.",
            "Set the maximum follow-ups: we recommend 1. More than 2 total messages (initial + 1 follow-up) can feel spammy.",
        ]},
        { type: "h2", text: "Who Receives Follow-Ups" },
        { type: "p", text: "Follow-up messages are only sent to customers who did NOT click the review link in the initial message. Customers who clicked the link (even if they didn't write a review) are automatically excluded from follow-ups." },
        { type: "warning", text: "Only send a maximum of 1 follow-up per customer per transaction. Sending multiple follow-ups dramatically increases opt-out rates and can damage your customer relationship." },
    ],
};

// ─── Analytics ───────────────────────────────────────────────────────────────

const an1: HelpArticle = {
    slug: "understanding-your-analytics-dashboard",
    category: "analytics",
    title: "Understanding Your Analytics Dashboard",
    excerpt: "A full explanation of every metric in your Zyene analytics dashboard — what each number means and how to use it.",
    readMinutes: 5,
    body: [
        { type: "p", text: "The Zyene Analytics dashboard gives you a data-driven view of your review performance and campaign effectiveness. Here's what each metric means." },
        { type: "h2", text: "Review Performance Metrics" },
        { type: "ul", items: [
            "Average Rating: Your current weighted average star rating across all connected platforms. The blue/green/red indicator shows the change vs. 30 days ago.",
            "Total Reviews: All-time review count across connected platforms.",
            "New Reviews (period): Reviews received in the selected time period.",
            "Response Rate: Percentage of all received reviews that have a published response. Target: 100%.",
            "Avg. Response Time: The average time between a review being received and your response being published.",
            "Review Velocity: Chart showing monthly review volume. An upward trend indicates your collection strategy is working.",
        ]},
        { type: "h2", text: "Campaign Performance Metrics" },
        { type: "ul", items: [
            "Requests Sent: Total review requests sent in the period.",
            "Delivered: Requests that were successfully delivered (SMS: not bounced; Email: not bounced).",
            "Opened (Email only): Percentage of email requests that were opened.",
            "Link Clicked: Percentage of recipients who clicked your Google review link.",
            "Reviews Generated: Reviews received within 14 days of a request (attributed).",
            "Conversion Rate: Reviews Generated ÷ Requests Sent.",
        ]},
        { type: "h2", text: "Competitor Comparison" },
        { type: "p", text: "The Competitor section of analytics shows your average rating and review count relative to added competitors. The chart displays ranking changes over time." },
        { type: "tip", text: "A falling conversion rate (reviews generated per request sent) over time can indicate request fatigue — customers receiving too many requests — or an issue with your review link. Check both when you see a decline." },
    ],
};

const an2: HelpArticle = {
    slug: "reading-the-engagement-funnel",
    category: "analytics",
    title: "Reading the Review Request Engagement Funnel",
    excerpt: "How to interpret your review request funnel — from send to delivery to click to review — and identify where you're losing customers.",
    readMinutes: 4,
    body: [
        { type: "p", text: "The Engagement Funnel shows you how customers move through the review request process from initial send to posted review. Each stage of the funnel has a drop-off rate — understanding where drop-off happens tells you where to improve." },
        { type: "h2", text: "Funnel Stages" },
        { type: "ol", items: [
            "Sent: Total requests sent.",
            "Delivered: Requests successfully delivered (subtract bounced messages).",
            "Opened (email only): Messages opened by the recipient.",
            "Clicked: Recipients who clicked the review link.",
            "Visited review page: Recipients who arrived at your Google review page.",
            "Review submitted: Recipients who completed and submitted a review.",
        ]},
        { type: "h2", text: "Interpreting Drop-Off" },
        { type: "table", table: {
            headers: ["Low Rate At This Stage", "Likely Cause", "Fix"],
            rows: [
                ["Delivered", "Wrong phone/email, bounced", "Clean your customer contact list"],
                ["Opened (email)", "Subject line not compelling", "Test different subject lines"],
                ["Clicked", "Message not personalized, wrong timing", "Improve message copy, adjust send timing"],
                ["Review submitted", "Friction on the review page, Google sign-in barrier", "Check your review link works on mobile; consider the Shield flow"],
            ],
        }},
        { type: "tip", text: "Most businesses lose the most conversions at the 'Clicked → Review Submitted' stage, primarily because Google requires a signed-in Google account to leave a review. Your only control here is timing — requests sent while the customer experience is fresh have higher submit rates." },
    ],
};

const an3: HelpArticle = {
    slug: "generating-pdf-reports",
    category: "analytics",
    title: "Generating PDF Reports",
    excerpt: "How to generate and download PDF performance reports to share with stakeholders, clients, or your team.",
    readMinutes: 2,
    body: [
        { type: "p", text: "Zyene can generate PDF performance reports summarizing your review performance, campaign results, and competitor comparison for any date range." },
        { type: "h2", text: "How to Generate a Report" },
        { type: "ol", items: [
            "Go to Analytics in the left navigation.",
            "Set your desired date range using the date picker.",
            "Click 'Export Report' in the top right.",
            "Choose 'PDF Report'.",
            "The PDF will generate and download automatically.",
        ]},
        { type: "h2", text: "What's Included in the PDF Report" },
        { type: "ul", items: [
            "Period summary: review count, average rating, change vs. previous period",
            "Review velocity chart",
            "Campaign performance: requests sent, conversion rate, reviews generated",
            "Response rate and average response time",
            "Competitor comparison snapshot",
            "Top positive and negative review themes (if AI analysis is enabled)",
        ]},
        { type: "tip", text: "For agencies or multi-location businesses, enable white-label reporting in Settings to include your brand name and logo on generated reports." },
    ],
};

// ─── Billing ─────────────────────────────────────────────────────────────────

const bill1: HelpArticle = {
    slug: "plans-and-pricing",
    category: "billing",
    title: "Plans and Pricing",
    excerpt: "Overview of Zyene's subscription plans — what's included in each, pricing, and which plan is right for your business.",
    readMinutes: 3,
    body: [
        { type: "p", text: "Zyene offers three subscription tiers designed for different business sizes. All plans include the core features: review monitoring, AI replies, review requests, the Negative Feedback Shield, competitor tracking, and GBP keyword performance." },
        { type: "table", table: {
            headers: ["Feature", "Starter", "Professional", "Enterprise"],
            rows: [
                ["Price", "$29.99/mo", "$59.99/mo", "Contact us"],
                ["Locations", "1", "Up to 3", "Unlimited"],
                ["AI reply suggestions", "Unlimited", "Unlimited", "Unlimited"],
                ["Review requests (SMS/email)", "500/mo", "700/mo per location", "Custom"],
                ["Team members", "Up to 5", "Up to 15", "Unlimited"],
                ["REST API access", "✓", "✓", "✓"],
                ["White-label reports", "✗", "✓", "✓"],
                ["Dedicated support", "✗", "✗", "✓"],
            ],
        }},
        { type: "h2", text: "Which Plan Is Right for You?" },
        { type: "ul", items: [
            "Starter ($29.99/mo): Best for single-location businesses. Includes all core features — AI replies, review requests, Shield, competitor tracking, and API.",
            "Professional ($59.99/mo): Best for businesses with 2–3 locations. Includes white-label reporting and higher request volume.",
            "Enterprise (contact us): Best for 4+ location businesses, franchises, or agencies. Unlimited locations, custom request volume, dedicated support.",
        ]},
        { type: "tip", text: "Start with the 7-day free trial — you get full access to all features regardless of plan. Upgrade to a paid plan before day 7 to continue without interruption." },
    ],
};

const bill2: HelpArticle = {
    slug: "upgrading-your-plan",
    category: "billing",
    title: "Upgrading or Changing Your Plan",
    excerpt: "How to upgrade from your current plan to a higher tier, or switch between monthly and annual billing.",
    readMinutes: 2,
    body: [
        { type: "p", text: "You can upgrade or change your plan at any time from your account settings." },
        { type: "h2", text: "How to Upgrade" },
        { type: "ol", items: [
            "Go to Settings → Billing.",
            "Click 'Change Plan'.",
            "Select the new plan.",
            "Review the pricing and click 'Confirm Upgrade'.",
            "If upgrading mid-cycle, you'll be charged a prorated amount for the remaining days in your billing period.",
        ]},
        { type: "h2", text: "Annual vs. Monthly Billing" },
        { type: "p", text: "All Zyene plans are available month-to-month. Annual billing is not required. If you choose annual billing, you receive a 20% discount on the monthly rate." },
        { type: "h2", text: "Downgrading" },
        { type: "p", text: "To downgrade to a lower plan, go to Settings → Billing → Change Plan and select the lower tier. Downgrades take effect at the end of your current billing period." },
    ],
};

const bill3: HelpArticle = {
    slug: "understanding-usage-limits",
    category: "billing",
    title: "Understanding Usage Limits",
    excerpt: "How SMS credits, review request limits, and team member limits work in Zyene — and what happens when you reach them.",
    readMinutes: 3,
    body: [
        { type: "p", text: "Zyene plans include usage limits for certain high-cost features, primarily SMS review requests. Here's how limits work and what happens when you reach them." },
        { type: "h2", text: "SMS Review Request Credits" },
        { type: "ul", items: [
            "Starter: 500 SMS credits per month, per account",
            "Professional: 700 SMS credits per month, per location",
            "Enterprise: Custom allocation",
            "Credits reset on the 1st of each billing month",
            "Unused credits do not roll over to the next month",
        ]},
        { type: "h2", text: "What Happens When You Run Out of SMS Credits" },
        { type: "p", text: "When your SMS credits are exhausted for the month, Zyene will automatically switch to email-only delivery for any remaining campaigns in that billing period. You'll receive a notification in your dashboard and via email when you're at 80% and 100% of your credit usage." },
        { type: "h2", text: "Email Review Requests" },
        { type: "p", text: "Email review requests do not consume SMS credits and are not separately limited on any plan. You can send unlimited email review requests." },
        { type: "h2", text: "Team Members" },
        { type: "ul", items: [
            "Starter: Up to 5 team members",
            "Professional: Up to 15 team members",
            "Enterprise: Unlimited",
            "Inviting a team member who exceeds your limit will prompt an upgrade notification.",
        ]},
        { type: "tip", text: "You can monitor your current SMS credit usage in Settings → Billing → Usage. The usage meter shows credits used, remaining, and resets on your billing date." },
    ],
};

const bill4: HelpArticle = {
    slug: "canceling-your-subscription",
    category: "billing",
    title: "Canceling Your Subscription",
    excerpt: "How to cancel your Zyene subscription — what happens to your data, when billing stops, and how to reactivate if you change your mind.",
    readMinutes: 2,
    body: [
        { type: "p", text: "We don't make cancellation difficult. Here's exactly how to cancel and what to expect." },
        { type: "h2", text: "How to Cancel" },
        { type: "ol", items: [
            "Go to Settings → Billing.",
            "Click 'Cancel Subscription'.",
            "Select a cancellation reason (optional but helps us improve).",
            "Confirm the cancellation.",
        ]},
        { type: "h2", text: "What Happens After Cancellation" },
        { type: "ul", items: [
            "Your subscription remains active until the end of your current billing period. You won't be charged again after that.",
            "Your data — reviews, campaign history, analytics — is retained for 90 days after cancellation. You can export it at any time during this period.",
            "After 90 days, your data is permanently deleted in accordance with our data retention policy.",
            "Your Google Business Profile connection is deauthorized and review responses from Zyene remain unchanged on Google.",
        ]},
        { type: "h2", text: "Reactivating Your Account" },
        { type: "p", text: "If you change your mind, you can reactivate your account at any time within the 90-day retention window. Log back in, go to Settings → Billing, and click 'Reactivate Subscription'. All your data will be restored." },
        { type: "tip", text: "If you're canceling because of cost, consider downgrading to a lower plan rather than canceling entirely. You keep your review history and campaign automation — just with lower limits." },
    ],
};

// ─── Integrations ────────────────────────────────────────────────────────────

const int1: HelpArticle = {
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

const int2: HelpArticle = {
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

const int3: HelpArticle = {
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

const int4: HelpArticle = {
    slug: "embedding-review-widgets",
    category: "integrations",
    title: "Embedding Review Widgets on Your Website",
    excerpt: "How to add a review carousel or star rating badge to your website using Zyene's embeddable widgets.",
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

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export const HELP_ARTICLES: HelpArticle[] = [
    gs1, gs2, gs3, gs4,
    rev1, rev2, rev3, rev4,
    camp1, camp2, camp3, camp4,
    an1, an2, an3,
    bill1, bill2, bill3, bill4,
    int1, int2, int3, int4,
];

export const HELP_ARTICLE_MAP: Record<string, HelpArticle> = Object.fromEntries(
    HELP_ARTICLES.map((a) => [a.slug, a])
);

export const HELP_SLUGS = HELP_ARTICLES.map((a) => a.slug);

export const HELP_BY_CATEGORY: Record<HelpCategory, HelpArticle[]> = {
    "getting-started": [gs1, gs2, gs3, gs4],
    "reviews": [rev1, rev2, rev3, rev4],
    "campaigns": [camp1, camp2, camp3, camp4],
    "analytics": [an1, an2, an3],
    "billing": [bill1, bill2, bill3, bill4],
    "integrations": [int1, int2, int3, int4],
};

/** URL segment for category hub pages: /help/{category} */
export const HELP_CATEGORY_SLUGS: HelpCategory[] = [
    "getting-started",
    "reviews",
    "campaigns",
    "analytics",
    "billing",
    "integrations",
];

export function isHelpCategory(slug: string): slug is HelpCategory {
    return (HELP_CATEGORY_SLUGS as string[]).includes(slug);
}

/** Canonical nested article URL per blueprint: /help/{category}/{article} */
export function helpArticleNestedPath(article: HelpArticle): string {
    return `/help/${article.category}/${article.slug}`;
}
