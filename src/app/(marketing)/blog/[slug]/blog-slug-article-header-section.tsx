import Link from "next/link";
import { CalendarDays, Clock, RefreshCw, Slash } from "lucide-react";
import { PILLAR_LABELS } from "@/lib/content/blog-data";
import type { BlogPost } from "@/lib/content/blog-types";
import { BlogAuthorByline } from "@/components/marketing/blog-author-byline";
import { formatBlogPublishedDate } from "@/lib/content/format-blog-date";

export function BlogSlugArticleHeaderSection({ post }: { post: BlogPost }) {
    const updatedAt = post.dateModified && post.dateModified > post.publishedAt ? post.dateModified : null;
    return (
        <header className="blog-article-hero">
            <div className="blog-article-hero-inner">
                <div className="blog-article-breadcrumb" aria-label="Article category">
                    <Link href="/blog">Blog</Link>
                    <Slash className="size-3.5" aria-hidden="true" />
                    <span>{PILLAR_LABELS[post.pillar]}</span>
                </div>
                <h1>{post.title}</h1>
                <div className="blog-article-meta">
                    <BlogAuthorByline author={post.author} size="md" showRole={false} className="blog-article-author" />
                    <span className="blog-article-meta-item">
                        <CalendarDays className="size-4" aria-hidden="true" />
                        <time dateTime={post.publishedAt}>{formatBlogPublishedDate(post.publishedAt, "long")}</time>
                    </span>
                    {updatedAt ? (
                        <span className="blog-article-meta-item">
                            <RefreshCw className="size-4" aria-hidden="true" />
                            Updated <time dateTime={updatedAt}>{formatBlogPublishedDate(updatedAt, "long")}</time>
                        </span>
                    ) : null}
                    <span className="blog-article-meta-item">
                        <Clock className="size-4" aria-hidden="true" />
                        {post.readMinutes} min read
                    </span>
                </div>
            </div>
        </header>
    );
}
