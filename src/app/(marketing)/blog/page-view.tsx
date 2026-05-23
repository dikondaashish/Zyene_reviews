import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { BLOG_POSTS } from "@/lib/phase4/blog-data";
import { BlogHeroSection } from "./blog-hero-section";
import { BlogPillarFiltersSection } from "./blog-pillar-filters-section";
import { BlogFeaturedPostSection } from "./blog-featured-post-section";
import { BlogAllPostsGridSection } from "./blog-all-posts-grid-section";
import { BlogNewsletterCtaSection } from "./blog-newsletter-cta-section";

export default function BlogHubPage() {
    const featured = BLOG_POSTS[0];
    const rest = BLOG_POSTS.slice(1);

    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://zyenereviews.com/" },
                    { name: "Blog", url: "https://zyenereviews.com/blog" },
                ]}
            />
            <BlogHeroSection />
            <BlogPillarFiltersSection />
            <BlogFeaturedPostSection featured={featured} />
            <BlogAllPostsGridSection posts={rest} />
            <BlogNewsletterCtaSection />
        </>
    );
}
