import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Facebook, Linkedin, Twitter } from "lucide-react";
import { BlogAuthorByline } from "@/components/marketing/blog-author-byline";
import { BLOG_POSTS, BLOG_POST_MAP, PILLAR_LABELS } from "@/lib/content/blog-data";

const SITE_URL = "https://www.zyenereviews.com";

function getRelatedPosts(slug: string) {
    const current = BLOG_POST_MAP[slug];
    const preferred = current?.relatedSlugs.flatMap((relatedSlug) => {
        const related = BLOG_POST_MAP[relatedSlug];
        return related ? [related] : [];
    }) ?? [];
    const fallback = BLOG_POSTS.filter((post) => post.slug !== slug && !preferred.some((related) => related.slug === post.slug));
    return [...preferred, ...fallback].slice(0, 4);
}

export function BlogSlugMorePostsSection({ slug }: { slug: string }) {
    const current = BLOG_POST_MAP[slug];
    const currentIndex = BLOG_POSTS.findIndex((post) => post.slug === slug);
    const previous = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null;
    const next = currentIndex >= 0 ? BLOG_POSTS[currentIndex + 1] ?? null : null;
    const articleUrl = `${SITE_URL}/blog/${slug}`;
    const relatedPosts = getRelatedPosts(slug);

    return (
        <section className="blog-article-footer">
            <div className="blog-article-footer-grid">
                <div aria-hidden="true" />
                <div className="blog-article-footer-content">
                    <div className="blog-share-row" data-reveal>
                        <h2>Share this article</h2>
                        <div className="blog-share-actions">
                            <Link href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook"><Facebook className="size-4" /></Link>
                            <Link href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn"><Linkedin className="size-4" /></Link>
                            <Link href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X"><Twitter className="size-4" /></Link>
                        </div>
                    </div>

                    <nav className="blog-post-navigation" aria-label="Post navigation">
                        {previous ? <Link href={`/blog/${previous.slug}`} className="blog-post-nav-link blog-post-nav-previous"><span>Previous post</span><strong><ArrowLeft className="size-4" aria-hidden="true" />{previous.title}</strong></Link> : <span />}
                        {next ? <Link href={`/blog/${next.slug}`} className="blog-post-nav-link blog-post-nav-next"><span>Next post</span><strong>{next.title}<ArrowRight className="size-4" aria-hidden="true" /></strong></Link> : null}
                    </nav>

                    <section className="blog-related-section" aria-labelledby="blog-related-heading">
                        <div className="blog-article-subheading"><h2 id="blog-related-heading">Related articles</h2><Link href="/blog">View all <ArrowUpRight className="size-4" aria-hidden="true" /></Link></div>
                        <div className="blog-related-grid">
                            {relatedPosts.map((post) => <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-related-card group">
                                <div className="blog-related-image">{post.image ? <Image src={post.image.src} alt={post.image.alt} fill sizes="(max-width:600px) 100vw, (max-width:900px) 50vw, 20vw" /> : null}</div>
                                <div className="blog-related-card-copy"><span>{PILLAR_LABELS[post.pillar]}</span><h3>{post.title}</h3><small>{post.readMinutes} min read</small></div>
                            </Link>)}
                        </div>
                    </section>

                    {current ? <section className="blog-written-by" aria-labelledby="blog-written-heading"><h2 id="blog-written-heading">Written by</h2><BlogAuthorByline author={current.author} size="md" /></section> : null}

                    <section className="blog-next-steps" data-reveal aria-labelledby="blog-next-heading">
                        <p className="blog-article-eyebrow">Make the next visit count</p>
                        <h2 id="blog-next-heading">What should you do next?</h2>
                        <p>Put the ideas from this article into a repeatable reputation routine.</p>
                        <div className="blog-next-step-links">
                            <Link href="/features"><span>See how Zyene Reviews works</span><ArrowRight className="size-4" aria-hidden="true" /></Link>
                            <Link href="/contact"><span>Talk through your next move</span><ArrowRight className="size-4" aria-hidden="true" /></Link>
                        </div>
                    </section>
                </div>
            </div>
        </section>
    );
}
