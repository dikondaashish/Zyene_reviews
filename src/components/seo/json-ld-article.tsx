import type { BlogPost } from "@/lib/phase4/blog-types";
import { buildOrganizationSchema } from "@/lib/seo/organization-schema";
import { JSON_LD_BASE_URL, JSON_LD_DEFAULT_OG_IMAGE } from "./json-ld-constants";
import { JsonLdScript } from "./json-ld-script";

export function ArticleJsonLd({ post }: { post: BlogPost }) {
    const url = `${JSON_LD_BASE_URL}/blog/${post.slug}`;

    const schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.metaDescription,
        image: [JSON_LD_DEFAULT_OG_IMAGE],
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
