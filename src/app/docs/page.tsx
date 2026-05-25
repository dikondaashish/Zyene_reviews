import type { Metadata } from "next";
import { DocCopyPageButton } from "@/components/docs/doc-copy-page-button";
import { DocToc, type TocItem } from "@/components/docs/doc-toc";

export const metadata: Metadata = {
    title: "Developer Documentation",
    description: "Complete documentation for Zyene Reviews. Connect Google Business Profile, manage reviews, send review requests via API, and embed widgets.",
    alternates: { canonical: "https://www.zyenereviews.com/docs" },
    openGraph: { title: "Developer Docs, Zyene Reviews", description: "Full API reference, integration guides, plugin setup, and quickstart for Zyene Reviews.", url: "https://www.zyenereviews.com/docs" },
    twitter: { card: "summary_large_image", title: "Developer Docs, Zyene Reviews", description: "API reference, integration guides, quickstart, and plugin setup." },
};

export default function DocsOverviewPage() {
    const tocItems: TocItem[] = [
        { title: "At a glance", href: "#how-it-works" },
        { title: "Review aggregation", href: "#review-aggregation" },
        { title: "Developer API", href: "#api" },
        { title: "Replies & automation", href: "#disputing" },
        { title: "Embeds", href: "#embeds" },
    ];

    return (
        <div className="flex w-full items-start">
            <main className="prose-docs min-w-0 flex-1 px-6 py-8 lg:max-w-3xl lg:px-12">
                <div className="mb-4 flex items-center text-sm text-muted-foreground">
                    Getting Started
                    <span className="mx-2">&gt;</span>
                    <span className="font-medium text-foreground">Overview</span>
                </div>

                <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div id="doc-page-content" className="min-w-0 flex-1">
                        <h1 className="mb-0 mt-0">Overview</h1>
                        <p className="text-lg">
                            Zyene Reviews is <strong>hosted software</strong> for local brands: we pull in reviews from connected
                            platforms, normalize them, and give your team one place to respond, analyze, and automate, with an HTTP API
                            when you need it in your own stack.
                        </p>

                        <p>You use the dashboard and integrations we ship; there is no self-hosted or open-source distribution.</p>

                        <p>Built in:</p>

                        <ul>
                            <li>
                                <strong>Review aggregation</strong>, historical import and ongoing sync where platforms allow.
                            </li>
                            <li>
                                <strong>Developer API</strong>, read reviews, send review requests, pull analytics with an API key.
                            </li>
                            <li>
                                <strong>Connectors</strong>, OAuth and sync for networks like Google Business Profile.
                            </li>
                            <li>
                                <strong>Embeds &amp; optional RAG</strong>, widgets for your site and semantic search over your corpus
                                where enabled.
                            </li>
                        </ul>

                        <h2 id="how-it-works">At a glance</h2>
                        <p>
                            Zyene connects to your public review sources, normalizes what customers said, and keeps a timeline of
                            changes, new reviews, edits, owner replies, and outbound requests, so dashboards, alerts, and API clients
                            stay consistent.
                        </p>

                        <h3 id="review-aggregation">Review aggregation</h3>
                        <p>
                            After you connect a platform, we sweep history and watch for updates. Reviews land in one structured model
                            (rating, text, author label, response state, timestamps) so you filter, export, and build on the same shape
                            everywhere.
                        </p>

                        <h3 id="api">Developer API</h3>
                        <p>
                            Authenticate with a key from <strong>Integrations</strong> using <code>X-API-Key</code> or{" "}
                            <code>Authorization: Bearer</code>. See the API Reference for paths, query parameters, and examples.
                        </p>

                        <h3 id="disputing">Replies &amp; automation</h3>
                        <p>
                            AI-assisted drafts help your team reply faster; you choose what publishes. Automations and webhooks can
                            plug into the same data and API.
                        </p>

                        <h3 id="embeds">Embeds</h3>
                        <p>
                            Surface reviews on your properties with embeddable widgets configured per business, using the same dataset
                            as the dashboard.
                        </p>
                    </div>
                    <DocCopyPageButton containerId="doc-page-content" className="shrink-0" />
                </div>
            </main>

            <DocToc items={tocItems} />
        </div>
    );
}
