import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
    HELP_ARTICLE_MAP,
    HELP_CATEGORY_SLUGS,
    HELP_CATEGORIES,
    HELP_SLUGS,
    isHelpCategory,
    helpArticleNestedPath,
} from "@/lib/phase4/help-data";
import { HelpCategoryView } from "@/components/marketing/help-category-view";
import { HelpArticleView } from "@/components/marketing/help-article-view";

export function generateStaticParams() {
    return [
        ...HELP_SLUGS.map((slug) => ({ slug })),
        ...HELP_CATEGORY_SLUGS.map((slug) => ({ slug })),
    ];
}

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const { slug } = await params;

    if (isHelpCategory(slug)) {
        const cat = HELP_CATEGORIES[slug];
        const catTitle = `${cat.label} — Help Center | Zyene Reviews`;
        return {
            title: catTitle,
            description: cat.description,
            alternates: { canonical: `https://zyenereviews.com/help/${slug}` },
            openGraph: {
                title: catTitle,
                description: cat.description,
                url: `https://zyenereviews.com/help/${slug}`,
            },
            twitter: {
                card: "summary_large_image",
                title: catTitle,
                description: cat.description,
            },
        };
    }

    const article = HELP_ARTICLE_MAP[slug];
    if (!article) return {};
    const catInfo = HELP_CATEGORIES[article.category];
    const articleTitle = `${article.title} — ${catInfo.label} | Zyene Reviews Help`;
    const canonicalUrl = `https://zyenereviews.com${helpArticleNestedPath(article)}`;
    return {
        title: articleTitle,
        description: article.excerpt,
        alternates: { canonical: canonicalUrl },
        openGraph: {
            title: articleTitle,
            description: article.excerpt,
            url: canonicalUrl,
        },
        twitter: {
            card: "summary_large_image",
            title: articleTitle,
            description: article.excerpt,
        },
    };
}

export default async function HelpSlugPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    if (isHelpCategory(slug)) {
        return <HelpCategoryView categoryKey={slug} />;
    }

    const article = HELP_ARTICLE_MAP[slug];
    if (!article) notFound();

    return <HelpArticleView article={article} canonicalPath={`/help/${slug}`} />;
}
