import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, BookOpen, Sparkles } from "lucide-react";
import { BLOG_POSTS, PILLAR_LABELS, PILLAR_COLORS, type ContentPillar } from "@/lib/phase4/blog-data";

export function BlogFeaturedPostSection({ featured }: { featured: (typeof BLOG_POSTS)[number] }) {
    return (
        <section className="py-16 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">Featured Post</p>
                    <Link href={`/blog/${featured.slug}`} className="group block bg-card border border-border rounded-3xl p-8 lg:p-10 hover:border-primary/40 hover:shadow-lg transition-all">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1">
                                <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border mb-4 ${PILLAR_COLORS[featured.pillar]}`}>
                                    <Sparkles className="h-3 w-3" />
                                    {PILLAR_LABELS[featured.pillar]}
                                </div>
                                <h2 className="text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                                    {featured.title}
                                </h2>
                                <p className="text-muted-foreground leading-relaxed mb-5">
                                    {featured.excerpt}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {featured.readMinutes} min read
                                    </div>
                                    <span>{new Date(featured.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                                </div>
                            </div>
                            <div className="shrink-0 self-center">
                                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 flex items-center justify-center">
                                    <ArrowRight className="h-10 w-10 text-primary group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </section>
    );
}
