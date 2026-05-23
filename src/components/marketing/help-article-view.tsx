import Link from "next/link";
import { ArrowRight, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    HELP_BY_CATEGORY,
    HELP_CATEGORIES,
    helpArticleNestedPath,
    type HelpArticle,
} from "@/lib/phase4/help-data";
import { ContentRenderer } from "@/components/marketing/content-renderer";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export function HelpArticleView({
    article,
    canonicalPath,
}: {
    article: HelpArticle;
    /** Preferred URL for breadcrumbs/JSON-LD (nested or flat). */
    canonicalPath: string;
}) {
    const catInfo = HELP_CATEGORIES[article.category];
    const categoryPath = `/help/${article.category}`;
    const relatedArticles = HELP_BY_CATEGORY[article.category]
        .filter((a) => a.slug !== article.slug)
        .slice(0, 4);

    const canonicalUrl = `https://zyenereviews.com${canonicalPath}`;

    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Help Center", url: "https://zyenereviews.com/help" },
                    { name: catInfo.label, url: `https://zyenereviews.com${categoryPath}` },
                    { name: article.title, url: canonicalUrl },
                ]}
            />

            <header className="pt-16 pb-10 px-4 bg-muted border-b border-border">
                <div className="container mx-auto max-w-4xl">
                    <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6 flex-wrap">
                        <Link href="/help" className="hover:text-primary transition-colors">
                            Help Center
                        </Link>
                        <ChevronRight className="size-3.5" />
                        <Link href={categoryPath} className="hover:text-primary transition-colors">
                            {catInfo.label}
                        </Link>
                        <ChevronRight className="size-3.5" />
                        <span className="text-muted-foreground truncate max-w-[200px]">
                            {article.title}
                        </span>
                    </nav>

                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">{catInfo.emoji}</span>
                        <span className="text-sm font-semibold text-muted-foreground">{catInfo.label}</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
                        {article.title}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-6">{article.excerpt}</p>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="size-4" />
                        {article.readMinutes} min read
                    </div>
                </div>
            </header>

            <div className="py-12 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid lg:grid-cols-[1fr_280px] gap-12 items-start">
                        <article>
                            <ContentRenderer sections={article.body} />
                            <div className="mt-12 bg-muted border border-border rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-foreground mb-1">Still have questions?</p>
                                    <p className="text-sm text-muted-foreground">
                                        Our support team is available Mon–Fri, 9am–6pm EST.
                                    </p>
                                </div>
                                <a href="mailto:support@zyenereviews.com" className="shrink-0">
                                    <Button variant="outline" size="sm" className="gap-2 rounded-lg">
                                        Email Support <ArrowRight className="size-3.5" />
                                    </Button>
                                </a>
                            </div>
                        </article>

                        <aside className="hidden lg:block space-y-6 sticky top-24">
                            <div className="bg-card border border-border rounded-2xl p-6">
                                <p className="text-sm font-bold text-foreground mb-1">New to Zyene?</p>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Start with a 7-day free trial. Full access to all features.
                                </p>
                                <Link href="/signup">
                                    <Button size="sm" className="w-full gap-2">
                                        Start Free Trial <ArrowRight className="size-3.5" />
                                    </Button>
                                </Link>
                            </div>

                            {relatedArticles.length > 0 && (
                                <div className="bg-card border border-border rounded-2xl p-6">
                                    <p className="text-sm font-bold text-foreground mb-4">In this category</p>
                                    <div className="space-y-3">
                                        {relatedArticles.map((a) => (
                                            <Link
                                                key={a.slug}
                                                href={helpArticleNestedPath(a)}
                                                className="block text-xs font-medium leading-snug text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {a.title}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </div>

            <section className="py-12 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-4xl">
                    <Link
                        href={categoryPath}
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        ← Back to {catInfo.label}
                    </Link>
                </div>
            </section>
        </>
    );
}
