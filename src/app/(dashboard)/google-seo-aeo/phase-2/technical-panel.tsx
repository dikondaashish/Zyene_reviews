import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Phase2OperationsData } from "./phase2-types";

export function TechnicalPanel({ data }: { data: Phase2OperationsData }) {
    return (
        <section className="space-y-4" aria-labelledby="technical-heading">
            <div><h2 id="technical-heading" className="text-xl font-semibold">Technical and citation operations</h2><p className="text-sm text-muted-foreground">Real crawler access, render parity, page experience, indexation, and citation gaps.</p></div>
            <div className="grid gap-4 xl:grid-cols-2">
                <Card><CardHeader><CardTitle className="text-base">AI crawler activity · 30 days</CardTitle></CardHeader><CardContent>
                    {data.crawlerHits.length ? <div className="divide-y">{data.crawlerHits.map((row) => <div key={row.crawler} className="flex justify-between py-2 text-sm"><span>{row.crawler}</span><span>{row.count} hits · {new Date(row.latest).toLocaleDateString()}</span></div>)}</div> : <Empty text="Connect a log drain to measure crawler traffic." />}
                </CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Rendered-page diagnostics</CardTitle></CardHeader><CardContent>
                    {data.diagnostics.length ? <div className="divide-y">{data.diagnostics.slice(0, 10).map((row, index) => <div key={`${row.url}-${index}`} className="py-2 text-sm"><p className="truncate font-medium">{row.url}</p><p className="text-xs text-muted-foreground">JS-only {row.jsDelta === null ? "unavailable" : `${Math.round(row.jsDelta * 100)}%`} · LCP {row.lcp ?? "n/a"} ms · CLS {row.cls ?? "n/a"} · INP {row.inp ?? "n/a"} ms · {row.indexStatus ?? "index unknown"}</p></div>)}</div> : <Empty text="Run a technical audit to collect rendered diagnostics." />}
                </CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Uncited relevant pages</CardTitle></CardHeader><CardContent>
                    {data.pageGaps.length ? <div className="divide-y">{data.pageGaps.slice(0, 10).map((row) => <div key={`${row.url}-${row.prompt}`} className="py-2 text-sm"><p className="truncate font-medium">{row.url}</p><p className="text-xs text-muted-foreground">Targets “{row.prompt}” · {Math.round(row.score * 100)}% term match</p></div>)}</div> : <Empty text="No uncited relevant-page gap is measured." />}
                </CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Review corpus citations</CardTitle></CardHeader><CardContent>
                    {data.reviewMatches.length ? <div className="divide-y">{data.reviewMatches.slice(0, 8).map((row, index) => <div key={`${row.at}-${index}`} className="py-2 text-sm"><p>AI: “{row.answerExcerpt}”</p><p className="mt-1 text-xs text-muted-foreground">Review: “{row.reviewExcerpt}” · {Math.round(row.confidence * 100)}% confidence</p></div>)}</div> : <Empty text="No review quote or paraphrase match is measured yet." />}
                </CardContent></Card>
            </div>
        </section>
    );
}

function Empty({ text }: { text: string }) { return <p className="py-6 text-center text-sm text-muted-foreground">{text}</p>; }
