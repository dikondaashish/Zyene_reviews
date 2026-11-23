/**
 * Verified details for each blog author, keyed by author slug (see blogAuthorSlug).
 *
 * Only add facts the author has confirmed: a short bio in their own words and links to
 * profiles they control (LinkedIn, personal site). These feed the author page and the
 * Person structured data, so nothing here may be invented.
 */
export interface BlogAuthorProfile {
    /** Two or three sentences on the author's background and experience. */
    bio?: string;
    /** Public profile URLs the author controls, e.g. LinkedIn. */
    sameAs?: string[];
}

export const BLOG_AUTHOR_PROFILES: Record<string, BlogAuthorProfile> = {};
