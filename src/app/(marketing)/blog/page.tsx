import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, BookOpen, Sparkles } from "lucide-react";
import { BLOG_POSTS, PILLAR_LABELS, PILLAR_COLORS, type ContentPillar } from "@/lib/phase4/blog-data";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { NewsletterSignup } from "@/components/marketing/newsletter-signup";

export const metadata: Metadata = {
    title: "Blog — Review Management & Local SEO for Local Businesses | Zyene Reviews",
    description: "Practical guides on Google reviews, local SEO, responding to reviews, and reputation management. Written for local business owners who want to grow.",
    alternates: { canonical: "https://zyenereviews.com/blog" },
    openGraph: {
        title: "Blog — Review Management & Local SEO Tips | Zyene Reviews",
        description: "Practical guides on Google reviews, local SEO, responding to reviews, and reputation management for local business owners.",
        url: "https://zyenereviews.com/blog",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Blog — Review Management & Local SEO Tips | Zyene Reviews",
        description: "Practical guides on Google reviews, local SEO, and reputation management for local business owners.",
    },
};

const PILLARS: Array<{ id: ContentPillar | "all"; label: string }> = [
    { id: "all", label: "All Posts" },
    { id: "google-reviews", label: "Google Reviews" },
    { id: "responding-to-reviews", label: "Responding to Reviews" },
    { id: "local-seo", label: "Local SEO" },
    { id: "reputation-management", label: "Reputation Management" },
    { id: "industry-specific", label: "Industry Specific" },
    { id: "competitor-analysis", label: "Competitor Analysis" },
];

export default function BlogHubPage() {
    const featured = BLOG_POSTS[0];
    const rest = BLOG_POSTS.slice(1);

    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Blog", url: "https://zyenereviews.com/blog" },
                ]}
            />

            {/* ── Hero ── */}
            <section className="pt-20 pb-12 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                            <BookOpen className="h-3 w-3" /> Blog
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                        Review management &amp; local SEO<br />for business owners
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        Practical guides to get more Google reviews, respond professionally, rank higher in local search, and protect your reputation.
                    </p>
                </div>
            </section>

            {/* ── Pillar Filters ── */}
            <section className="py-6 px-4 bg-muted border-b border-border sticky top-16 z-30">
                <div className="container mx-auto max-w-5xl overflow-x-auto">
                    <div className="flex gap-2 min-w-max">
                        {PILLARS.map((p) => (
                            <span key={p.id} className="px-4 py-2 rounded-full text-xs font-semibold border border-border bg-card text-muted-foreground cursor-default hover:border-primary/40 hover:text-foreground transition-colors whitespace-nowrap">
                                {p.label}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Featured Post ── */}
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

            {/* ── All Posts Grid ── */}
            <section className="py-8 pb-24 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">All Posts</p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rest.map((post) => (
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
                                <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {post.readMinutes} min
                                    </div>
                                    <span>{new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Newsletter CTA ── */}
            <section className="py-20 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-3">Get the latest guides in your inbox</h2>
                    <p className="text-muted-foreground mb-8">Monthly digest of our best posts on Google reviews, local SEO, and reputation management.</p>
                    <NewsletterSignup source="blog" />
                </div>
            </section>
        </>
    );
}
