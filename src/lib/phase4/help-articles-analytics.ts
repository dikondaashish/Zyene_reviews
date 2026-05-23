/**
 * Help articles — Analytics (an1–an3).
 */

import type { HelpArticle } from "./help-types";

export const an1: HelpArticle = {
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

export const an2: HelpArticle = {
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

export const an3: HelpArticle = {
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
