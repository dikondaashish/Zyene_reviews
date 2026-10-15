import type { BlogPost } from "@/lib/content/blog-types";
import type { ResourceGuide } from "@/lib/content/resource-data";
import { getBlogImage } from "@/lib/content/blog-data";
import { resourceImage } from "@/components/marketing/resource-imagery";
import { buildOrganizationSchema } from "@/lib/seo/organization-schema";
import { JSON_LD_BASE_URL } from "./json-ld-constants";
import { JsonLdScript } from "./json-ld-script";

interface ArticleJsonLdProps {
    post?: BlogPost;
    resource?: ResourceGuide;
}

export function ArticleJsonLd({ post, resource }: ArticleJsonLdProps) {
    if (resource) {
        const url = `${JSON_LD_BASE_URL}/resources/${resource.slug}`;
        const image = resourceImage(resource.slug);
        const schema = {
            "@context": "https://schema.org",
            "@type": "Article",
            "@id": `${url}#article`,
            headline: resource.title,
            description: resource.metaDescription,
            image: [JSON_LD_BASE_URL + image.src],
            datePublished: resource.lastUpdated,
            dateModified: resource.dateModified ?? resource.lastUpdated,
            author: {
                "@type": "Organization",
                name: "Zyene Reviews Editorial Team",
            },
            publisher: buildOrganizationSchema(),
            mainEntityOfPage: {
                "@type": "WebPage",
                "@id": url,
            },
            keywords: resource.keywords?.join(", "),
        };
        return <JsonLdScript schema={schema} />;
    }

    if (!post) return null;

    const url = `${JSON_LD_BASE_URL}/blog/${post.slug}`;
    const image = post.image ?? getBlogImage(post.slug);
    const schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.metaDescription,
        image: [JSON_LD_BASE_URL + image.src],
        datePublished: post.publishedAt,
        dateModified: post.dateModified ?? post.publishedAt,
        author: {
            "@type": "Person",
            name: post.author.name,
            jobTitle: post.author.role,
        },
        publisher: buildOrganizationSchema(),
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": url,
        },
        articleSection: post.pillarLabel,
        keywords: post.keywords.join(", "),
    };

    return <JsonLdScript schema={schema} />;
}
