import { BLOG_POSTS } from "@/lib/content/blog-data";
import { blogAuthorSlug, isTeamAuthor } from "@/lib/content/blog-authors";
import { BLOG_AUTHOR_PROFILES, type BlogAuthorProfile } from "@/lib/content/blog-author-profiles";
import type { BlogAuthor, BlogPost } from "@/lib/content/blog-types";

export interface BlogAuthorPage extends BlogAuthorProfile {
    slug: string;
    author: BlogAuthor;
    /** Newest first. */
    posts: BlogPost[];
    /** Latest publish or update date across the author's posts. */
    lastModified: string;
}

function buildAuthorPages(): BlogAuthorPage[] {
    const bySlug = new Map<string, BlogAuthorPage>();
    for (const post of BLOG_POSTS) {
        if (isTeamAuthor(post.author)) continue;
        const slug = blogAuthorSlug(post.author.name);
        const postDate = post.dateModified ?? post.publishedAt;
        const page = bySlug.get(slug);
        if (page) {
            page.posts.push(post);
            if (postDate > page.lastModified) page.lastModified = postDate;
        } else {
            bySlug.set(slug, { slug, author: post.author, posts: [post], lastModified: postDate, ...BLOG_AUTHOR_PROFILES[slug] });
        }
    }
    const pages = [...bySlug.values()];
    for (const page of pages) page.posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return pages;
}

/** One page per named blog author (the team byline has none). */
export const BLOG_AUTHOR_PAGES: BlogAuthorPage[] = buildAuthorPages();

export const BLOG_AUTHOR_PAGE_MAP: Record<string, BlogAuthorPage> = Object.fromEntries(
    BLOG_AUTHOR_PAGES.map((page) => [page.slug, page]),
);
