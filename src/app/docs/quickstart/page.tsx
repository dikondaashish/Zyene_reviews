import Link from "next/link";
import { DocCodeBlock } from "@/components/docs/doc-code-block";
import { DocCopyPageButton } from "@/components/docs/doc-copy-page-button";
import { DocToc, type TocItem } from "@/components/docs/doc-toc";
import { getAppBaseUrl, getAppIntegrationsUrl } from "@/config/env";

export default function DocsQuickstartPage() {
    const base = getAppBaseUrl();
    const integrations = getAppIntegrationsUrl();
    const toc: TocItem[] = [
        { title: "Prerequisites", href: "#prerequisites" },
        { title: "Create an API key", href: "#api-key" },
        { title: "First request", href: "#first-request" },
    ];

    return (
        <div className="flex w-full items-start">
            <main className="prose-docs min-w-0 flex-1 px-6 py-8 lg:max-w-3xl lg:px-12">
                <div className="mb-4 flex items-center text-sm text-muted-foreground">
                    Getting Started
                    <span className="mx-2">&gt;</span>
                    <span className="font-medium text-foreground">Quickstart</span>
                </div>

                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div id="doc-page-content" className="min-w-0 flex-1">
                        <h1 className="mb-0 mt-0">Quickstart</h1>

                        <p>
                            Connect your workspace, issue an API key, and call a live endpoint in a few minutes. All examples assume
                            your app is deployed at <code>{base}</code> (<code>NEXT_PUBLIC_APP_URL</code>).
                        </p>

                        <h2 id="prerequisites">Prerequisites</h2>
                        <ul>
                            <li>A Zyene account with at least one active business.</li>
                            <li>
                                Access to{" "}
                                <Link href={integrations} className="text-primary underline underline-offset-4">
                                    Integrations
                                </Link>{" "}
                                in the dashboard.
                            </li>
                        </ul>

                        <h2 id="api-key">Create an API key</h2>
                        <ol>
                            <li>Open Integrations in the app.</li>
                            <li>Locate the Developer API section and generate a key (prefix <code>zy_</code>).</li>
                            <li>Store it in a secret manager — it is shown only once.</li>
                        </ol>

                        <h2 id="first-request">First request</h2>
                        <p>List recent reviews:</p>
                        <DocCodeBlock
                            language="bash"
                            code={`curl "${base}/api/v1/reviews?page=1&limit=5" \\
  -H "X-API-Key: zy_..."`}
                        />
                        <p>
                            Then read the{" "}
                            <Link href="/docs/api" className="text-primary underline underline-offset-4">
                                API Reference
                            </Link>{" "}
                            for request payloads and filters.
                        </p>
                    </div>
                    <DocCopyPageButton containerId="doc-page-content" className="shrink-0" />
                </div>
            </main>
            <DocToc items={toc} />
        </div>
    );
}
