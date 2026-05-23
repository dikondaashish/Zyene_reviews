import type { Metadata } from "next";
import { DocCodeBlock } from "@/components/docs/doc-code-block";
import { DocCopyPageButton } from "@/components/docs/doc-copy-page-button";
import { DocToc, type TocItem } from "@/components/docs/doc-toc";
import { BASE_URL } from "@/config/env";

export const metadata: Metadata = {
    title: "Use with AI",
    description: "Integrate Zyene Reviews with AI tools. Use MCP, REST API responses, and structured data in your AI workflows for review management automation.",
    alternates: { canonical: "https://zyenereviews.com/docs/install" },
    openGraph: { title: "Use with AI, Zyene Reviews Docs", description: "Integrate Zyene Reviews with AI tools, MCP, and automation pipelines.", url: "https://zyenereviews.com/docs/install" },
    twitter: { card: "summary_large_image", title: "Use with AI, Zyene Reviews Docs", description: "Integrate Zyene Reviews with AI tools and automation workflows." },
};

export default function DocsInstallWithAiPage() {
    const docsApiUrl = `${BASE_URL}/docs/api`;
    const docsCookbookUrl = `${BASE_URL}/docs/cookbook`;
    const toc: TocItem[] = [
        { title: "Overview", href: "#overview" },
        { title: "Doc URLs", href: "#urls" },
        { title: "What to paste", href: "#prompt" },
        { title: "Keys & safety", href: "#safety" },
    ];

    return (
        <div className="flex w-full items-start">
            <main className="prose-docs min-w-0 flex-1 px-6 py-8 lg:max-w-3xl lg:px-12">
                <div className="mb-4 flex items-center text-sm text-muted-foreground">
                    Getting Started
                    <span className="mx-2">&gt;</span>
                    <span className="font-medium text-foreground">Use with AI</span>
                </div>

                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div id="doc-page-content" className="min-w-0 flex-1">
                        <h1 className="mb-0 mt-0">Use with AI</h1>
                        <p>
                            Zyene Reviews is <strong>hosted, proprietary software</strong>. You do not run our codebase, you integrate
                            from <strong>your</strong> project (Node, Python, workers, automation tools) using the public HTTP API and
                            an API key from the dashboard. Use this page when you want Cursor, Copilot, or similar tools to follow our
                            docs while you build.
                        </p>

                        <h2 id="overview">Overview</h2>
                        <ul>
                            <li>Add our doc URLs as context in your editor.</li>
                            <li>Generate code that calls <code>/api/v1/…</code> on your Zyene host.</li>
                            <li>Store <code>zy_</code> keys only in your secrets, never in source or chat logs.</li>
                        </ul>

                        <h2 id="urls">Doc URLs</h2>
                        <p>Paste into your AI tool or attach as documentation context:</p>
                        <DocCodeBlock
                            language="bash"
                            code={`# API Reference ,  auth, payloads, errors
${docsApiUrl}

# Cookbook ,  curl recipes
${docsCookbookUrl}`}
                        />

                        <h2 id="prompt">What to paste</h2>
                        <p>Tell the model:</p>
                        <ul>
                            <li>To follow the API Reference for headers (<code>X-API-Key</code> or Bearer) and JSON bodies.</li>
                            <li>Your rules: SMS vs email, rate limits, PII handling, idempotency.</li>
                            <li>
                                To read the real key from <strong>your</strong> environment (for example <code>ZYENE_API_KEY</code>),
                                never inline a production key.
                            </li>
                        </ul>

                        <h2 id="safety">Keys &amp; safety</h2>
                        <p>
                            Keys are bound to one business. Rotate in Integrations if a key leaks. Prefer server-to-server calls so
                            keys never ship to browsers or client analytics.
                        </p>
                    </div>
                    <DocCopyPageButton containerId="doc-page-content" className="shrink-0" />
                </div>
            </main>
            <DocToc items={toc} />
        </div>
    );
}
