import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { BLOG_POSTS } from "@/lib/content/blog-data";
import { BlogHeroSection } from "./blog-hero-section";
import { BlogCatalog } from "./blog-catalog";
import { BlogNewsletterCtaSection } from "./blog-newsletter-cta-section";

export default function BlogHubPage() {
    return (
        <>
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: "https://www.zyenereviews.com/" },
                    { name: "Blog", url: "https://www.zyenereviews.com/blog" },
                ]}
            />
            <BlogHeroSection />
            <BlogCatalog posts={BLOG_POSTS} />
            <BlogNewsletterCtaSection />
        </>
    );
}
