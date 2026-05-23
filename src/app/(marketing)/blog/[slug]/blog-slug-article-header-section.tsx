import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Clock, ChevronRight } from "lucide-react";
import { BLOG_POST_MAP, BLOG_SLUGS, BLOG_POSTS, PILLAR_LABELS, PILLAR_COLORS } from "@/lib/phase4/blog-data";

// ─── Static Generation ────────────────────────────────────────────────────────


// ─── Metadata ─────────────────────────────────────────────────────────────────


// ─── Page ─────────────────────────────────────────────────────────────────────

export function BlogSlugArticleHeaderSection({ post }: { post: (typeof BLOG_POST_MAP)[string] }) {
    return (
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
    );
}
