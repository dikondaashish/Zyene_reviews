import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Clock, ChevronRight } from "lucide-react";
import { BLOG_POST_MAP, BLOG_SLUGS, BLOG_POSTS, PILLAR_LABELS, PILLAR_COLORS } from "@/lib/phase4/blog-data";

// ─── Static Generation ────────────────────────────────────────────────────────


// ─── Metadata ─────────────────────────────────────────────────────────────────


// ─── Page ─────────────────────────────────────────────────────────────────────

export function BlogSlugMorePostsSection({ slug }: { slug: string }) {
    return (
        <section className="py-16 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-foreground">More posts</h2>
                        <Link href="/blog" className="text-sm font-medium text-primary hover:brightness-90 flex items-center gap-1">
                            View all <ArrowRight className="size-3.5" />
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
                                        <Clock className="size-3" />
                                        {p.readMinutes} min
                                    </div>
                                </Link>
                            ))}
                    </div>
                </div>
            </section>
    );
}
