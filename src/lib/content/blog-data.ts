/**
 * Blog data barrel — Phase 4.
 * Re-exports types, aggregates all 12 posts, and exposes lookup maps.
 */

export type {
    ContentPillar,
    SectionType,
    TableData,
    ContentSection,
    BlogPost,
    BlogAuthor,
    BlogFaq,
} from "./blog-types";
export { DEFAULT_BLOG_AUTHOR, resolveBlogAuthor, blogAuthorInitials } from "./blog-authors";
import type { ContentPillar, BlogPost } from "./blog-types";

import { post1, post2, post3, post4 } from "./blog-posts-month1";
import { post5, post6, post7, post8 } from "./blog-posts-month2";
import { post9, post10, post11, post12 } from "./blog-posts-month3";
import { post13 } from "./blog-posts-shield";
import { post14 } from "./blog-posts-ai-visibility";
import { post15 } from "./blog-posts-positive-reviews";

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export const BLOG_POSTS: BlogPost[] = [
    post1, post2, post3, post4,
    post5, post6, post7, post8,
    post9, post10, post11, post12,
    post13, post14, post15,
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
    "google-reviews": "text-chart-1 bg-chart-1/10 border-chart-1/20",
    "responding-to-reviews": "text-sync-action bg-sync-action/10 border-sync-action/20",
    "local-seo": "text-chart-2 bg-chart-2/10 border-chart-2/20",
    "reputation-management": "text-destructive bg-destructive/10 border-destructive/20",
    "industry-specific": "text-primary bg-primary/10 border-primary/20",
    "competitor-analysis": "text-chart-4 bg-chart-4/10 border-chart-4/20",
};
