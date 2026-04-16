import { DocToc, TocItem } from "@/components/docs/doc-toc";
import { Copy } from "lucide-react";

export default function DocsOverviewPage() {
    const tocItems: TocItem[] = [
        { title: "How does it work? (at a glance)", href: "#how-it-works" },
        { title: "Review Aggregation", href: "#review-aggregation" },
        { title: "Brand Intelligence API", href: "#api" },
        { title: "Automated Disputing", href: "#disputing" },
        { title: "Custom Embeds & RAG", href: "#embeds" },
    ];

    return (
        <div className="flex w-full items-start">
            <main className="flex-1 w-full max-w-3xl min-w-0 py-8 px-6 lg:px-12 prose-docs">
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                    Getting Started 
                    <span className="mx-2">&gt;</span> 
                    <span className="text-foreground font-medium">Overview</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h1 className="mb-0 mt-0">Overview — What is Zyene?</h1>
                    <button className="hidden md:flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors shadow-sm text-foreground">
                        <Copy className="h-3.5 w-3.5" />
                        Copy page
                    </button>
                </div>

                <p className="text-lg">
                    Zyene Reviews is the long-term and short-term reputation infrastructure for physical brands. It is the <strong>state of the art</strong> across multiple different business paradigms, like Google Business, Yelp, and Zomato.
                </p>

                <p>
                    With Zyene, developers and business owners can provide perfect recall about customer sentiment to build operations that are more intelligent, more personalized, and more consistent. Additionally, <em>Zyene</em> has all the pieces of the local presence stack built in:
                </p>

                <ul>
                    <li><strong>Review Aggregation</strong></li>
                    <li><strong>Brand Intelligence API</strong></li>
                    <li><strong>Connectors and syncing</strong></li>
                    <li><strong>Managed Sentiment RAG platform</strong></li>
                </ul>

                <p className="mt-8">
                    All this, coming together, makes Zyene the best abstraction to provide to your marketing teams and backend CRM nodes.
                </p>

                <h2 id="how-it-works">How does it work? (at a glance)</h2>
                <p>
                    Zyene uses a hybrid approach to capturing customer experiences. Behind the scenes, it maintains a massive distributed event graph of your Google Business profile updates, customer wait times, and direct feedback.
                </p>

                <h3 id="review-aggregation">Review Aggregation</h3>
                <p>
                    Once connected, Zyene securely sweeps historical reviews and monitors real-time changes across your connected platforms. Our processing engine normalizes this unstructured text into an actionable semantic database. 
                </p>

                <h3 id="api">Brand Intelligence API</h3>
                <p>
                    Access raw data, sentiment scores, and automated competitor summaries using the Developer API. Pass your API key as a Bearer token and instantly inject live review data into your internal dashboards.
                </p>

                <h3 id="disputing">Automated Disputing & Replies</h3>
                <p>
                    Our AI models can automatically draft highly contextual replies to customer reviews based on your specific brand voice instructions, ensuring no customer is left waiting.
                </p>

                <h3 id="embeds">Custom Embeds & RAG</h3>
                <p>
                    Want to show off? Our advanced semantic search (RAG) platform allows you to query your own database of reviews and build beautiful marketing widgets.
                </p>

            </main>

            <DocToc items={tocItems} />
        </div>
    );
}
