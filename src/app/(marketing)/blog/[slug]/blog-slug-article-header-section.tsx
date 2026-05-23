import Link from "next/link";
import { Clock, ChevronRight } from "lucide-react";
import { PILLAR_LABELS, PILLAR_COLORS } from "@/lib/phase4/blog-data";
import type { BlogPost } from "@/lib/phase4/blog-types";
import { BlogAuthorByline } from "@/components/marketing/blog-author-byline";

// ─── Static Generation ────────────────────────────────────────────────────────


// ─── Metadata ─────────────────────────────────────────────────────────────────


// ─── Page ─────────────────────────────────────────────────────────────────────

export function BlogSlugArticleHeaderSection({ post }: { post: BlogPost }) {
    return (
        <header className="pt-16 pb-12 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-3xl">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                        <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                        <ChevronRight className="size-3.5" />
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

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-border pt-5">
                        <BlogAuthorByline author={post.author} size="md" />
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span>
                                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                            <span className="text-muted-foreground/40 hidden sm:inline">·</span>
                            <div className="flex items-center gap-1.5">
                                <Clock className="size-3.5" />
                                {post.readMinutes} min read
                            </div>
                        </div>
                    </div>
                </div>
            </header>
    );
}
