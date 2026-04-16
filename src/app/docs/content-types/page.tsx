import { DocCopyPageButton } from "@/components/docs/doc-copy-page-button";
import { DocToc, type TocItem } from "@/components/docs/doc-toc";

export default function DocsContentTypesPage() {
    const toc: TocItem[] = [
        { title: "Reviews", href: "#reviews" },
        { title: "Requests", href: "#requests" },
        { title: "Responses", href: "#responses" },
    ];

    return (
        <div className="flex w-full items-start">
            <main className="prose-docs min-w-0 flex-1 px-6 py-8 lg:max-w-3xl lg:px-12">
                <div className="mb-4 flex items-center text-sm text-muted-foreground">
                    Concepts
                    <span className="mx-2">&gt;</span>
                    <span className="font-medium text-foreground">Content Types</span>
                </div>

                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div id="doc-page-content" className="min-w-0 flex-1">
                        <h1 className="mb-0 mt-0">Content Types</h1>
                        <p>These are the primary objects you will see in the product and API.</p>

                        <h2 id="reviews">Reviews</h2>
                        <p>
                            A review is a row with rating, text, author display metadata, platform label, visibility, and response
                            workflow state (<code>pending</code>, <code>responded</code>, <code>ignored</code>).
                        </p>

                        <h2 id="requests">Requests</h2>
                        <p>
                            Review requests are outbound SMS or email invitations with template variables such as{" "}
                            <code>{"{customer_name}"}</code> and <code>{"{review_link}"}</code>. They track delivery and conversion.
                        </p>

                        <h2 id="responses">Responses</h2>
                        <p>
                            Public replies are stored on the review record with timestamps and source metadata so you can tell what
                            was posted through Zyene versus natively in a platform UI.
                        </p>
                    </div>
                    <DocCopyPageButton containerId="doc-page-content" className="shrink-0" />
                </div>
            </main>
            <DocToc items={toc} />
        </div>
    );
}
