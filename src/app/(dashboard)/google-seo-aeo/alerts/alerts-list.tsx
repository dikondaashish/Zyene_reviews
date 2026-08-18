"use client";

import * as React from "react";
import { toast } from "sonner";
import { BellOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { muteAeoAlert } from "./mute-alert-action";
import type { AlertRow } from "./load-alerts-page-data";

const SEVERITY_STYLE: Record<string, string> = {
    critical: "bg-destructive/15 text-destructive border-0",
    high: "bg-chart-4/20 text-chart-4 border-0",
    medium: "bg-warning/15 text-warning-foreground border-0",
    low: "bg-muted text-muted-foreground border-0",
};

const ALERT_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
});

export function AlertsList({ alerts }: { alerts: AlertRow[] }) {
    const [mutingId, setMutingId] = React.useState<string | null>(null);
    const [locallyMuted, setLocallyMuted] = React.useState<Set<string>>(new Set());

    async function handleMute(id: string) {
        setMutingId(id);
        const result = await muteAeoAlert(id);
        setMutingId(null);
        if (!result.success) {
            toast.error(result.error ?? "Failed to mute alert");
            return;
        }
        setLocallyMuted((prev) => new Set(prev).add(id));
        toast.success("Alert muted");
    }

    if (alerts.length === 0) {
        return (
            <p className="py-8 text-center text-sm text-muted-foreground">
                No alerts in the last 90 days.
            </p>
        );
    }

    return (
        <ul className="divide-y">
            {alerts.map((alert) => {
                const muted = alert.mutedAt !== null || locallyMuted.has(alert.id);
                return (
                    <li id={`alert-${alert.id}`} key={alert.id} className="flex scroll-mt-24 items-start gap-3 py-4">
                        <Badge className={SEVERITY_STYLE[alert.severity] ?? SEVERITY_STYLE.low}>
                            {alert.severity}
                        </Badge>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{alert.title}</p>
                            <p className="mt-0.5 text-sm text-muted-foreground">{alert.detail}</p>
                            <time
                                className="mt-1 block text-xs text-muted-foreground"
                                dateTime={alert.createdAt}
                            >
                                {ALERT_DATE_FORMATTER.format(new Date(alert.createdAt))} UTC
                            </time>
                        </div>
                        {!muted ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={mutingId === alert.id}
                                onClick={() => handleMute(alert.id)}
                                aria-label="Mute alert"
                            >
                                <BellOff className="size-4" />
                            </Button>
                        ) : (
                            <span className="text-xs text-muted-foreground shrink-0">Muted</span>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
