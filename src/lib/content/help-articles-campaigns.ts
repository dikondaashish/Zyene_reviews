/**
 * Help articles - Campaigns (camp1-camp4).
 */

import type { HelpArticle } from "./help-types";

export const camp1: HelpArticle = {
    slug: "creating-a-review-request-campaign",
    category: "campaigns",
    title: "Creating a Review Request Campaign",
    excerpt: "How to set up a review request campaign in Zyene - from choosing your audience to configuring timing, message, and channel.",
    readMinutes: 5,
    body: [
        { type: "p", text: "A campaign groups review-request messages, timing, and eligible contacts for the active business. Creating a campaign and queueing requests are separate actions." },
        { type: "h2", text: "Create and Review a Campaign" },
        { type: "ol", items: [
            "Check the active business, then go to Campaigns → New Campaign.",
            "In Basics, name the campaign, choose SMS, Email, or Both, and select an available trigger. After Payment is not currently available here.",
            "In Message, personalize the templates. The preview uses your business and a clearly labeled sample customer.",
            "In Timing, review the send delay, scheduling options, and optional follow-up.",
            "In Review & Launch, choose eligible customers and inspect the audience count, message, and timezone. Opted-out and explicitly tagged test contacts are excluded.",
            "Use Queue for customers to begin sending to your selection. Creating or saving the campaign alone does not send requests or retain that selection.",
            "Open the campaign details to inspect contact statuses and delivery results. Queued does not mean delivered, and a Google link visit does not confirm a published review.",
        ]},
        { type: "h2", text: "Import Contacts or Connect an Automation" },
        { type: "p", text: "Import contacts from Customers using the downloadable CSV template, then return to the campaign to choose the audience. For requests triggered by another application, follow the Zapier/API integration guide and verify the supported trigger and destination before enabling it." },
        { type: "tip", text: "If a send attempt reports a partial failure, inspect contact statuses before retrying. Do not create a duplicate campaign to retry an existing one." },
    ],
};

export const camp2: HelpArticle = {
    slug: "sms-vs-email-campaigns",
    category: "campaigns",
    title: "SMS vs. Email Campaigns: Which Should You Use?",
    excerpt: "Comparing SMS and email review requests - response rates, best use cases, and when to use both together.",
    readMinutes: 3,
    body: [
        { type: "p", text: "Both SMS and email are effective channels for review requests, but they have different strengths depending on your business type and customer relationship." },
        { type: "table", table: {
            headers: ["Factor", "SMS", "Email"],
            rows: [
                ["Format", "Short, direct message", "Room for more context"],
                ["Measure", "Delivery and link engagement", "Delivery and link engagement"],
                ["Best for", "Restaurants, retail, auto repair, salons", "Healthcare, B2B, high-value services"],
                ["Message length", "Under 160 characters", "3-5 sentences"],
                ["Requires", "Mobile phone number", "Email address"],
                ["Cost", "Uses SMS credits", "Free (within plan)"],
            ],
        }},
        { type: "h2", text: "When to Use SMS" },
        { type: "p", text: "SMS suits short follow-ups after a completed transaction. Compare results using your own audience and message history. Use SMS when you have the customer's mobile number and the interaction was completed recently." },
        { type: "h2", text: "When to Use Email" },
        { type: "p", text: "Email is better suited for healthcare, professional services, or situations where you don't have a mobile number. Email also works well for follow-up sequences where SMS may feel intrusive." },
        { type: "h2", text: "Using Both Together" },
        { type: "p", text: "If a customer has agreed to both channels, you can send an initial request and one later follow-up. Avoid duplicate reminders and respect opt-outs. Measure delivery and link engagement separately from published reviews; a Google link click does not confirm publication." },
    ],
};

export const camp3: HelpArticle = {
    slug: "campaign-templates",
    category: "campaigns",
    title: "Campaign Message Templates",
    excerpt:
        "Use, customize, and create review request message templates in Zyene for SMS and email - tone, timing, and branding tips included.",
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
            "{{first_name}} - Customer's first name",
            "{{business_name}} - Your business name",
            "{{review_link}} - Your unique Google review link",
            "{{location_name}} - The specific location name (for multi-location)",
            "{{date}} - The date of the interaction",
        ]},
        { type: "h2", text: "Creating a Custom Template" },
        { type: "ol", items: [
            "Go to Settings → Templates → New Template.",
            "Choose SMS or Email.",
            "Write your message using the variables above.",
            "Click 'Preview' to see how it will look with sample data.",
            "Click 'Save Template'.",
        ]},
        { type: "tip", text: "The best-converting templates are personal, brief, and include one clear call to action - the review link. Avoid mentioning anything that could be perceived as pressure or incentive." },
    ],
};

export const camp4: HelpArticle = {
    slug: "follow-up-messages",
    category: "campaigns",
    title: "Setting Up Follow-Up Messages",
    excerpt:
        "Configure automatic follow-up review request messages for customers who did not respond to your first SMS or email request.",
    readMinutes: 3,
    body: [
        { type: "p", text: "A single follow-up message sent 5-7 days after the initial review request typically increases your campaign conversion rate by 30-50%. Zyene can send this automatically." },
        { type: "h2", text: "Configuring Follow-Ups for a Campaign" },
        { type: "ol", items: [
            "When creating or editing a campaign, scroll to the 'Follow-Up' section.",
            "Toggle 'Enable Follow-Up' to on.",
            "Set the follow-up delay (recommended: 5-7 days after the initial send).",
            "Choose the follow-up channel (can be different from the initial - e.g., email follow-up after SMS initial).",
            "Select or customize the follow-up message template.",
            "Set the maximum follow-ups: we recommend 1. More than 2 total messages (initial + 1 follow-up) can feel spammy.",
        ]},
        { type: "h2", text: "Who Receives Follow-Ups" },
        { type: "p", text: "Follow-up messages are only sent to customers who did NOT click the review link in the initial message. Customers who clicked the link (even if they didn't write a review) are automatically excluded from follow-ups." },
        { type: "warning", text: "Only send a maximum of 1 follow-up per customer per transaction. Sending multiple follow-ups dramatically increases opt-out rates and can damage your customer relationship." },
    ],
};
