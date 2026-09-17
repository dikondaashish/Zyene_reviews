import { ApiResponseGuide } from "@/app/docs/api/api-response-guide";
import Link from "next/link";
import { DocCodeBlock } from "@/components/docs/doc-code-block";
import { DocCopyPageButton } from "@/components/docs/doc-copy-page-button";
import { DocToc, type TocItem } from "@/components/docs/doc-toc";
import { getAppBaseUrl, getAppIntegrationsUrl } from "@/config/env";
import { buildEndpoints } from "./api-data";

export function ApiContentSection() {
    const apiOrigin = getAppBaseUrl();
    const endpoints = buildEndpoints(apiOrigin);
    const tocItems: TocItem[] = [
        { title: "Authentication", href: "#authentication" },
        { title: "Base URL", href: "#base-url" },
        { title: "Endpoints", href: "#endpoints" },
    ];
    return (
        <div className="flex w-full items-start">
            <main className="prose-docs min-w-0 flex-1 px-6 py-8 lg:max-w-3xl lg:px-12">
                <div className="mb-4 flex items-center text-sm text-muted-foreground">
                    Reference
                    <span className="mx-2">&gt;</span>
                    <span className="font-medium text-foreground">API Reference</span>
                </div>

                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div id="doc-page-content" className="min-w-0 flex-1">
                        <h1 className="mb-0 mt-0">Developer API</h1>
                        <p className="text-muted-foreground">
                            JSON over HTTPS on your Zyene workspace. Examples below use{" "}
                            <code className="text-foreground">{apiOrigin}</code>, the same host as the dashboard.
                        </p>

                        <h2 id="authentication">Authentication</h2>
                        <p>
                            Create or rotate a key under{" "}
                            <strong>Integrations → Developer API</strong> in the dashboard. Send it on every request as{" "}
                            <code>X-API-Key: zy_…</code> or <code>Authorization: Bearer zy_…</code>.
                            Each endpoint enforces the scope listed below.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Keep API keys on your server. If a request returns 403, verify the key’s scope and selected business.
                            Contact support with the endpoint and status code if access still fails; never share the key itself.
                        </p>

                        <h2 id="base-url">Base URL</h2>
                        <p>
                            Point clients at the same host that serves your dashboard (for example <code>{apiOrigin}</code>).
                            Use a server-side integration so your API key stays private.
                        </p>

                        <h2 id="endpoints">Endpoints</h2>
                        <div className="not-prose mt-8 space-y-6">
                            {endpoints.map((ep) => (
                                <section key={ep.path} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                                    <div className="mb-3 flex items-center gap-3">
                                        <span
                                            className={`rounded px-2.5 py-1 text-xs font-bold ${
                                                ep.method === "POST"
                                                    ? "bg-primary/10 text-primary"
                                                    : "bg-chart-1/10 text-chart-1 dark:text-chart-1"
                                            }`}
                                        >
                                            {ep.method}
                                        </span>
                                        <code className="font-mono text-sm font-medium text-foreground">{ep.path}</code>
                                    </div>
                                    <p className="mb-4 text-sm text-muted-foreground">{ep.description}</p>
                                    <DocCodeBlock code={ep.example} language="bash" className="my-0" />
                                </section>
                            ))}
                        </div>

                        <ApiResponseGuide />
                        <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
                            Need a new key? Open{" "}
                            <Link
                                href={getAppIntegrationsUrl()}
                                className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
                            >
                                Integrations
                            </Link>{" "}
                            in the app (you must be signed in).
                        </p>
                    </div>
                    <DocCopyPageButton containerId="doc-page-content" className="shrink-0" />
                </div>
            </main>

            <DocToc items={tocItems} />
        </div>
    );
}
