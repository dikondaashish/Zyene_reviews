"use client";

import { Button } from "@/components/ui/button";

export function GoogleIntegrationCardNeedsLocationCallout({
    onChooseLocation,
    onReconnect,
}: {
    onChooseLocation: () => void | Promise<void>;
    onReconnect: () => void;
}) {
    return (
        <div className="rounded-lg border border-chart-4/35 bg-chart-4/12 p-3 text-sm text-chart-4">
            <p className="font-medium">Action required: choose your Google location</p>
            <p className="text-xs mt-1 text-chart-4">
                This business is connected to Google, but no GBP location has been selected yet.
            </p>
            <div className="mt-2">
                <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => void onChooseLocation()}>
                        Choose location
                    </Button>
                    <Button size="sm" variant="outline" onClick={onReconnect}>
                        Reconnect Google
                    </Button>
                </div>
            </div>
        </div>
    );
}
