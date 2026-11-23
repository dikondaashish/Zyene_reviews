import type { BlogAuthor } from "@/lib/content/blog-types";

export const DEFAULT_BLOG_AUTHOR: BlogAuthor = {
    name: "Zyene Reviews Team",
    role: "Editorial",
};

export function resolveBlogAuthor(author?: Partial<BlogAuthor>): BlogAuthor {
    return {
        name: author?.name?.trim() || DEFAULT_BLOG_AUTHOR.name,
        role: author?.role?.trim() || DEFAULT_BLOG_AUTHOR.role,
        avatarUrl: author?.avatarUrl,
    };
}

/** True for the shared editorial byline, which is an organization rather than a person. */
export function isTeamAuthor(author: Pick<BlogAuthor, "name">): boolean {
    return author.name.trim() === DEFAULT_BLOG_AUTHOR.name;
}

/** URL slug for an author page, e.g. "Dr. Elena Rostova" -> "dr-elena-rostova". */
export function blogAuthorSlug(name: string): string {
    return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Path of the author's page, or null for the team byline (no personal page). */
export function blogAuthorPath(author: Pick<BlogAuthor, "name">): string | null {
    return isTeamAuthor(author) ? null : `/blog/author/${blogAuthorSlug(author.name)}`;
}

export function blogAuthorInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "ZR";
    if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
    return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}
