import type { BlogAuthor } from "@/lib/content/blog-types";
import { buildBlogAuthorSchema } from "@/lib/seo/blog-author-schema";
import { JSON_LD_BASE_URL } from "./json-ld-constants";
import { JsonLdScript } from "./json-ld-script";

/** ProfilePage structured data for a blog author page. */
export function ProfilePageJsonLd({ author, path, dateModified }: { author: BlogAuthor; path: string; dateModified: string }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "@id": `${JSON_LD_BASE_URL}${path}#profile`,
        url: `${JSON_LD_BASE_URL}${path}`,
        dateModified,
        mainEntity: buildBlogAuthorSchema(author),
    };
    return <JsonLdScript schema={schema} />;
}
