import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogSlugFaqSection } from "@/components/marketing/blog-slug-faq-section";
import { ContentRenderer } from "@/components/marketing/content-renderer";
import { SIGNUP_URL } from "@/config/env";
import { BLOG_POST_MAP } from "@/lib/content/blog-data";
import { BlogSlugTableOfContents } from "./blog-slug-table-of-contents";

export function BlogSlugArticleBodySidebarSection({ post }: { post: (typeof BLOG_POST_MAP)[string] }) {
    return (
        <section className="blog-article-shell">
            <div className="blog-article-layout">
                <aside className="blog-article-sidebar">
                    <BlogSlugTableOfContents sections={post.body} faqs={post.faqs} />
                </aside>
                <article className="blog-article-main">
                    <p className="blog-article-lead" data-geo-summary="">
                        {post.excerpt}
                    </p>
                    <ContentRenderer sections={post.body} className="blog-article-content" />

                    {post.faqs && post.faqs.length > 0 ? <BlogSlugFaqSection faqs={post.faqs} /> : null}

                    {post.internalLinks.length > 0 ? (
                        <section className="blog-article-resources" aria-labelledby="blog-resources-heading">
                            <h2 id="blog-resources-heading">Keep exploring</h2>
                            <div>
                                {post.internalLinks.map((link) => (
                                    <Link key={link.href} href={link.href === "/signup" ? SIGNUP_URL : link.href}>
                                        <ArrowRight className="size-4" aria-hidden="true" />
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    <section className="blog-article-cta" data-reveal aria-labelledby="blog-cta-heading">
                        <div>
                            <p className="blog-article-eyebrow">A practical next step</p>
                            <h2 id="blog-cta-heading">Ready to make review work easier?</h2>
                            <p>Bring requests, replies, and feedback into one calm daily routine.</p>
                        </div>
                        <Button asChild>
                            <Link href={SIGNUP_URL}>
                                Start Free Trial <ArrowRight className="size-4" aria-hidden="true" />
                            </Link>
                        </Button>
                    </section>
                </article>
            </div>
        </section>
    );
}
