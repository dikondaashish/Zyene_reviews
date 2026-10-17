import {
    buildBreadcrumbListSchema,
    buildTechArticleSchema,
    type TechArticleSchemaInput,
} from "@/lib/seo/tech-article-schema";
import type { BreadcrumbItem } from "./json-ld-types";
import { JsonLdScript } from "./json-ld-script";

/**
 * TechArticle + BreadcrumbList in one `@graph` for help-center articles and
 * developer docs, with publisher = Zyene Reviews Organization.
 */
export function TechArticleJsonLd({
    article,
    breadcrumbs,
}: {
    article: TechArticleSchemaInput;
    breadcrumbs: BreadcrumbItem[];
}) {
    const schema = {
        "@context": "https://schema.org",
        "@graph": [buildTechArticleSchema(article), buildBreadcrumbListSchema(breadcrumbs)],
    };

    return <JsonLdScript schema={schema} />;
}
