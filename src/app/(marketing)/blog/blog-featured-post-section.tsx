import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { PILLAR_LABELS, PILLAR_COLORS } from "@/lib/phase4/blog-data";
import type { BlogPost } from "@/lib/phase4/blog-types";
import { BlogAuthorByline } from "@/components/marketing/blog-author-byline";

export function BlogFeaturedPostSection({ featured }: { featured: BlogPost }) {
    return (
        <section className="py-16 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">Featured Post</p>
                    <Link href={`/blog/${featured.slug}`} className="group block bg-card border border-border rounded-3xl p-8 lg:p-10 hover:border-primary/40 hover:shadow-lg transition-all">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1">
                                <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border mb-4 ${PILLAR_COLORS[featured.pillar]}`}>
                                    <Sparkles className="size-3" />
                                    {PILLAR_LABELS[featured.pillar]}
                                </div>
                                <h2 className="text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                                    {featured.title}
                                </h2>
                                <p className="text-muted-foreground leading-relaxed mb-5">
                                    {featured.excerpt}
                                </p>
                                <div className="space-y-4">
                                    <BlogAuthorByline author={featured.author} size="md" />
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Clock className="size-3.5" />
                                            {featured.readMinutes} min read
                                        </div>
                                        <span>
                                            {new Date(featured.publishedAt).toLocaleDateString("en-US", {
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="shrink-0 self-center">
                                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 flex items-center justify-center">
                                    <ArrowRight className="text-primary group-hover:translate-x-1 transition-transform size-10" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </section>
    );
}
