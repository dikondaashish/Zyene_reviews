import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import {
    HELP_BY_CATEGORY,
    HELP_CATEGORIES,
    helpArticleNestedPath,
} from "@/lib/content/help-data";
import { CATEGORY_ORDER } from "./help-data";
import { HelpCategoryIcon } from "@/components/marketing/help-category-icon";

export function HelpArticleListingsByCategorySection() {
    return (
        <section id="help-topics" className="marketing-section" aria-labelledby="help-topics-heading">
            <div className="marketing-container">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Help topics</p>
                    <h2 id="help-topics-heading">Browse every topic.</h2>
                </div>
                <div className="help-topics">
                    {CATEGORY_ORDER.map((categoryKey) => {
                        const catInfo = HELP_CATEGORIES[categoryKey];
                        const articles = HELP_BY_CATEGORY[categoryKey] ?? [];
                        return (
                            <div key={categoryKey} className="mi-split">
                                <div className="mi-head help-topic-head">
                                    <HelpCategoryIcon category={categoryKey} size={22} />
                                    <h3>{catInfo.label}</h3>
                                    <p>{catInfo.description}</p>
                                    <Link href={`/help/${categoryKey}`} className="home-text-link">
                                        All {catInfo.label} guides <ArrowRight size={14} aria-hidden="true" />
                                    </Link>
                                </div>
                                <ul className="mi-list">
                                    {articles.map((article) => (
                                        <li key={article.slug}>
                                            <FileText size={18} aria-hidden="true" />
                                            <div>
                                                <p className="mi-list-title">
                                                    <Link href={helpArticleNestedPath(article)} className="help-topic-link">
                                                        {article.title}
                                                    </Link>
                                                </p>
                                                <p className="line-clamp-2">{article.excerpt}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
