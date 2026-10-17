import {
    DOCS_PAGE_SEO,
    docsCanonicalUrl,
    docsNavFor,
    type DocsPath,
} from "@/lib/seo/docs-page-seo";
import { marketingCanonicalUrl } from "@/lib/seo/marketing-site-url";
import { TechArticleJsonLd } from "./json-ld-tech-article";

/** TechArticle + BreadcrumbList for a `/docs/*` page, driven by `DOCS_PAGE_SEO`. */
export function DocsPageJsonLd({ path }: { path: DocsPath }) {
    const seo = DOCS_PAGE_SEO[path];
    const url = docsCanonicalUrl(path);
    const nav = docsNavFor(path);
    const docsHome = { name: "Developer Docs", url: docsCanonicalUrl("/docs") };
    const breadcrumbs = [{ name: "Home", url: marketingCanonicalUrl("/") }, docsHome];
    if (path !== "/docs") breadcrumbs.push({ name: nav.label ?? seo.socialTitle, url });

    return (
        <TechArticleJsonLd
            article={{
                url,
                headline: seo.title,
                description: seo.description,
                section: nav.section,
                ...(path === "/docs" ? {} : { isPartOf: docsHome }),
            }}
            breadcrumbs={breadcrumbs}
        />
    );
}
