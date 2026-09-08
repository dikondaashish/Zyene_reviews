import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { BLOG_POSTS } from "@/lib/content/blog-data";
import { resolveBlogAuthor } from "@/lib/content/blog-authors";

const BLOG_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function formatDate(date: string) {
    return BLOG_DATE_FORMATTER.format(new Date(date));
}

export function BlogAllPostsGridSection({
    posts,
    totalCount = posts.length,
    hasMore = false,
    onLoadMore,
}: {
    posts: typeof BLOG_POSTS;
    totalCount?: number;
    hasMore?: boolean;
    onLoadMore?: () => void;
}) {
    return (
        <section className="blog-grid-section" aria-labelledby="blog-grid-heading">
            <div className="marketing-container">
                <div className="blog-grid-heading-row">
                    <div>
                        <p className="blog-grid-kicker">The Zyene Reviews journal</p>
                        <h2 id="blog-grid-heading">Fresh ideas for a stronger reputation.</h2>
                    </div>
                    <span className="blog-grid-count">{totalCount} {totalCount === 1 ? "article" : "articles"}</span>
                </div>
                {posts.length > 0 ? (
                    <div className="blog-post-grid">
                        {posts.map((post, index) => {
                            const author = resolveBlogAuthor(post.author);
                            return (
                                <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-post-card group" data-reveal>
                                    <div className="blog-post-image">
                                        {post.image ? <Image src={post.image.src} alt={post.image.alt} fill sizes="(max-width:767px) 100vw, (max-width:1100px) 50vw, 33vw" priority={index < 3} /> : null}
                                        <span className="blog-post-image-arrow" aria-hidden="true"><ArrowUpRight size={16} /></span>
                                    </div>
                                    <div className="blog-post-content">
                                        <span className="blog-post-pillar" data-pillar={post.pillar}>{post.pillarLabel}</span>
                                        <h3>{post.title}</h3>
                                        <p>{post.excerpt}</p>
                                        <div className="blog-post-meta">
                                            <span>{author.name}</span><span aria-hidden="true">•</span><time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time><span>{post.readMinutes} min read</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : <div className="blog-grid-empty">No articles match that search yet. Try another topic.</div>}
                {hasMore && onLoadMore ? <button type="button" className="blog-load-more" onClick={onLoadMore}>Load more <ArrowDown size={15} aria-hidden="true" /></button> : null}
            </div>
        </section>
    );
}
