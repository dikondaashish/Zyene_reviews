"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function GoogleIntegrationCardForceSyncCallout({
    isStalled,
    syncButtonBusy,
    onForceSync,
}: {
    isStalled: boolean;
    syncButtonBusy: boolean;
    onForceSync: () => void | Promise<void>;
}) {
    return (
        <div className="rounded-lg border border-chart-4/35 bg-chart-4/12 p-3 text-sm text-chart-4">
            <p className="font-medium">{isStalled ? "Sync appears stuck" : "Sync taking longer than usual"}</p>
            <p className="text-xs mt-1 text-chart-4/90">
                {isStalled
                    ? "The background job may not have started or finished. Force Sync clears the lock and retries."
                    : "Reviews may still be importing. If this persists, use Force Sync."}
            </p>
            <Button size="sm" variant="secondary" className="mt-2" disabled={syncButtonBusy} onClick={() => void onForceSync()}>
                <RefreshCw className="mr-2 size-3.5" />
                Force Sync
            </Button>
        </div>
    );
}
