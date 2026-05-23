import { formatDistanceToNow } from "date-fns";

import type { TeamActivityRow } from "./team-management-panel-types";

export function TeamManagementPanelActivityLog({ activity }: { activity: TeamActivityRow[] }) {
    return (
        <div className="rounded-lg border border-border bg-card">
            {activity.length === 0 ? (
                <div className="px-4 py-8 text-sm text-muted-foreground">No recent team activity yet.</div>
            ) : (
                <ul className="divide-y divide-border/70">
                    {activity.map((item) => (
                        <li key={item.id} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
                            <div className="flex min-w-0 items-start gap-2">
                                <span className="mt-2 shrink-0 rounded-full bg-muted-foreground/50 size-1.5" />
                                <p className="text-foreground/90">{item.message}</p>
                            </div>
                            <span className="shrink-0 text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
