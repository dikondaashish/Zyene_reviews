import { DocCopyPageButton } from "@/components/docs/doc-copy-page-button";
import { DocToc, type TocItem } from "@/components/docs/doc-toc";

export default function DocsInstallWithAiPage() {
    const toc: TocItem[] = [
        { title: "Prompt bundle", href: "#prompt" },
        { title: "Safety", href: "#safety" },
    ];

    return (
        <div className="flex w-full items-start">
            <main className="prose-docs min-w-0 flex-1 px-6 py-8 lg:max-w-3xl lg:px-12">
                <div className="mb-4 flex items-center text-sm text-muted-foreground">
                    Getting Started
                    <span className="mx-2">&gt;</span>
                    <span className="font-medium text-foreground">Install with AI</span>
                </div>

                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div id="doc-page-content" className="min-w-0 flex-1">
                        <h1 className="mb-0 mt-0">Install with AI</h1>
                        <p>
                            Use your editor&apos;s AI assistant (Cursor, Copilot, etc.) to integrate faster. Point it at this docs site
                            and the OpenAPI-shaped routes under <code>/api/v1</code>.
                        </p>

                        <h2 id="prompt">Prompt bundle</h2>
                        <p>Give the model:</p>
                        <ul>
                            <li>
                                The <strong>API Reference</strong> page for authentication rules and example curl commands.
                            </li>
                            <li>Your business constraints (SMS vs email, rate limits, PII handling).</li>
                            <li>
                                A requirement to read secrets from environment variables — never hard-code <code>zy_</code> keys.
                            </li>
                        </ul>

                        <h2 id="safety">Safety</h2>
                        <p>
                            Keys are scoped to a single business via the Integrations binding. Rotate keys if they leak, and prefer
                            server-side calls so keys never ship to browsers.
                        </p>
                    </div>
                    <DocCopyPageButton containerId="doc-page-content" className="shrink-0" />
                </div>
            </main>
            <DocToc items={toc} />
        </div>
    );
}
