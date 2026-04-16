import { DocToc, TocItem } from "@/components/docs/doc-toc";
import { Copy } from "lucide-react";
import Link from "next/link";

type Endpoint = {
    method: "GET" | "POST";
    path: string;
    description: string;
    example: string;
};

const endpoints: Endpoint[] = [
    {
        method: "POST",
        path: "/api/v1/requests/send",
        description: "Send a review request via SMS/link using your API key.",
        example: `curl -X POST "$BASE_URL/api/v1/requests/send" \\
  -H "X-API-Key: zy_..." \\
  -H "Content-Type: application/json" \\
  -d '{"customerName":"Alex","customerPhone":"+18165551234","channel":"sms"}'`,
    },
    {
        method: "GET",
        path: "/api/v1/reviews",
        description: "List public reviews for your connected business.",
        example: `curl "$BASE_URL/api/v1/reviews?page=1&limit=20&status=pending&minRating=4" \\
  -H "X-API-Key: zy_..."`,
    },
    {
        method: "GET",
        path: "/api/v1/analytics",
        description: "Get review/request analytics summary.",
        example: `curl "$BASE_URL/api/v1/analytics?days=30" \\
  -H "X-API-Key: zy_..."`,
    },
];

export default function DeveloperApiDocsPage() {
    const tocItems: TocItem[] = [
        { title: "Authentication", href: "#authentication" },
        { title: "Endpoints", href: "#endpoints" },
    ];

    return (
        <div className="flex w-full items-start">
            <main className="flex-1 w-full max-w-3xl min-w-0 py-8 px-6 lg:px-12 prose-docs">
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                    Developer Platform 
                    <span className="mx-2">&gt;</span> 
                    <span className="text-foreground font-medium">API Reference</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="mb-0 mt-0">Developer API</h1>
                    <button className="hidden md:flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors shadow-sm text-foreground">
                        <Copy className="h-3.5 w-3.5" />
                        Copy page
                    </button>
                </div>

                <h2 id="authentication">Authentication</h2>
                <p>
                    Use your API key from your project settings. Send it via the `X-API-Key` header or as a standard `Authorization: Bearer &lt;key&gt;` token format in your requests.
                </p>

                <h2 id="endpoints">Endpoints</h2>
                <div className="mt-8 space-y-6 not-prose">
                    {endpoints.map((ep) => (
                        <section key={ep.path} className="rounded-xl border bg-card p-4 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <span
                                    className={`rounded px-2.5 py-1 text-xs font-bold ${
                                        ep.method === "POST"
                                            ? "bg-primary/10 text-primary"
                                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                    }`}
                                >
                                    {ep.method}
                                </span>
                                <code className="text-sm font-mono text-foreground font-medium">{ep.path}</code>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{ep.description}</p>
                            <pre className="overflow-x-auto rounded-lg bg-muted border border-border p-3 text-xs">
                                <code className="text-muted-foreground font-mono">{ep.example}</code>
                            </pre>
                        </section>
                    ))}
                </div>

                <p className="mt-12 text-sm text-muted-foreground border-t border-border pt-6">
                    Need support? Go to{" "}
                    <Link href="/integrations" className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 transition-colors">
                        Integrations
                    </Link>{" "}
                    and regenerate your key if needed.
                </p>
            </main>

            <DocToc items={tocItems} />
        </div>
    );
}
