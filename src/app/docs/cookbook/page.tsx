import type { Metadata } from "next";
import { docsPageMetadata } from "@/lib/seo/docs-page-seo";
import { DocsPageJsonLd } from "@/components/seo/json-ld";
import PageView from "./page-view";

export const metadata: Metadata = docsPageMetadata("/docs/cookbook");

export default function DocsCookbookPage() {
    return (
        <>
            <DocsPageJsonLd path="/docs/cookbook" />
            <PageView />
        </>
    );
}
