import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { BreadcrumbJsonLd, ProfilePageJsonLd } from "@/components/seo/json-ld";
import { BLOG_AUTHOR_PAGES, BLOG_AUTHOR_PAGE_MAP } from "@/lib/content/blog-author-directory";
import { formatBlogPublishedDate } from "@/lib/content/format-blog-date";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

const SITE_URL = "https://www.zyenereviews.com";

export function generateStaticParams() {
    return BLOG_AUTHOR_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const page = BLOG_AUTHOR_PAGE_MAP[slug];
    if (!page) return {};
    const title = `${page.author.name}, ${page.author.role}`.slice(0, 60);
    const description = `Articles by ${page.author.name}, ${page.author.role}, on the Zyene Reviews blog.`.slice(0, 160);
    const url = `${SITE_URL}/blog/author/${slug}`;
    return mergeMarketingSocial({
        title,
        description,
        alternates: { canonical: url },
        openGraph: { title, description, url, type: "profile" },
        twitter: { card: "summary_large_image", title, description },
    });
}

export default async function BlogAuthorPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const page = BLOG_AUTHOR_PAGE_MAP[slug];
    if (!page) notFound();
    const path = `/blog/author/${slug}`;

    return (
        <>
            <ProfilePageJsonLd author={page.author} path={path} dateModified={page.lastModified} />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: `${SITE_URL}/` },
                    { name: "Blog", url: `${SITE_URL}/blog` },
                    { name: page.author.name, url: `${SITE_URL}${path}` },
                ]}
            />
            <header className="blog-article-hero">
                <div className="blog-article-hero-inner">
                    <nav className="blog-article-breadcrumb" aria-label="Breadcrumb">
                        <Link href="/blog">Blog</Link>
                        <ChevronRight className="size-3.5" aria-hidden="true" />
                        <span>Authors</span>
                    </nav>
                    <h1>{page.author.name}</h1>
                    <p className="blog-article-dek">{page.bio ?? `${page.author.role} at Zyene Reviews.`}</p>
                    {page.sameAs?.length ? (
                        <ul className="blog-author-links">
                            {page.sameAs.map((href) => (
                                <li key={href}><a href={href} target="_blank" rel="me noopener noreferrer">{new URL(href).hostname.replace(/^www\./, "")}</a></li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            </header>
            <section className="blog-author-posts" aria-labelledby="blog-author-posts-heading">
                <h2 id="blog-author-posts-heading">Articles by {page.author.name}</h2>
                <ul>
                    {page.posts.map((post) => (
                        <li key={post.slug}>
                            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                            <p>{post.excerpt}</p>
                            <small>
                                <time dateTime={post.publishedAt}>{formatBlogPublishedDate(post.publishedAt, "long")}</time> · {post.readMinutes} min read
                            </small>
                        </li>
                    ))}
                </ul>
            </section>
        </>
    );
}
