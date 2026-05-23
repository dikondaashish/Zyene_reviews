"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { FacebookBrandIcon } from "@/components/integrations/facebook-brand-icon";
import type { IntegrationPlatformSummary } from "@/types/components";

export function FacebookIntegrationCardError({
    platform,
    connecting,
    handleConnect,
}: {
    platform: IntegrationPlatformSummary | null;
    connecting: boolean;
    handleConnect: () => void;
}) {
    return (
        <Card className="border-destructive/30 dark:border-destructive/30">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FacebookBrandIcon className="h-5 w-5 shrink-0" aria-hidden />
                        <CardTitle className="text-base">Facebook</CardTitle>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                        <XCircle className="h-3.5 w-3.5" />
                        Error
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 dark:bg-destructive/20 p-3 text-sm">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <div>
                        <p className="font-medium text-destructive dark:text-destructive">
                            {platform?.sync_status === "error_token_expired" ? "Access token expired" : "Sync error"}
                        </p>
                        <p className="text-xs text-destructive/80 dark:text-destructive/70 mt-0.5">
                            Reconnect your Facebook page to resume syncing.
                        </p>
                    </div>
                </div>
                <Button size="sm" className="w-full mt-3" onClick={handleConnect} disabled={connecting}>
                    {connecting ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null}
                    Reconnect Facebook
                </Button>
            </CardContent>
        </Card>
    );
}
