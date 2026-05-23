/**
 * Help articles — Reviews (rev1–rev4).
 */

import type { HelpArticle } from "./help-types";

export const rev1: HelpArticle = {
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

export const rev2: HelpArticle = {
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

export const rev3: HelpArticle = {
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

export const rev4: HelpArticle = {
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
