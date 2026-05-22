import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Clock, ChevronRight, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RESOURCE_MAP, RESOURCE_SLUGS, RESOURCE_GUIDES } from "@/lib/phase4/resource-data";
import { ContentRenderer } from "@/components/marketing/content-renderer";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

// ─── Static Generation ────────────────────────────────────────────────────────

export function generateStaticParams() {
    return RESOURCE_SLUGS.map((guide) => ({ guide }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
    { params }: { params: Promise<{ guide: string }> }
): Promise<Metadata> {
    const { guide } = await params;
    const resource = RESOURCE_MAP[guide];
    if (!resource) return {};
    return {
        title: resource.metaTitle,
        description: resource.metaDescription,
        alternates: { canonical: `https://zyenereviews.com/resources/${guide}` },
        keywords: resource.keywords,
        openGraph: {
            title: resource.metaTitle,
            description: resource.metaDescription,
            url: `https://zyenereviews.com/resources/${guide}`,
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: resource.metaTitle,
            description: resource.metaDescription,
        },
    };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ResourceGuidePage(
    { params }: { params: Promise<{ guide: string }> }
) {
    const { guide } = await params;
    const resource = RESOURCE_MAP[guide];
    if (!resource) notFound();

    const otherGuides = RESOURCE_GUIDES.filter((g) => g.slug !== guide).slice(0, 3);

    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Resources", url: "https://zyenereviews.com/resources" },
                    { name: resource.title, url: `https://zyenereviews.com/resources/${guide}` },
                ]}
            />

            {/* ── Guide Header ── */}
            <header className="pt-16 pb-12 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-4xl">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                        <Link href="/resources" className="hover:text-primary transition-colors">Resources</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-foreground font-medium truncate max-w-xs">{resource.title}</span>
                    </nav>

                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-5">
                        Free Guide
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4 leading-[1.1]">
                        {resource.title}
                    </h1>
                    <p className="text-xl text-muted-foreground mb-7 leading-relaxed">
                        {resource.subtitle}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t border-border pt-5">
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {resource.readMinutes} min read
                        </div>
                        <span>·</span>
                        <span>Updated {new Date(resource.lastUpdated).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                    </div>
                </div>
            </header>

            {/* ── Content + Sidebar ── */}
            <div className="py-12 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid lg:grid-cols-[1fr_280px] gap-12 items-start">

                        {/* Guide content */}
                        <article>
                            {/* Table of Contents */}
                            {resource.tableOfContents.length > 0 && (
                                <div className="mb-10 bg-muted border border-border rounded-2xl p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <List className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-bold text-foreground">Table of Contents</span>
                                    </div>
                                    <ol className="space-y-2">
                                        {resource.tableOfContents.map((item, i) => (
                                            <li key={item.anchor} className="flex items-start gap-2.5">
                                                <span className="text-xs font-bold text-primary mt-0.5">{String(i + 1).padStart(2, "0")}.</span>
                                                <a href={`#${item.anchor}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">{item.label}</a>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                            <ContentRenderer sections={resource.body} />

                            {/* Guide footer CTA */}
                            <div className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-8">
                                <h3 className="text-xl font-bold text-foreground mb-2">Put this guide into practice with Zyene</h3>
                                <p className="text-muted-foreground mb-5">Automate review collection, AI replies, and reputation protection. 7-day free trial — no credit card lock-in.</p>
                                <Link href="/signup">
                                    <Button className="gap-2">
                                        Start Free Trial <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </article>

                        {/* Sidebar */}
                        <aside className="hidden lg:block space-y-6 sticky top-24">
                            <div className="bg-card border border-border rounded-2xl p-6">
                                <p className="text-sm font-bold text-foreground mb-2">Try Zyene free</p>
                                <p className="text-xs text-muted-foreground mb-4">Everything in this guide — automated. Review requests, AI replies, Shield, competitor tracking. $29.99/mo. No contract.</p>
                                <Link href="/signup">
                                    <Button size="sm" className="w-full gap-2">
                                        Start Free Trial <ArrowRight className="h-3.5 w-3.5" />
                                    </Button>
                                </Link>
                            </div>

                            {otherGuides.length > 0 && (
                                <div className="bg-card border border-border rounded-2xl p-6">
                                    <p className="text-sm font-bold text-foreground mb-4">Other guides</p>
                                    <div className="space-y-4">
                                        {otherGuides.map((g) => (
                                            <Link key={g.slug} href={`/resources/${g.slug}`} className="group block">
                                                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-1">{g.title}</p>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {g.readMinutes} min
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

            {/* ── Other Guides ── */}
            <section className="py-16 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-foreground">More free guides</h2>
                        <Link href="/resources" className="text-sm font-medium text-primary hover:brightness-90 flex items-center gap-1">
                            All guides <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {otherGuides.map((g) => (
                            <Link key={g.slug} href={`/resources/${g.slug}`} className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-md transition-all flex flex-col">
                                <h3 className="text-sm font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug flex-1">{g.title}</h3>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
                                    <Clock className="h-3 w-3" />
                                    {g.readMinutes} min
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
