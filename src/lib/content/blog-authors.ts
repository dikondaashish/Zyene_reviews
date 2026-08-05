import type { BlogAuthor } from "@/lib/content/blog-types";

export const DEFAULT_BLOG_AUTHOR: BlogAuthor = {
    name: "Zyene Team",
    role: "Editorial",
};

export function resolveBlogAuthor(author?: Partial<BlogAuthor>): BlogAuthor {
    return {
        name: author?.name?.trim() || DEFAULT_BLOG_AUTHOR.name,
        role: author?.role?.trim() || DEFAULT_BLOG_AUTHOR.role,
        avatarUrl: author?.avatarUrl,
    };
}

export function blogAuthorInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "ZR";
    if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
    return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}
