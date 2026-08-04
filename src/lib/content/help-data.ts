/**
 * Help data barrel — Phase 4.
 * Re-exports types, aggregates all 23 articles, and exposes lookup maps/utilities.
 */

export type { HelpCategory, HelpArticle } from "./help-types";
export { HELP_CATEGORIES } from "./help-types";
import type { HelpCategory, HelpArticle } from "./help-types";

import { gs1, gs2, gs3, gs4 } from "./help-articles-getting-started";
import { rev1, rev2, rev3, rev4 } from "./help-articles-reviews";
import { camp1, camp2, camp3, camp4 } from "./help-articles-campaigns";
import { an1, an2, an3 } from "./help-articles-analytics";
import { bill1, bill2, bill3, bill4 } from "./help-articles-billing";
import { int1, int2, int3, int4 } from "./help-articles-integrations";

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export const HELP_ARTICLES: HelpArticle[] = [
    gs1, gs2, gs3, gs4,
    rev1, rev2, rev3, rev4,
    camp1, camp2, camp3, camp4,
    an1, an2, an3,
    bill1, bill2, bill3, bill4,
    int1, int2, int3, int4,
];

export const HELP_ARTICLE_MAP: Record<string, HelpArticle> = Object.fromEntries(
    HELP_ARTICLES.map((a) => [a.slug, a])
);

export const HELP_SLUGS = HELP_ARTICLES.map((a) => a.slug);

export const HELP_BY_CATEGORY: Record<HelpCategory, HelpArticle[]> = {
    "getting-started": [gs1, gs2, gs3, gs4],
    "reviews": [rev1, rev2, rev3, rev4],
    "campaigns": [camp1, camp2, camp3, camp4],
    "analytics": [an1, an2, an3],
    "billing": [bill1, bill2, bill3, bill4],
    "integrations": [int1, int2, int3, int4],
};

/** URL segment for category hub pages: /help/{category} */
export const HELP_CATEGORY_SLUGS: HelpCategory[] = [
    "getting-started",
    "reviews",
    "campaigns",
    "analytics",
    "billing",
    "integrations",
];

export function isHelpCategory(slug: string): slug is HelpCategory {
    return (HELP_CATEGORY_SLUGS as string[]).includes(slug);
}

/** Canonical nested article URL per blueprint: /help/{category}/{article} */
export function helpArticleNestedPath(article: HelpArticle): string {
    return `/help/${article.category}/${article.slug}`;
}
