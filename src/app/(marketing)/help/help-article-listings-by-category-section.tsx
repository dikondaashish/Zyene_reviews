import Link from "next/link";
import { ArrowRight, Mail, Search } from "lucide-react";
import type { Metadata } from "next";
import {
    HELP_BY_CATEGORY,
    HELP_CATEGORIES,
    helpArticleNestedPath,
    type HelpCategory,
} from "@/lib/content/help-data";
import { CATEGORY_ORDER } from "./help-data";

export function HelpArticleListingsByCategorySection() {
    return (
        <section className="py-20 px-4 bg-background">
                <div className="container mx-auto max-w-5xl space-y-16">
                    {CATEGORY_ORDER.map((categoryKey) => {
                        const catInfo = HELP_CATEGORIES[categoryKey];
                        const articles = HELP_BY_CATEGORY[categoryKey] ?? [];
                        return (
                            <div key={categoryKey}>
                                {/* Category header */}
                                <Link
                                    href={`/help/${categoryKey}`}
                                    className="flex items-center gap-3 mb-6 group w-fit"
                                >
                                    <div className="p-2.5 bg-primary/10 text-primary rounded-lg border border-primary/20 text-xl leading-none">
                                        {catInfo.emoji}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                            {catInfo.label}
                                        </h2>
                                        <p className="text-sm text-muted-foreground">{catInfo.description}</p>
                                    </div>
                                </Link>

                                {/* Article list */}
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {articles.map((article) => (
                                        <Link
                                            key={article.slug}
                                            href={helpArticleNestedPath(article)}
                                            className="group flex items-start justify-between gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-1">
                                                    {article.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                                    {article.excerpt}
                                                </p>
                                            </div>
                                            <ArrowRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-0.5 size-4" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
    );
}
