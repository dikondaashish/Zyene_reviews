import { DocCopyPageButton } from "@/components/docs/doc-copy-page-button";
import { DocToc, type TocItem } from "@/components/docs/doc-toc";

export default function DocsOverviewPage() {
    const tocItems: TocItem[] = [
        { title: "How does it work? (at a glance)", href: "#how-it-works" },
        { title: "Review Aggregation", href: "#review-aggregation" },
        { title: "Brand Intelligence API", href: "#api" },
        { title: "Automated Disputing & Replies", href: "#disputing" },
        { title: "Custom Embeds & RAG", href: "#embeds" },
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
                        <h1 className="mb-0 mt-0">Overview — What is Zyene?</h1>
                        <p className="text-lg">
                            Zyene Reviews is the long-term and short-term reputation infrastructure for physical brands. It is the{" "}
                            <strong>state of the art</strong> across multiple different business paradigms, like Google Business,
                            Yelp, and Zomato.
                        </p>

                        <p>
                            With Zyene, developers and business owners can provide perfect recall about customer sentiment to build
                            operations that are more intelligent, more personalized, and more consistent. Additionally,{" "}
                            <em>Zyene</em> has all the pieces of the local presence stack built in:
                        </p>

                        <ul>
                            <li>
                                <strong>Review Aggregation</strong>
                            </li>
                            <li>
                                <strong>Brand Intelligence API</strong>
                            </li>
                            <li>
                                <strong>Connectors and syncing</strong>
                            </li>
                            <li>
                                <strong>Managed Sentiment RAG platform</strong>
                            </li>
                        </ul>

                        <p className="mt-8">
                            All this, coming together, makes Zyene the best abstraction to provide to your marketing teams and backend
                            CRM nodes.
                        </p>

                        <h2 id="how-it-works">How does it work? (at a glance)</h2>
                        <p>
                            Zyene uses a hybrid approach to capturing customer experiences. Behind the scenes, it maintains a
                            distributed event graph of your Google Business profile updates, review activity, and direct feedback
                            channels you connect.
                        </p>

                        <h3 id="review-aggregation">Review Aggregation</h3>
                        <p>
                            Once connected, Zyene securely sweeps historical reviews and monitors real-time changes across your
                            connected platforms. The processing pipeline normalizes unstructured text into a structured record store
                            you can filter, alert on, and export.
                        </p>

                        <h3 id="api">Brand Intelligence API</h3>
                        <p>
                            Use the Developer API to read reviews, send review requests, and pull analytics summaries. Authenticate
                            with an API key from Integrations and pass it as <code>X-API-Key</code> or{" "}
                            <code>Authorization: Bearer</code>.
                        </p>

                        <h3 id="disputing">Automated Disputing & Replies</h3>
                        <p>
                            AI-assisted reply drafting helps your team respond quickly and consistently. You stay in control of what
                            gets published; Zyene focuses on speed and tone alignment with your brand voice settings.
                        </p>

                        <h3 id="embeds">Custom Embeds & RAG</h3>
                        <p>
                            Surface reviews on your own site with embeddable widgets, and use semantic search over your review corpus
                            where enabled for your workspace — ideal for marketing microsites and internal insight tools.
                        </p>
                    </div>
                    <DocCopyPageButton containerId="doc-page-content" className="shrink-0" />
                </div>
            </main>

            <DocToc items={tocItems} />
        </div>
    );
}
