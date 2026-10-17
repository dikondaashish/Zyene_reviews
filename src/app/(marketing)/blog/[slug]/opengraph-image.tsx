import { BLOG_POST_MAP, PILLAR_LABELS } from "@/lib/content/blog-data";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Zyene Reviews blog article";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = BLOG_POST_MAP[slug];
    return renderOgCard({
        eyebrow: post ? `Blog · ${PILLAR_LABELS[post.pillar]}` : "Blog",
        title: post?.title ?? "Zyene Reviews blog",
        subtitle: post ? `${post.readMinutes} min read` : undefined,
        image: post?.image?.src,
    });
}
