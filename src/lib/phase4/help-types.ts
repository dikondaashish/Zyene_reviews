/**
 * Help center type definitions and category constants — Phase 4.
 * ContentSection is re-used from blog-types for article body rendering.
 */

import type { ContentSection } from "./blog-types";

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
