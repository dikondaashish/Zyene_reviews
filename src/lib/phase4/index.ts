/** @module phase4 — Content marketing: blog posts, help center articles, and resource guides. */

export {
    BLOG_POSTS, BLOG_POST_MAP, BLOG_SLUGS,
    PILLAR_LABELS, PILLAR_COLORS,
} from "./blog-data";
export type { ContentPillar, SectionType, TableData, ContentSection, BlogPost } from "./blog-types";

export {
    HELP_ARTICLES, HELP_ARTICLE_MAP, HELP_SLUGS,
    HELP_BY_CATEGORY, HELP_CATEGORY_SLUGS, HELP_CATEGORIES,
    isHelpCategory, helpArticleNestedPath,
} from "./help-data";
export type { HelpCategory, HelpArticle } from "./help-types";

export {
    RESOURCE_GUIDES, RESOURCE_MAP, RESOURCE_SLUGS,
} from "./resource-data";
export type { ResourceGuide } from "./resource-data";
