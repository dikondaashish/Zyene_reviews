import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
import { BLOG_POST_MAP, BLOG_SLUGS } from "@/lib/content/blog-data";

export function generateStaticParams() {
    return BLOG_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const { slug } = await params;
    const post = BLOG_POST_MAP[slug];
    if (!post) return {};
    return mergeMarketingSocial({
        title: post.metaTitle,
        description: post.metaDescription,
        alternates: { canonical: `https://www.zyenereviews.com/blog/${slug}` },
        keywords: post.keywords,
        openGraph: {
            title: post.metaTitle,
            description: post.metaDescription,
            url: `https://www.zyenereviews.com/blog/${slug}`,
            type: "article",
            publishedTime: post.publishedAt,
            authors: [post.author.name],
        },
        twitter: {
            card: "summary_large_image",
            title: post.metaTitle,
            description: post.metaDescription,
        },
    });
}

import PageView from "./page-view";

export default PageView;
