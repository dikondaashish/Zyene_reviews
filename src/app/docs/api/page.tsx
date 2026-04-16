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
    return (
        <main className="mx-auto max-w-4xl px-4 py-10">
            <h1 className="text-3xl font-bold tracking-tight">Developer API</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Use your API key from Integrations. Send it in `X-API-Key` or `Authorization: Bearer &lt;key&gt;`.
            </p>

            <div className="mt-8 space-y-6">
                {endpoints.map((ep) => (
                    <section key={ep.path} className="rounded-xl border bg-card p-4">
                        <div className="flex items-center gap-2">
                            <span
                                className={`rounded px-2 py-0.5 text-xs font-bold ${
                                    ep.method === "POST"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-blue-100 text-blue-700"
                                }`}
                            >
                                {ep.method}
                            </span>
                            <code className="text-sm">{ep.path}</code>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{ep.description}</p>
                        <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-3 text-xs">
                            <code>{ep.example}</code>
                        </pre>
                    </section>
                ))}
            </div>

            <p className="mt-8 text-xs text-muted-foreground">
                Need support? Go to{" "}
                <Link href="/integrations" className="underline underline-offset-2">
                    Integrations
                </Link>{" "}
                and regenerate your key if needed.
            </p>
        </main>
    );
}
