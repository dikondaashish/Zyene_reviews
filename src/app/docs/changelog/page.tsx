import type { Metadata } from "next";
import { DocCopyPageButton } from "@/components/docs/doc-copy-page-button";
import { DocToc, type TocItem } from "@/components/docs/doc-toc";

export const metadata: Metadata = {
    title: "Changelog",
    description: "Zyene Reviews product changelog, new features, improvements, API changes, and bug fixes listed by release date.",
    alternates: { canonical: "https://www.zyenereviews.com/docs/changelog" },
    openGraph: { title: "Changelog, Zyene Reviews", description: "New features, improvements, API changes, and bug fixes by release date.", url: "https://www.zyenereviews.com/docs/changelog" },
    twitter: { card: "summary_large_image", title: "Changelog, Zyene Reviews", description: "New features, API changes, and bug fixes by release date." },
};

export default function DocsChangelogPage() {
    const toc: TocItem[] = [
        { title: "2026-04", href: "#2026-04" },
        { title: "Format", href: "#format" },
    ];

    return (
        <div className="flex w-full items-start">
            <main className="prose-docs min-w-0 flex-1 px-6 py-8 lg:max-w-3xl lg:px-12">
                <div className="mb-4 flex items-center text-sm text-muted-foreground">
                    Product
                    <span className="mx-2">&gt;</span>
                    <span className="font-medium text-foreground">Changelog</span>
                </div>

                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div id="doc-page-content" className="min-w-0 flex-1">
                        <h1 className="mb-0 mt-0">Changelog</h1>
                        <p>High-signal updates to the developer platform and docs site.</p>

                        <h2 id="2026-04">2026-04</h2>
                        <ul>
                            <li>Docs: sidebar navigation, ⌘K search, and copy-page on long-form articles.</li>
                            <li>API reference and cookbook curls use the live dashboard origin as the API base URL.</li>
                            <li>Navigation uses the signed-in app host for Dashboard and Integrations links.</li>
                        </ul>

                        <h2 id="format">Format</h2>
                        <p>
                            Major features are announced here alongside user-facing release notes. Breaking API changes will always
                            include migration steps in the API Reference.
                        </p>
                    </div>
                    <DocCopyPageButton containerId="doc-page-content" className="shrink-0" />
                </div>
            </main>
            <DocToc items={toc} />
        </div>
    );
}
