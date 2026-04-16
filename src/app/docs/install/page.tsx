import { DocCodeBlock } from "@/components/docs/doc-code-block";
import { DocCopyPageButton } from "@/components/docs/doc-copy-page-button";
import { DocToc, type TocItem } from "@/components/docs/doc-toc";
import { BASE_URL } from "@/config/env";

const CLONE_SNIPPET = `# 1. Clone the Zyene Reviews repo
git clone https://github.com/dikondaashish/Zyene_reviews.git
cd Zyene_reviews

# 2. Install dependencies
pnpm install

# 3. Copy environment file and start the dev server
cp .env.example .env.local
pnpm dev`;

export default function DocsInstallWithAiPage() {
    const docsApiUrl = `${BASE_URL}/docs/api`;
    const toc: TocItem[] = [
        { title: "Clone & run", href: "#clone" },
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
                            Run the product locally for development, then use your editor&apos;s AI assistant (Cursor, Copilot,
                            etc.) against the live <code>/docs/api</code> contract.
                        </p>

                        <h2 id="clone">Clone &amp; run</h2>
                        <p>From a terminal on your machine:</p>
                        <DocCodeBlock code={CLONE_SNIPPET} language="bash" />

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
                        <DocCodeBlock
                            language="bash"
                            code={`# Paste this URL into Cursor / your AI workspace (attach as context)
# ${docsApiUrl}`}
                        />

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
