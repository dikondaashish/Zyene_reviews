import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
import { BLOG_POST_MAP, BLOG_SLUGS, getBlogImage } from "@/lib/content/blog-data";

export function generateStaticParams() {
    return BLOG_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const { slug } = await params;
    const post = BLOG_POST_MAP[slug];
    if (!post) return {};
    const image = getBlogImage(slug);
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
            images: [{
                url: "https://www.zyenereviews.com" + image.src,
                alt: image.alt,
                width: image.width,
                height: image.height,
            }],
        },
        twitter: {
            card: "summary_large_image",
            title: post.metaTitle,
            description: post.metaDescription,
            images: ["https://www.zyenereviews.com" + image.src],
        },
    });
}

import PageView from "./page-view";

export default PageView;
