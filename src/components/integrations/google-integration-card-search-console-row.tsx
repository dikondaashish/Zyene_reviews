"use client";

import { Search, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { grantIncludesSearchConsole } from "@/services/google/oauth-scopes";

/** E-2: incremental Search Console consent, surfaced next to the core Google connection. */
export function GoogleIntegrationCardSearchConsoleRow({
    grantedScopes,
    onConnect,
}: {
    grantedScopes?: string | null;
    onConnect: () => void;
}) {
    const connected = grantIncludesSearchConsole(grantedScopes);

    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                    <p className="text-sm font-medium truncate">Search Console</p>
                    <p className="text-xs text-muted-foreground truncate">
                        {connected
                            ? "Query and impression data enabled"
                            : "Optional: see search queries driving traffic"}
                    </p>
                </div>
            </div>
            {connected ? (
                <Badge className="bg-chart-2/15 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2 gap-1.5 border-0 shrink-0">
                    <CheckCircle2 className="size-3" />
                    Connected
                </Badge>
            ) : (
                <Button size="sm" variant="outline" onClick={onConnect} className="shrink-0">
                    Connect
                </Button>
            )}
        </div>
    );
}
