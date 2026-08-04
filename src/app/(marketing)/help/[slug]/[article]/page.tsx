import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
import { notFound } from "next/navigation";
import {
    HELP_ARTICLE_MAP,
    HELP_BY_CATEGORY,
    HELP_CATEGORIES,
    HELP_CATEGORY_SLUGS,
    isHelpCategory,
    helpArticleNestedPath,
    type HelpArticle,
} from "@/lib/content/help-data";
import { HelpArticleView } from "@/components/marketing/help-article-view";

export function generateStaticParams() {
    const params: { slug: string; article: string }[] = [];
    for (const category of HELP_CATEGORY_SLUGS) {
        for (const a of HELP_BY_CATEGORY[category]) {
            params.push({ slug: category, article: a.slug });
        }
    }
    return params;
}

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string; article: string }> }
): Promise<Metadata> {
    const { slug: category, article: articleSlug } = await params;
    if (!isHelpCategory(category)) return {};
    const article = HELP_ARTICLE_MAP[articleSlug];
    if (!article || article.category !== category) return {};
    const catInfo = HELP_CATEGORIES[category];
    const path = helpArticleNestedPath(article);
    const pageTitle = `${article.title} — ${catInfo.label}`;
    const canonicalUrl = `https://www.zyenereviews.com${path}`;
    return mergeMarketingSocial({
        title: pageTitle,
        description: article.excerpt,
        alternates: { canonical: canonicalUrl },
        openGraph: {
            title: pageTitle,
            description: article.excerpt,
            url: canonicalUrl,
        },
        twitter: {
            card: "summary_large_image",
            title: pageTitle,
            description: article.excerpt,
        },
    });
}

export default async function HelpNestedArticlePage({
    params,
}: {
    params: Promise<{ slug: string; article: string }>;
}) {
    const { slug: category, article: articleSlug } = await params;
    if (!isHelpCategory(category)) notFound();
    const article: HelpArticle | undefined = HELP_ARTICLE_MAP[articleSlug];
    if (!article || article.category !== category) notFound();

    return (
        <HelpArticleView
            article={article}
            canonicalPath={helpArticleNestedPath(article)}
        />
    );
}
