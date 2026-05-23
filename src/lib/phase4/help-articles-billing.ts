/**
 * Help articles — Billing (bill1–bill4).
 */

import type { HelpArticle } from "./help-types";

export const bill1: HelpArticle = {
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

export const bill2: HelpArticle = {
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

export const bill3: HelpArticle = {
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

export const bill4: HelpArticle = {
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
