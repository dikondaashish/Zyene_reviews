"use client";

import * as React from "react";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { viewStoredAnswer, type StoredAnswer } from "./view-answer-action";
import type { HeadToHeadRow } from "./load-prompt-detail";

/** F3.6: single prompt, all engines, who was named, verbatim answer on demand. */
export function PromptHeadToHead({ rows }: { rows: HeadToHeadRow[] }) {
    const [open, setOpen] = React.useState<StoredAnswer | null>(null);
    const [loadingId, setLoadingId] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    async function handleView(row: HeadToHeadRow) {
        setError(null);
        setLoadingId(row.sampleId);
        const result = await viewStoredAnswer(row.sampleId);
        setLoadingId(null);
        if (!result.ok) {
            setError(result.error);
            return;
        }
        setOpen(result.answer);
    }

    if (rows.length === 0) {
        return <p className="text-sm text-muted-foreground">No samples for this prompt in the last 12 weeks.</p>;
    }

    return (
        <div className="space-y-2">
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b text-left text-muted-foreground">
                        <th className="py-1.5 font-medium">Engine</th>
                        <th className="py-1.5 font-medium">Named us?</th>
                        <th className="py-1.5 font-medium">Competitors named</th>
                        <th className="py-1.5 font-medium">Answer</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.sampleId} className="border-b last:border-0">
                            <td className="py-2 capitalize">{row.engineId.replace(/_/g, " ")}</td>
                            <td className="py-2">
                                {row.status !== "ok" ? (
                                    <Badge variant="outline" className="gap-1 text-xs">
                                        <HelpCircle className="size-3" /> {row.status.replace("_", " ")}
                                    </Badge>
                                ) : row.ownBrandNamed ? (
                                    <Badge className="gap-1 border-0 bg-chart-2/15 text-chart-2 text-xs">
                                        <CheckCircle2 className="size-3" /> Named
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="gap-1 text-xs">
                                        <XCircle className="size-3" /> Not named
                                    </Badge>
                                )}
                            </td>
                            <td className="py-2 text-muted-foreground">
                                {row.competitorsNamed.length > 0 ? row.competitorsNamed.join(", ") : "—"}
                            </td>
                            <td className="py-2">
                                {row.answerStoragePath ? (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        disabled={loadingId === row.sampleId}
                                        onClick={() => handleView(row)}
                                    >
                                        {loadingId === row.sampleId ? "Loading…" : "View"}
                                    </Button>
                                ) : (
                                    <span className="text-xs text-muted-foreground">Not retained</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
                <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Verbatim answer — {open?.engineId}</DialogTitle>
                        <DialogDescription>
                            {open?.modelId ? `Model: ${open.modelId} · ` : ""}
                            {open ? new Date(open.sampledAt).toLocaleString() : ""}
                        </DialogDescription>
                    </DialogHeader>
                    <p className="whitespace-pre-wrap text-sm">{open?.answerText}</p>
                </DialogContent>
            </Dialog>
        </div>
    );
}
