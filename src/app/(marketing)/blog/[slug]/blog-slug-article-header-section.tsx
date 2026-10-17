import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PILLAR_LABELS } from "@/lib/content/blog-data";
import type { BlogPost } from "@/lib/content/blog-types";
import { BlogAuthorByline } from "@/components/marketing/blog-author-byline";
import { formatBlogPublishedDate } from "@/lib/content/format-blog-date";

/**
 * Editorial article opening: breadcrumb, title, standfirst, byline, then the cover image.
 * The standfirst doubles as the page's quotable summary for AI answers (data-geo-summary).
 */
export function BlogSlugArticleHeaderSection({ post }: { post: BlogPost }) {
    const updatedAt = post.dateModified && post.dateModified > post.publishedAt ? post.dateModified : null;
    return (
        <header className="blog-article-hero">
            <span className="blog-progress" aria-hidden="true" />
            <div className="blog-article-hero-inner">
                <nav className="blog-article-breadcrumb" aria-label="Breadcrumb">
                    <Link href="/blog">Blog</Link>
                    <ChevronRight className="size-3.5" aria-hidden="true" />
                    <span>{PILLAR_LABELS[post.pillar]}</span>
                </nav>
                <h1>{post.title}</h1>
                <p className="blog-article-dek" data-geo-summary="">{post.excerpt}</p>
                <div className="blog-article-meta">
                    <BlogAuthorByline author={post.author} size="md" showRole={false} className="blog-article-author" />
                    <span className="blog-article-meta-sep" aria-hidden="true" />
                    <time dateTime={post.publishedAt}>{formatBlogPublishedDate(post.publishedAt, "long")}</time>
                    {updatedAt ? (
                        <span>
                            Updated <time dateTime={updatedAt}>{formatBlogPublishedDate(updatedAt, "long")}</time>
                        </span>
                    ) : null}
                    <span>{post.readMinutes} min read</span>
                </div>
            </div>
            {post.image ? (
                <figure className="blog-article-cover">
                    <div className="blog-article-cover-frame">
                        <Image
                            src={post.image.src}
                            alt={post.image.alt}
                            fill
                            priority
                            sizes="(max-width: 1240px) 100vw, 1160px"
                        />
                    </div>
                    {post.image.caption ? <figcaption>{post.image.caption}</figcaption> : null}
                </figure>
            ) : null}
        </header>
    );
}
