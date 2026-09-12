/**
 * Help articles - Reviews (rev1-rev4).
 */

import type { HelpArticle } from "./help-types";

export const rev1: HelpArticle = {
    slug: "reading-your-review-inbox",
    category: "reviews",
    title: "Reading and Managing Your Review Inbox",
    excerpt: "How to use the Zyene review inbox - filtering, sorting, marking as reviewed, and managing reviews across multiple platforms.",
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
    excerpt: "Generate a business reply, choose your tone, edit the draft, and publish it to Google from your review inbox.",
    readMinutes: 3,
    body: [
        { type: "p", text: "AI reply suggestions help you write a response while keeping individual publishing decisions with your team. Automatic Google replies are a separate, optional mode." },
        { type: "h2", text: "Generate and edit a reply" },
        { type: "ol", items: [
            "Select the business you want to manage and open Reviews.",
            "Choose an unanswered Google review and use its AI reply action.",
            "Choose Professional, Friendly, or Concise, then read the generated draft.",
            "Edit the response for accuracy and add any context that is appropriate to share publicly.",
            "Publish the reply to Google and check the result in your inbox.",
        ]},
        { type: "tip", text: "Use a draft you review yourself when a complaint or sensitive situation needs your personal attention. Facebook and Yelp are monitoring connections; respond on those platforms directly." },
        { type: "h2", text: "Are AI business replies limited?" },
        { type: "p", text: "Starter, Professional, and Enterprise include business reply suggestions and automatic Google replies without a monthly quota while the subscription or trial is active. Customer review drafts in the review-request flow have a separate plan allowance." },
        { type: "h2", text: "Can Zyene publish replies automatically?" },
        { type: "p", text: "Yes. In Reviews, configure the Automatic Google replies controls for the selected business. Automatic mode publishes eligible new replies without individual approval. Existing reviews are excluded." },
        { type: "cta", ctaLabel: "Set up automatic Google replies", ctaHref: "/help/reviews/setting-up-auto-commenter" },
    ],
};

export const rev3: HelpArticle = {
    slug: "setting-up-auto-commenter",
    category: "reviews",
    title: "Setting Up Automatic Google Replies",
    excerpt: "Set up automatic Google replies: choose a star-rating threshold and tone, then enable publishing for your selected business.",
    readMinutes: 4,
    body: [
        { type: "p", text: "Automatic Google replies (previously called Auto-Commenter or auto reply) write and publish responses to eligible new, unanswered Google reviews. You choose the settings for each selected business." },
        { type: "h2", text: "How do I turn on automatic Google replies?" },
        { type: "ol", items: [
            "Select the business you want to manage and open Reviews. Make sure its Google Business Profile is connected.",
            "Find Automatically publish AI replies to Google above the review inbox.",
            "Choose Reviews to reply to: 3 stars and up, 4 stars and up, or 5 stars only.",
            "Choose your reply tone: Professional, Friendly, or Concise.",
            "Turn on the switch, read the confirmation, and confirm automatic publishing for the selected business.",
        ]},
        { type: "warning", text: "Automatic mode publishes publicly to Google without asking you to approve each response. Use manual drafts for reviews that need individual judgment, and periodically check your published replies." },
        { type: "h2", text: "Which reviews will receive a reply?" },
        { type: "p", text: "Eligible new Google reviews that arrive after you enable the feature, have no response, and meet your chosen star threshold. Existing reviews are excluded. Facebook and Yelp reviews do not receive automatic replies from Zyene." },
        { type: "h2", text: "Which plans include it?" },
        { type: "p", text: "Starter, Professional, and Enterprise include automatic Google replies with no monthly business-reply quota while the subscription or trial is active. Customer review-draft allowances are separate." },
        { type: "h2", text: "How do I change settings or stop it?" },
        { type: "p", text: "Return to Reviews for the same business. Changes to the tone and rating threshold save when selected. Turn the switch off to stop new automatic-reply processing. A reply already being processed may still finish; turning the feature off does not remove published replies." },
        { type: "h2", text: "Why was a review not answered?" },
        { type: "p", text: "Check that automatic replies are enabled for the correct business, its Google connection works, and the subscription or trial is active. The review must be new, unanswered, and meet the rating threshold. Processing happens after review sync, not necessarily the moment a customer posts. Reviews more than 14 days old are excluded; check your inbox for reviews needing manual follow-up." },
        { type: "cta", ctaLabel: "Explore AI drafts and automatic Google replies", ctaHref: "/features/ai-replies" },
    ],
};

export const rev4: HelpArticle = {
    slug: "exporting-reviews",
    category: "reviews",
    title: "Exporting Your Reviews",
    excerpt:
        "Export your Zyene reviews to CSV for reporting, analysis, or importing into spreadsheets and other business tools.",
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
