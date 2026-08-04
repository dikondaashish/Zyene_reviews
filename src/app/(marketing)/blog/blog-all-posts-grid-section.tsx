import Link from "next/link";
import { Clock } from "lucide-react";
import { BLOG_POSTS, PILLAR_LABELS, PILLAR_COLORS } from "@/lib/content/blog-data";
import { BlogAuthorByline } from "@/components/marketing/blog-author-byline";

export function BlogAllPostsGridSection({ posts }: { posts: typeof BLOG_POSTS }) {
    return (
        <section className="py-8 pb-24 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">All Posts</p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <Link key={post.slug} href={`/blog/${post.slug}`} className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-md transition-all flex flex-col">
                                <div className={`inline-flex items-center self-start gap-1 text-xs font-bold px-2.5 py-1 rounded-full border mb-3 ${PILLAR_COLORS[post.pillar]}`}>
                                    {PILLAR_LABELS[post.pillar]}
                                </div>
                                <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug flex-1">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                                    {post.excerpt}
                                </p>
                                <div className="mt-auto space-y-3 pt-4 border-t border-border">
                                    <BlogAuthorByline author={post.author} />
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Clock className="size-3" />
                                            {post.readMinutes} min
                                        </div>
                                        <span>
                                            {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
    );
}
