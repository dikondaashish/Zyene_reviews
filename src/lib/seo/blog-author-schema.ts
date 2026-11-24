import { blogAuthorPath, blogAuthorSlug, isTeamAuthor } from "@/lib/content/blog-authors";
import { BLOG_AUTHOR_PROFILES } from "@/lib/content/blog-author-profiles";
import type { BlogAuthor } from "@/lib/content/blog-types";
import { JSON_LD_BASE_URL, JSON_LD_ORGANIZATION_ID } from "@/components/seo/json-ld-constants";

/** schema.org author for a blog post: a Person linked to their author page, or the organization for the team byline. */
export function buildBlogAuthorSchema(author: BlogAuthor): Record<string, unknown> {
    if (isTeamAuthor(author)) {
        return { "@type": "Organization", "@id": JSON_LD_ORGANIZATION_ID, name: author.name };
    }
    const url = `${JSON_LD_BASE_URL}${blogAuthorPath(author)}`;
    const profile = BLOG_AUTHOR_PROFILES[blogAuthorSlug(author.name)];
    return {
        "@type": "Person",
        "@id": `${url}#person`,
        name: author.name,
        jobTitle: author.role,
        url,
        ...(profile?.bio ? { description: profile.bio } : {}),
        ...(profile?.sameAs?.length ? { sameAs: profile.sameAs } : {}),
    };
}
