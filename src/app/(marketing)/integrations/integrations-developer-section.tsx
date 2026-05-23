import Link from "next/link";
import { Check, Code2, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IntegrationsDeveloperSection() {
    return (
        <section className="py-20 px-4 bg-[color:var(--marketing-footer-bg)] text-[color:var(--marketing-footer-fg)] border-t border-border">
            <div className="container mx-auto max-w-5xl">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 mb-6">
                            <Code2 className="size-3.5" /> For Developers
                        </div>
                        <h2 className="text-4xl font-bold mb-4 leading-tight">Build exactly what your business needs</h2>
                        <p className="text-[color:var(--marketing-footer-muted)] mb-6 leading-relaxed text-lg">
                            Our REST API gives full programmatic access to reviews, requests, responses, analytics, and webhooks. Included on every paid plan—no enterprise contract required.
                        </p>
                        <ul className="space-y-3 mb-8">
                            {[
                                "OpenAPI 3.0 specification + Postman collection",
                                "Webhook events for new reviews, replies, and requests",
                                "Full read/write access to all review data",
                                "API key management per team member",
                                "Rate-limited and secure by default",
                            ].map((f) => (
                                <li key={f} className="flex items-start gap-3 text-[color:var(--marketing-footer-list)]">
                                    <Check className="text-primary shrink-0 mt-0.5 size-5" />
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex gap-4">
                            <Link href="/docs/api">
                                <Button className="gap-2">
                                    <Globe className="size-4" /> Read API Docs
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button variant="outline" className="gap-2 border-[color:var(--marketing-footer-muted)] text-[color:var(--marketing-footer-fg)] hover:bg-white/10">
                                    <Sparkles className="size-4" /> Get API Key Free
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-[color:var(--code-block-bg)] rounded-2xl border border-white/10 p-6 font-mono text-sm overflow-hidden">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                            <span className="rounded-full bg-destructive/70 size-3" />
                            <span className="rounded-full bg-chart-4/70 size-3" />
                            <span className="rounded-full bg-chart-2/70 size-3" />
                            <span className="text-white/30 text-xs ml-2">POST /v1/requests</span>
                        </div>
                        <pre className="text-[13px] leading-relaxed overflow-x-auto text-left whitespace-pre">
                            <code>
                                <span className="text-chart-1">curl</span>{" "}
                                <span className="text-chart-2">-X POST</span>{" \\\n"}
                                {"  "}
                                <span className="text-chart-4">https://api.zyenereviews.com/v1/requests</span>{" \\\n"}
                                {"  "}
                                <span className="text-chart-2">-H</span>{" "}
                                <span className="text-primary">&quot;Authorization: Bearer $API_KEY&quot;</span>{" \\\n"}
                                {"  "}
                                <span className="text-chart-2">-H</span>{" "}
                                <span className="text-primary">&quot;Content-Type: application/json&quot;</span>{" \\\n"}
                                {"  "}
                                <span className="text-chart-2">-d</span>{" "}
                                <span className="text-primary">&apos;&#123;</span>{"\n"}
                                {"    "}
                                <span className="text-primary">&quot;customer_name&quot;: &quot;Jane Smith&quot;,</span>{"\n"}
                                {"    "}
                                <span className="text-primary">&quot;phone&quot;: &quot;+15551234567&quot;,</span>{"\n"}
                                {"    "}
                                <span className="text-primary">&quot;channel&quot;: &quot;sms&quot;,</span>{"\n"}
                                {"    "}
                                <span className="text-primary">&quot;location_id&quot;: &quot;loc_abc123&quot;</span>{"\n"}
                                {"  "}
                                <span className="text-primary">&#125;&apos;</span>
                            </code>
                        </pre>
                        <div className="mt-4 pt-3 border-t border-white/10 text-chart-2 text-xs">
                            ✓ 200 OK—Review request sent via SMS
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
