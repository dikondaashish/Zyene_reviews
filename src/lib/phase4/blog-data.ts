/**
 * Blog data barrel — Phase 4.
 * Re-exports types, aggregates all 12 posts, and exposes lookup maps.
 */

export type { ContentPillar, SectionType, TableData, ContentSection, BlogPost } from "./blog-types";
import type { ContentPillar, BlogPost } from "./blog-types";

import { post1, post2, post3, post4 } from "./blog-posts-month1";
import { post5, post6, post7, post8 } from "./blog-posts-month2";
import { post9, post10, post11, post12 } from "./blog-posts-month3";

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export const BLOG_POSTS: BlogPost[] = [
    post1, post2, post3, post4,
    post5, post6, post7, post8,
    post9, post10, post11, post12,
];

export const BLOG_POST_MAP: Record<string, BlogPost> = Object.fromEntries(
    BLOG_POSTS.map((p) => [p.slug, p])
);

export const BLOG_SLUGS = BLOG_POSTS.map((p) => p.slug);

export const PILLAR_LABELS: Record<ContentPillar, string> = {
    "google-reviews": "Google Reviews",
    "responding-to-reviews": "Responding to Reviews",
    "local-seo": "Local SEO",
    "reputation-management": "Reputation Management",
    "industry-specific": "Industry Specific",
    "competitor-analysis": "Competitor Analysis",
};

export const PILLAR_COLORS: Record<ContentPillar, string> = {
    "google-reviews": "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    "responding-to-reviews": "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
    "local-seo": "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20",
    "reputation-management": "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20",
    "industry-specific": "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20",
    "competitor-analysis": "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
};
