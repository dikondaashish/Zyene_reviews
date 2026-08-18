import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Phase2OperationsData } from "./phase2-types";
import { refreshRecommendationQueue, updateRecommendationStatus } from "./recommendation-actions";

export function RecommendationsPanel({ data }: { data: Phase2OperationsData }) {
    return (
        <section className="space-y-4" aria-labelledby="recommendations-heading">
            <div className="flex items-end justify-between gap-3"><div><h2 id="recommendations-heading" className="text-xl font-semibold">Content recommendations and impact</h2><p className="text-sm text-muted-foreground">Page rewrites, review-led briefs, freshness work, and GBP actions tracked from recommendation to measured outcome.</p></div><form action={refreshRecommendationQueue}><Button variant="outline" size="sm">Refresh queue</Button></form></div>
            <Card><CardHeader><CardTitle className="text-base">Recommendation queue</CardTitle></CardHeader><CardContent>
                {data.recommendations.length ? <div className="divide-y">{data.recommendations.map((row) => <div key={row.id} className="flex flex-col gap-3 py-3 md:flex-row md:items-center"><div className="min-w-0 flex-1"><p className="font-medium">{row.title}</p><p className="text-xs text-muted-foreground">{row.type.replaceAll("_", " ")} · {row.targetUrl ?? "No mapped page"} · {row.status}</p>{row.status === "applied" ? <p className="mt-1 text-xs text-muted-foreground">Impact: {JSON.stringify(row.impact)}</p> : null}</div>{row.status === "open" ? <div className="flex gap-2"><form action={updateRecommendationStatus}><input type="hidden" name="id" value={row.id} /><input type="hidden" name="status" value="applied" /><Button size="sm"><Check className="size-4" />Applied</Button></form><form action={updateRecommendationStatus}><input type="hidden" name="id" value={row.id} /><input type="hidden" name="status" value="dismissed" /><Button size="icon" variant="ghost" title="Dismiss"><X className="size-4" /></Button></form></div> : null}</div>)}</div> : <p className="py-8 text-center text-sm text-muted-foreground">Recommendations will populate from citation gaps, review themes, and freshness signals.</p>}
            </CardContent></Card>
        </section>
    );
}
