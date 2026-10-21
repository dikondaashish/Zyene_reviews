"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ImportProgress } from "@/services/enrollment/import-progress";

const STATUS_LABEL: Record<string, string> = { active: "Enrolling", paused: "Paused", completed: "Finished", cancelled: "Cancelled" };

export function CampaignImportProgress({
    imports, onUpdate,
}: {
    imports: ImportProgress[];
    onUpdate: (id: string, patch: { status?: string }) => void;
}) {
    if (!imports.length) return null;
    return (
        <ul className="space-y-3">
            {imports.map((imp) => {
                const percent = imp.validRows ? Math.round((imp.enrolledRows / imp.validRows) * 100) : 0;
                const open = imp.status === "active" || imp.status === "paused";
                return (
                    <li key={imp.id} className="space-y-2 rounded-md border p-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium">{imp.source === "inbound_email" ? "Invoice email enrollment" : imp.fileName || "CSV import"}</p>
                            <Badge variant="outline">{STATUS_LABEL[imp.status] ?? imp.status}</Badge>
                            <span className="ml-auto text-xs text-muted-foreground">
                                {imp.enrolledToday} of {imp.dailyLimit} today · {imp.pendingRows} waiting
                            </span>
                        </div>
                        <Progress value={percent} aria-label={`${percent}% enrolled`} />
                        <p className="text-xs text-muted-foreground">
                            {imp.enrolledRows} of {imp.validRows} enrolled · {imp.duplicateRows} duplicate · {imp.invalidRows} unusable rows
                        </p>
                        {open && (
                            <div className="flex gap-2">
                                {imp.status === "active"
                                    ? <Button size="sm" variant="outline" onClick={() => onUpdate(imp.id, { status: "paused" })}>Pause</Button>
                                    : <Button size="sm" variant="outline" onClick={() => onUpdate(imp.id, { status: "active" })}>Resume</Button>}
                                <Button size="sm" variant="ghost" onClick={() => onUpdate(imp.id, { status: "cancelled" })}>Cancel remaining</Button>
                            </div>
                        )}
                        {imp.issues.length > 0 && (
                            <details className="text-xs">
                                <summary className="cursor-pointer text-muted-foreground">{imp.issues.length} row(s) not sent</summary>
                                <ul className="mt-2 space-y-1">
                                    {imp.issues.map((issue) => (
                                        <li key={`${issue.rowNumber}-${issue.problem}`}>Row {issue.rowNumber} ({issue.contact}): {issue.problem}</li>
                                    ))}
                                </ul>
                            </details>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
