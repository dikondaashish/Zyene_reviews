import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
    HELP_BY_CATEGORY,
    HELP_CATEGORIES,
    helpArticleNestedPath,
    type HelpCategory,
} from "@/lib/phase4/help-data";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export function HelpCategoryView({ categoryKey }: { categoryKey: HelpCategory }) {
    const catInfo = HELP_CATEGORIES[categoryKey];
    const articles = HELP_BY_CATEGORY[categoryKey] ?? [];

    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Help Center", url: "https://zyenereviews.com/help" },
                    { name: catInfo.label, url: `https://zyenereviews.com/help/${categoryKey}` },
                ]}
            />

            <section className="bg-muted border-b border-border py-16 px-4">
                <div className="container mx-auto max-w-4xl">
                    <Link
                        href="/help"
                        className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block"
                    >
                        ← Help Center
                    </Link>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{catInfo.emoji}</span>
                        <h1 className="text-3xl font-bold tracking-tight">{catInfo.label}</h1>
                    </div>
                    <p className="text-lg text-muted-foreground max-w-2xl">{catInfo.description}</p>
                </div>
            </section>

            <section className="py-16 px-4 bg-background">
                <div className="container mx-auto max-w-4xl">
                    <div className="grid sm:grid-cols-2 gap-4">
                        {articles.map((article) => (
                            <Link
                                key={article.slug}
                                href={helpArticleNestedPath(article)}
                                className="group block rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors"
                            >
                                <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                    {article.title}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                    {article.excerpt}
                                </p>
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary mt-3">
                                    Read guide <ArrowRight className="h-3 w-3" />
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
