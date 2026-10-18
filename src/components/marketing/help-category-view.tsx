import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
    HELP_ARTICLES,
    HELP_BY_CATEGORY,
    HELP_CATEGORIES,
    helpArticleNestedPath,
    type HelpCategory,
} from "@/lib/content/help-data";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { HelpCategoryIcon } from "@/components/marketing/help-category-icon";
import { HelpSearch } from "@/components/marketing/help-search";
import { LandingHero } from "@/components/marketing/landing-hero";
import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";

export function HelpCategoryView({ categoryKey }: { categoryKey: HelpCategory }) {
    const catInfo = HELP_CATEGORIES[categoryKey];
    const articles = HELP_BY_CATEGORY[categoryKey] ?? [];
    const searchItems = HELP_ARTICLES.map((article) => ({
        title: article.title,
        excerpt: article.excerpt,
        category: HELP_CATEGORIES[article.category].label,
        path: helpArticleNestedPath(article),
    }));

    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Help Center", url: "https://www.zyenereviews.com/help" },
                    { name: catInfo.label, url: `https://www.zyenereviews.com/help/${categoryKey}` },
                ]}
            />

            <LandingHero
                eyebrow="Zyene Help Center"
                title={catInfo.label}
                description={catInfo.description}
                variant="support"
                media={{
                    kind: "product",
                    label: "Search Zyene help",
                    node: <HelpSearch items={searchItems} popularPaths={articles.slice(0, 3).map(helpArticleNestedPath)} />,
                }}
            >
                <p className="mi-read-meta">
                    <Link href="/help">All help topics</Link>
                </p>
            </LandingHero>

            <section id="help-topics" className="marketing-section mi-section-tight" aria-labelledby="help-category-guides-heading">
                <div className="marketing-container">
                    <div className="mi-head help-topic-head">
                        <HelpCategoryIcon category={categoryKey} size={22} />
                        <h2 id="help-category-guides-heading">{catInfo.label} guides</h2>
                    </div>
                    <ul className="mi-cards" data-cols="2">
                        {articles.map((article) => (
                            <li key={article.slug} className="flex">
                                <Link href={helpArticleNestedPath(article)} className="mi-card w-full">
                                    <h3>{article.title}</h3>
                                    <p className="line-clamp-2">{article.excerpt}</p>
                                    <span className="home-text-link">
                                        Read guide <ArrowRight size={14} aria-hidden="true" />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <MarketingClosingBand
                title="Need a hand with setup?"
                text="Our support team is available Monday through Friday, 9am-6pm EST, and typically responds within 24 hours."
                secondary={{ label: "Contact support", href: "/contact" }}
                trackLocation="help-category-final"
                headingId="help-category-final-heading"
            />
        </>
    );
}
