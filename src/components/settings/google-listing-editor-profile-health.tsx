import { CheckCircle2, Circle } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import type { GoogleProfileHealthCheck } from "./google-listing-editor-types";

export function GoogleListingEditorProfileHealth({
    profileHealth,
}: {
    profileHealth: { score: number; checks: GoogleProfileHealthCheck[] };
}) {
    return (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-medium">Profile completeness</p>
                    <p className="text-xs text-muted-foreground">
                        Based on your live Google Business Profile fields.
                    </p>
                </div>
                <span className="text-2xl font-bold tabular-nums">{profileHealth.score}</span>
            </div>
            <Progress value={profileHealth.score} className="h-2" />
            <ul className="grid gap-2 sm:grid-cols-2">
                {profileHealth.checks.map((c) => (
                    <li key={c.id} className="flex items-start gap-2 text-sm">
                        {c.ok ? (
                            <CheckCircle2 className="text-chart-2 shrink-0 mt-0.5 size-4" />
                        ) : (
                            <Circle className="text-muted-foreground shrink-0 mt-0.5 size-4" />
                        )}
                        <span className={c.ok ? "" : "text-muted-foreground"}>
                            {c.label}
                            {!c.ok && c.hint && (
                                <span className="block text-xs text-muted-foreground mt-0.5">{c.hint}</span>
                            )}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
