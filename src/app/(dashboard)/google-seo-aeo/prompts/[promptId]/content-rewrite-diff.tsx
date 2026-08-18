"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ContentRewriteDiff({ before, after, reviewInsights }: {
    before: string; after: string; reviewInsights: Array<{ theme: string; mentions: number }>;
}) {
    if (!after) return null;
    return (
        <section className="space-y-3" aria-labelledby="rewrite-heading">
            <div className="flex items-center justify-between"><p id="rewrite-heading" className="text-sm font-medium">Suggested rewrite</p><Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(after); toast.success("Rewrite copied"); }}><Copy className="size-3.5" />Copy rewrite</Button></div>
            <div className="grid gap-3 md:grid-cols-2"><div className="border-l-2 border-destructive/60 bg-destructive/5 p-3"><p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Before</p><p className="whitespace-pre-wrap text-sm">{before || "No existing page excerpt"}</p></div><div className="border-l-2 border-success/60 bg-success/5 p-3"><p className="mb-2 text-xs font-medium uppercase text-muted-foreground">After</p><p className="whitespace-pre-wrap text-sm">{after}</p></div></div>
            {reviewInsights.length ? <p className="text-xs text-muted-foreground">Review themes used: {reviewInsights.map((row) => `${row.theme} (${row.mentions})`).join(", ")}</p> : null}
        </section>
    );
}
