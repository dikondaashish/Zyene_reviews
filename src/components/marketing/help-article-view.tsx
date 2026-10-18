import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { SIGNUP_URL } from "@/config/env";
import {
    HELP_BY_CATEGORY,
    HELP_CATEGORIES,
    helpArticleNestedPath,
    type HelpArticle,
} from "@/lib/content/help-data";
import { ContentRenderer } from "@/components/marketing/content-renderer";
import { LandingHero } from "@/components/marketing/landing-hero";
import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";
import { FAQPageJsonLd, TechArticleJsonLd } from "@/components/seo/json-ld";
import { extractFaqItemsFromHelpBody } from "@/lib/seo/help-faq-from-body";

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

    const canonicalUrl = `https://www.zyenereviews.com${canonicalPath}`;
    const faqItems = extractFaqItemsFromHelpBody(article.body);

    return (
        <>
            {faqItems.length > 0 ? <FAQPageJsonLd faqs={faqItems} /> : null}
            <TechArticleJsonLd
                article={{
                    url: canonicalUrl,
                    headline: article.title,
                    description: article.excerpt,
                    section: catInfo.label,
                    isPartOf: { name: "Zyene Reviews Help Center", url: "https://www.zyenereviews.com/help" },
                    readMinutes: article.readMinutes,
                }}
                breadcrumbs={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Help Center", url: "https://www.zyenereviews.com/help" },
                    { name: catInfo.label, url: `https://www.zyenereviews.com${categoryPath}` },
                    { name: article.title, url: canonicalUrl },
                ]}
            />

            <LandingHero eyebrow={catInfo.label} title={article.title} description={article.excerpt} variant="reading" media={{ kind: "none" }}>
                <nav className="mi-read-meta" aria-label="Breadcrumb">
                    <Link href="/help">Help Center</Link>
                    <Link href={categoryPath}>{catInfo.label}</Link>
                    <span className="inline-flex items-center gap-1.5">
                        <Clock size={14} aria-hidden="true" /> {article.readMinutes} min read
                    </span>
                </nav>
            </LandingHero>

            <section className="marketing-section mi-section-tight">
                <div className="marketing-container mi-read" data-aside="end">
                    <article className="mi-read-main">
                        <ContentRenderer sections={article.body} />
                        <div className="mi-panel">
                            <h2>Still have questions?</h2>
                            <p>Our support team is available Mon-Fri, 9am-6pm EST.</p>
                            <div className="mi-panel-foot">
                                <Link href="/contact" className="home-text-link">
                                    Contact support <ArrowRight size={14} aria-hidden="true" />
                                </Link>
                            </div>
                        </div>
                    </article>

                    <aside className="mi-read-aside">
                        {relatedArticles.length > 0 && (
                            <nav aria-labelledby="help-related-heading">
                                <h2 id="help-related-heading">In this category</h2>
                                <ul className="mi-read-links">
                                    {relatedArticles.map((a) => (
                                        <li key={a.slug}>
                                            <Link href={helpArticleNestedPath(a)}>{a.title}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        )}
                        <div>
                            <h2>New to Zyene?</h2>
                            <p>Start with a 7-day free trial.</p>
                            <Link href={SIGNUP_URL} className="home-text-link" data-track="trial" data-track-location="help-sidebar">
                                Start 7-day free trial <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                        </div>
                        <Link href={categoryPath} className="home-text-link">
                            Back to {catInfo.label}
                        </Link>
                    </aside>
                </div>
            </section>

            <MarketingClosingBand
                title="Put this guide to work in Zyene"
                text="Start a 7-day free trial, or talk to our support team if anything in your setup is unclear."
                secondary={{ label: "Contact support", href: "/contact" }}
                trackLocation="help-article-final"
                headingId="help-article-final-heading"
            />
        </>
    );
}
