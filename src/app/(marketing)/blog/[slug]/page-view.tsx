import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BLOG_POST_MAP, BLOG_SLUGS, BLOG_POSTS, PILLAR_LABELS, PILLAR_COLORS } from "@/lib/phase4/blog-data";
import { ContentRenderer } from "@/components/marketing/content-renderer";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

// ─── Static Generation ────────────────────────────────────────────────────────


// ─── Metadata ─────────────────────────────────────────────────────────────────


// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPostPage(
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const post = BLOG_POST_MAP[slug];
    if (!post) notFound();

    const relatedPosts = post.relatedSlugs
        .map((s) => BLOG_POST_MAP[s])
        .filter(Boolean)
        .slice(0, 3);

    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Blog", url: "https://zyenereviews.com/blog" },
                    { name: post.title, url: `https://zyenereviews.com/blog/${slug}` },
                ]}
            />

            {/* ── Article Header ── */}
            <header className="pt-16 pb-12 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-3xl">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                        <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-foreground font-medium truncate max-w-[200px]">{post.title}</span>
                    </nav>

                    {/* Pillar tag */}
                    <div className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border mb-5 ${PILLAR_COLORS[post.pillar]}`}>
                        {PILLAR_LABELS[post.pillar]}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-5 leading-[1.1]">
                        {post.title}
                    </h1>
                    <p className="text-xl text-muted-foreground mb-7 leading-relaxed">
                        {post.excerpt}
                    </p>

                    {/* Meta bar */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t border-border pt-5">
                        <span className="font-medium text-foreground">{post.author.name}</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span>{new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                        <span className="text-muted-foreground/40">·</span>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {post.readMinutes} min read
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Article Body + Sidebar ── */}
            <div className="py-12 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid lg:grid-cols-[1fr_280px] gap-12 items-start">

                        {/* Article content */}
                        <article>
                            <ContentRenderer sections={post.body} />

                            {/* Internal links */}
                            {post.internalLinks.length > 0 && (
                                <div className="mt-12 pt-8 border-t border-border">
                                    <p className="text-sm font-semibold text-foreground mb-4">Related resources:</p>
                                    <div className="space-y-2">
                                        {post.internalLinks.map((link) => (
                                            <Link key={link.href} href={link.href} className="flex items-center gap-2 text-sm text-primary hover:brightness-90 transition-all group">
                                                <ArrowRight className="h-3.5 w-3.5 shrink-0 group-hover:translate-x-1 transition-transform" />
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
                                        Start Free Trial <ArrowRight className="h-4 w-4" />
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
                                        Start Free Trial <ArrowRight className="h-3.5 w-3.5" />
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
                                                    <Clock className="h-3 w-3" />
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

            {/* ── More Posts ── */}
            <section className="py-16 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-foreground">More posts</h2>
                        <Link href="/blog" className="text-sm font-medium text-primary hover:brightness-90 flex items-center gap-1">
                            View all <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {BLOG_POSTS.filter((p) => p.slug !== slug)
                            .slice(0, 3)
                            .map((p) => (
                                <Link key={p.slug} href={`/blog/${p.slug}`} className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-md transition-all flex flex-col">
                                    <div className={`inline-flex items-center self-start gap-1 text-xs font-bold px-2.5 py-1 rounded-full border mb-3 ${PILLAR_COLORS[p.pillar]}`}>
                                        {PILLAR_LABELS[p.pillar]}
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug flex-1">
                                        {p.title}
                                    </h3>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
                                        <Clock className="h-3 w-3" />
                                        {p.readMinutes} min
                                    </div>
                                </Link>
                            ))}
                    </div>
                </div>
            </section>
        </>
    );
}
