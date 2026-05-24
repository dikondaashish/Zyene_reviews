import { BLOG_POST_MAP, PILLAR_LABELS } from "@/lib/phase4/blog-data";
import type { BlogPost } from "@/lib/phase4/blog-data";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogSlugFaqSection } from "@/components/marketing/blog-slug-faq-section";
import { ContentRenderer } from "@/components/marketing/content-renderer";

// ─── Static Generation ────────────────────────────────────────────────────────


// ─── Metadata ─────────────────────────────────────────────────────────────────


// ─── Page ─────────────────────────────────────────────────────────────────────

export function BlogSlugArticleBodySidebarSection({ post, relatedPosts }: { post: (typeof BLOG_POST_MAP)[string]; relatedPosts: (typeof BLOG_POST_MAP)[string][] }) {
    return (
        <div className="py-12 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid lg:grid-cols-[1fr_280px] gap-12 items-start">

                        {/* Article content */}
                        <article>
                            <ContentRenderer sections={post.body} />

                            {post.faqs && post.faqs.length > 0 ? <BlogSlugFaqSection faqs={post.faqs} /> : null}

                            {/* Internal links */}
                            {post.internalLinks.length > 0 && (
                                <div className="mt-12 pt-8 border-t border-border">
                                    <p className="text-sm font-semibold text-foreground mb-4">Related resources:</p>
                                    <div className="space-y-2">
                                        {post.internalLinks.map((link) => (
                                            <Link key={link.href} href={link.href} className="flex items-center gap-2 text-sm text-primary hover:brightness-90 transition-all group">
                                                <ArrowRight className="shrink-0 group-hover:translate-x-1 transition-transform size-3.5" />
                                                {link.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Post footer CTA */}
                            <div className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-8">
                                <h3 className="text-xl font-bold text-foreground mb-2">Ready to try Zyene Reviews?</h3>
                                <p className="text-muted-foreground mb-5">7-day free trial. Full access. No credit card lock-in.</p>
                                <Link href="/signup">
                                    <Button className="gap-2">
                                        Start Free Trial <ArrowRight className="size-4" />
                                    </Button>
                                </Link>
                            </div>
                        </article>

                        {/* Sidebar */}
                        <aside className="hidden lg:block space-y-6 sticky top-24">
                            {/* CTA Card */}
                            <div className="bg-card border border-border rounded-2xl p-6">
                                <p className="text-sm font-bold text-foreground mb-2">Try Zyene free</p>
                                <p className="text-xs text-muted-foreground mb-4">7-day trial. AI replies, review requests, Negative Feedback Shield. Starting at $29.99/mo.</p>
                                <Link href="/signup">
                                    <Button size="sm" className="w-full gap-2">
                                        Start Free Trial <ArrowRight className="size-3.5" />
                                    </Button>
                                </Link>
                            </div>

                            {/* Related posts */}
                            {relatedPosts.length > 0 && (
                                <div className="bg-card border border-border rounded-2xl p-6">
                                    <p className="text-sm font-bold text-foreground mb-4">Related reading</p>
                                    <div className="space-y-4">
                                        {relatedPosts.map((related) => (
                                            <Link key={related.slug} href={`/blog/${related.slug}`} className="group block">
                                                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-1">
                                                    {related.title}
                                                </p>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Clock className="size-3" />
                                                    {related.readMinutes} min
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </div>
    );
}
