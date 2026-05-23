import type { Metadata } from "next";
import { DocCopyPageButton } from "@/components/docs/doc-copy-page-button";
import { DocToc, type TocItem } from "@/components/docs/doc-toc";

export const metadata: Metadata = {
    title: "How Zyene Works",
    description: "Understand the Zyene Reviews architecture, how review sync pipelines, AI reply generation, feedback routing, and campaign triggers work under the hood.",
    alternates: { canonical: "https://zyenereviews.com/docs/how-it-works" },
    openGraph: { title: "How Zyene Works, Docs", description: "Review sync pipelines, AI replies, feedback routing, and campaign automation explained.", url: "https://zyenereviews.com/docs/how-it-works" },
    twitter: { card: "summary_large_image", title: "How Zyene Works, Docs", description: "Review sync pipelines, AI replies, feedback routing, and campaign automation." },
};

export default function DocsHowItWorksPage() {
    const toc: TocItem[] = [
        { title: "Ingestion", href: "#ingestion" },
        { title: "Normalization", href: "#normalization" },
        { title: "Delivery", href: "#delivery" },
    ];

    return (
        <div className="flex w-full items-start">
            <main className="prose-docs min-w-0 flex-1 px-6 py-8 lg:max-w-3xl lg:px-12">
                <div className="mb-4 flex items-center text-sm text-muted-foreground">
                    Concepts
                    <span className="mx-2">&gt;</span>
                    <span className="font-medium text-foreground">How Zyene Works</span>
                </div>

                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div id="doc-page-content" className="min-w-0 flex-1">
                        <h1 className="mb-0 mt-0">How Zyene Works</h1>
                        <p>
                            Zyene connects to your public review sources, normalizes what customers said, and exposes that data to
                            your team through the dashboard, automations, and the Developer API.
                        </p>

                        <h2 id="ingestion">Ingestion</h2>
                        <p>
                            OAuth-backed connectors (for example Google Business Profile) pull historical reviews and subscribe to
                            changes where the platform allows. Webhooks and background jobs keep data fresh without manual exports.
                        </p>

                        <h2 id="normalization">Normalization</h2>
                        <p>
                            Reviews are stored with consistent fields (rating, text, author display name, response state, platform,
                            timestamps) so analytics and API consumers do not need per-vendor parsers.
                        </p>

                        <h2 id="delivery">Delivery</h2>
                        <p>
                            Teams work in the dashboard; systems integrate through <code>/api/v1</code>; customers see optional
                            public pages and embeds powered by the same dataset.
                        </p>
                    </div>
                    <DocCopyPageButton containerId="doc-page-content" className="shrink-0" />
                </div>
            </main>
            <DocToc items={toc} />
        </div>
    );
}
