/**
 * Blog data barrel - Phase 4.
 * Re-exports types, aggregates every post in ./blog-posts, and exposes lookup maps.
 */

export type {
    ContentPillar,
    SectionType,
    TableData,
    ContentSection,
    BlogPost,
    BlogPostSource,
    BlogAuthor,
    BlogFaq,
} from "./blog-types";
export { DEFAULT_BLOG_AUTHOR, resolveBlogAuthor, blogAuthorInitials } from "./blog-authors";
export { BLOG_IMAGES, getBlogImage } from "./blog-images";
import type { ContentPillar, BlogPost } from "./blog-types";
import { BLOG_IMAGES } from "./blog-images";
import { BLOG_POST_SOURCES } from "./blog-posts";
import { estimateReadMinutes } from "./blog-read-time";

export const BLOG_POSTS: BlogPost[] = BLOG_POST_SOURCES.map((post) => ({
    ...post,
    readMinutes: estimateReadMinutes(post),
    image: BLOG_IMAGES[post.slug],
}));

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
