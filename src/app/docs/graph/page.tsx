import { DocCopyPageButton } from "@/components/docs/doc-copy-page-button";
import { DocToc, type TocItem } from "@/components/docs/doc-toc";

export default function DocsReviewGraphPage() {
    const toc: TocItem[] = [
        { title: "Entities", href: "#entities" },
        { title: "Timeline", href: "#timeline" },
    ];

    return (
        <div className="flex w-full items-start">
            <main className="prose-docs min-w-0 flex-1 px-6 py-8 lg:max-w-3xl lg:px-12">
                <div className="mb-4 flex items-center text-sm text-muted-foreground">
                    Concepts
                    <span className="mx-2">&gt;</span>
                    <span className="font-medium text-foreground">Review Graph</span>
                </div>

                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div id="doc-page-content" className="min-w-0 flex-1">
                        <h1 className="mb-0 mt-0">Review Graph</h1>
                        <p>
                            The review graph is the linked model of businesses, platforms, reviews, responses, outbound requests,
                            and member activity. It is not a separate product surface — it is how Zyene reasons about state and
                            permissions.
                        </p>

                        <h2 id="entities">Entities</h2>
                        <ul>
                            <li>
                                <strong>Organization</strong> — billing and membership boundary.
                            </li>
                            <li>
                                <strong>Business</strong> — the public brand location you manage.
                            </li>
                            <li>
                                <strong>Review platform row</strong> — credentials and sync health for a vendor connection.
                            </li>
                            <li>
                                <strong>Review</strong> — normalized customer feedback record.
                            </li>
                        </ul>

                        <h2 id="timeline">Timeline</h2>
                        <p>
                            Events such as new stars, edited text, owner replies, and outbound request conversions append to the
                            history you see in analytics and audit trails.
                        </p>
                    </div>
                    <DocCopyPageButton containerId="doc-page-content" className="shrink-0" />
                </div>
            </main>
            <DocToc items={toc} />
        </div>
    );
}
