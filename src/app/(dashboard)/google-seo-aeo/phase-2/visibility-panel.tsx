import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Phase2VisibilityData } from "./phase2-types";

const pct = (value: number | null) => value === null ? "No data" : `${Math.round(value * 100)}%`;

export function VisibilityPanel({ data }: { data: Phase2VisibilityData }) {
    return (
        <section className="space-y-4" aria-labelledby="visibility-heading">
            <div><h2 id="visibility-heading" className="text-xl font-semibold">Visibility intelligence</h2><p className="text-sm text-muted-foreground">Repeatability, themes, sources, sentiment, and citation movement from measured answers.</p></div>
            <div className="grid gap-4 xl:grid-cols-2">
                <Card><CardHeader><CardTitle className="text-base">Repeat-sampling variance</CardTitle></CardHeader><CardContent>
                    {data.variance.length ? <div className="space-y-3">{data.variance.slice(0, 8).map((row) => <div key={row.label}><div className="flex justify-between gap-3 text-sm"><span className="truncate">{row.label}</span><strong>{pct(row.rate)}</strong></div><p className="text-xs text-muted-foreground">{row.attempts} attempts · 95% range {pct(row.low)}–{pct(row.high)}</p></div>)}</div> : <Empty text="Repeat a sampling run to measure variance." />}
                </CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Cluster visibility and share of voice</CardTitle></CardHeader><CardContent>
                    {data.clusters.length ? <div className="divide-y">{data.clusters.map((row) => <div key={row.name} className="flex items-center justify-between gap-3 py-2 text-sm"><span>{row.name}<small className="ml-2 text-muted-foreground">{row.observations} samples</small></span><span className="tabular-nums">{pct(row.visibility)} visibility · {pct(row.sov)} SoV</span></div>)}</div> : <Empty text="Clustered samples will appear after the next run." />}
                </CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Competitor-only citation sources</CardTitle></CardHeader><CardContent>
                    {data.sourceGaps.length ? <div className="divide-y">{data.sourceGaps.slice(0, 10).map((row) => <div key={row.domain} className="flex justify-between py-2 text-sm"><span>{row.domain}</span><Badge variant="secondary">{row.competitorCitations} citations</Badge></div>)}</div> : <Empty text="No competitor-only source gap is measured yet." />}
                </CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Citation history</CardTitle></CardHeader><CardContent>
                    {data.citationChanges.length ? <div className="divide-y">{data.citationChanges.slice(0, 10).map((row, index) => <div key={`${row.url}-${row.at}-${index}`} className="py-2"><div className="flex gap-2 text-sm"><Badge variant="outline">{row.type.replace("_", " ")}</Badge><span className="truncate">{row.url}</span></div><p className="mt-1 text-xs text-muted-foreground">{row.engine} · {new Date(row.at).toLocaleDateString()}</p></div>)}</div> : <Empty text="Citation gains, losses, and moves will appear after two sampling cycles." />}
                </CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle className="text-base">Mention sentiment, prominence, and attributes</CardTitle></CardHeader><CardContent>
                {data.mentions.length ? <div className="divide-y">{data.mentions.slice(0, 15).map((row, index) => <div key={`${row.brand}-${index}`} className="grid gap-1 py-2 text-sm md:grid-cols-[180px_100px_1fr]"><strong>{row.brand}</strong><span>{row.sentiment ?? "unclassified"}</span><span className="text-muted-foreground">{row.rationale ?? "No rationale"}{row.prominence !== null ? ` · prominence ${Math.round(row.prominence * 100)}%` : ""}{formatAttributes(row.attributes)}</span></div>)}</div> : <Empty text="Sentiment and attribute analysis will populate on new samples." />}
            </CardContent></Card>
        </section>
    );
}

function Empty({ text }: { text: string }) { return <p className="py-6 text-center text-sm text-muted-foreground">{text}</p>; }

function formatAttributes(value: unknown): string {
    if (!Array.isArray(value) || value.length === 0) return "";
    const labels = value.flatMap((item) => item && typeof item === "object" && "name" in item ? [String(item.name)] : []);
    return labels.length ? ` · attributes ${labels.join(", ")}` : "";
}
