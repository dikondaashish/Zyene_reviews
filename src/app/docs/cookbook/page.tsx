import { DocCodeBlock } from "@/components/docs/doc-code-block";
import { DocCopyPageButton } from "@/components/docs/doc-copy-page-button";
import { DocToc, type TocItem } from "@/components/docs/doc-toc";
import { getAppBaseUrl } from "@/config/env";

export default function DocsCookbookPage() {
    const base = getAppBaseUrl();
    const toc: TocItem[] = [
        { title: "Send a request", href: "#send-request" },
        { title: "Page reviews", href: "#page-reviews" },
        { title: "Analytics snapshot", href: "#analytics" },
    ];

    return (
        <div className="flex w-full items-start">
            <main className="prose-docs min-w-0 flex-1 px-6 py-8 lg:max-w-3xl lg:px-12">
                <div className="mb-4 flex items-center text-sm text-muted-foreground">
                    Reference
                    <span className="mx-2">&gt;</span>
                    <span className="font-medium text-foreground">Cookbook</span>
                </div>

                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div id="doc-page-content" className="min-w-0 flex-1">
                        <h1 className="mb-0 mt-0">Cookbook</h1>
                        <p>Short curl examples against your workspace API. The host matches your signed-in Zyene URL.</p>

                        <h2 id="send-request">Send a request</h2>
                        <DocCodeBlock
                            language="bash"
                            code={`curl -X POST "${base}/api/v1/requests/send" \\
  -H "X-API-Key: zy_..." \\
  -H "Content-Type: application/json" \\
  -d '{"customerName":"Alex","customerPhone":"+18165551234","channel":"sms"}'`}
                        />

                        <h2 id="page-reviews">Page reviews</h2>
                        <DocCodeBlock
                            language="bash"
                            code={`curl "${base}/api/v1/reviews?page=2&limit=50" \\
  -H "X-API-Key: zy_..."`}
                        />

                        <h2 id="analytics">Analytics snapshot</h2>
                        <DocCodeBlock
                            language="bash"
                            code={`curl "${base}/api/v1/analytics?days=14" \\
  -H "X-API-Key: zy_..."`}
                        />
                    </div>
                    <DocCopyPageButton containerId="doc-page-content" className="shrink-0" />
                </div>
            </main>
            <DocToc items={toc} />
        </div>
    );
}
