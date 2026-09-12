/**
 * Help center type definitions and category constants - Phase 4.
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

export const HELP_CATEGORIES: Record<HelpCategory, { label: string; description: string }> = {
    "getting-started": {
        label: "Getting Started",
        description:
            "Set up Zyene Reviews, connect Google Business Profile, send your first review request, and learn the dashboard in minutes.",
    },
    "reviews": {
        label: "Reviews",
        description:
            "Monitor your unified review inbox, publish AI replies, configure automatic Google replies, and export reviews for reporting.",
    },
    "campaigns": {
        label: "Campaigns",
        description:
            "Create SMS and email review request campaigns, customize templates, schedule follow-ups, and improve conversion rates.",
    },
    "analytics": {
        label: "Analytics",
        description:
            "Understand dashboard metrics, read the review request funnel, export CSV data, and share PDF performance reports.",
    },
    "billing": {
        label: "Billing",
        description:
            "Compare plans, upgrade or downgrade, understand SMS credits and usage limits, and manage your subscription billing.",
    },
    "integrations": {
        label: "Integrations",
        description:
            "Connect Google, Zapier, and the REST API, embed review widgets on your site, and automate review requests from your stack.",
    },
};
