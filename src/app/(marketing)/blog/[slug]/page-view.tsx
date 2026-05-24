import { ArticleJsonLd, BreadcrumbJsonLd, FAQPageJsonLd } from "@/components/seo/json-ld";
import { notFound } from "next/navigation";
import { BLOG_POST_MAP, BLOG_SLUGS } from "@/lib/phase4/blog-data";
import { BlogSlugArticleHeaderSection } from "./blog-slug-article-header-section";
import { BlogSlugArticleBodySidebarSection } from "./blog-slug-article-body-sidebar-section";
import { BlogSlugMorePostsSection } from "./blog-slug-more-posts-section";

export default async function BlogPostPage(
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const post = BLOG_POST_MAP[slug];
    if (!post) notFound();

    const relatedPosts = BLOG_SLUGS.filter((s) => s !== slug)
        .slice(0, 3)
        .map((s) => BLOG_POST_MAP[s]);

    return (
        <>
            <ArticleJsonLd post={post} />
            {post.faqs && post.faqs.length > 0 ? <FAQPageJsonLd faqs={post.faqs} /> : null}
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Blog", url: "https://zyenereviews.com/blog" },
                    { name: post.title, url: `https://zyenereviews.com/blog/${slug}` },
                ]}
            />
            <BlogSlugArticleHeaderSection post={post} />
            <BlogSlugArticleBodySidebarSection post={post} relatedPosts={relatedPosts} />
            <BlogSlugMorePostsSection slug={slug} />
        </>
    );
}
