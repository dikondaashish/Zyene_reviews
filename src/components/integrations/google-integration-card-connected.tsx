"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { GoogleCardGoogleIcon } from "@/components/integrations/google-card-google-icon";
import { GoogleIntegrationCardNeedsLocationCallout } from "@/components/integrations/google-integration-card-needs-location-callout";
import { GoogleIntegrationCardSyncStatsRow } from "@/components/integrations/google-integration-card-sync-stats-row";
import { GoogleIntegrationCardForceSyncCallout } from "@/components/integrations/google-integration-card-force-sync-callout";
import { GoogleIntegrationCardSyncFooter } from "@/components/integrations/google-integration-card-sync-footer";
import { GoogleIntegrationCardLocationDialog } from "@/components/integrations/google-integration-card-location-dialog";
import type { GoogleLocationAccount } from "@/components/integrations/google-card-location-api";

export function GoogleIntegrationCardConnected({
    businessName,
    mounted,
    needsLocation,
    displayReviewCount,
    displayLastSyncedAt,
    isSyncBusy,
    showForceSync,
    isStalled,
    syncButtonBusy,
    isDisconnecting,
    isPickingLocation,
    setIsPickingLocation,
    isLoadingLocations,
    accounts,
    selectedAccount,
    setSelectedAccount,
    selectedLocation,
    setSelectedLocation,
    loadLocations,
    saveLocation,
    handleConnect,
    handleSync,
    handleDisconnect,
}: {
    businessName?: string | null;
    mounted: boolean;
    needsLocation: boolean;
    displayReviewCount: number;
    displayLastSyncedAt: string | null;
    isSyncBusy: boolean;
    showForceSync: boolean;
    isStalled: boolean;
    syncButtonBusy: boolean;
    isDisconnecting: boolean;
    isPickingLocation: boolean;
    setIsPickingLocation: (v: boolean) => void;
    isLoadingLocations: boolean;
    accounts: GoogleLocationAccount[];
    selectedAccount: string;
    setSelectedAccount: (v: string) => void;
    selectedLocation: string;
    setSelectedLocation: (v: string) => void;
    loadLocations: () => Promise<void>;
    saveLocation: () => void | Promise<void>;
    handleConnect: () => void;
    handleSync: (force?: boolean) => void | Promise<void>;
    handleDisconnect: () => void | Promise<void>;
}) {
    return (
        <Card className="border-chart-2/30/70 dark:border-chart-2/30 overflow-hidden">
            <div className="h-1 bg-chart-2/100 w-full" />
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card border border-border">
                            <GoogleCardGoogleIcon />
                        </div>
                        <div>
                            <p className="font-semibold text-base">Google Business Profile</p>
                            {businessName && <p className="text-sm text-muted-foreground">{businessName}</p>}
                        </div>
                    </div>
                    <Badge className="bg-chart-2/15 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2 gap-1.5 border-0">
                        <CheckCircle2 className="h-3 w-3" />
                        Connected
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-3 space-y-3">
                {needsLocation && (
                    <GoogleIntegrationCardNeedsLocationCallout
                        onChooseLocation={async () => {
                            setIsPickingLocation(true);
                            await loadLocations();
                        }}
                        onReconnect={handleConnect}
                    />
                )}
                <GoogleIntegrationCardSyncStatsRow
                    mounted={mounted}
                    displayReviewCount={displayReviewCount}
                    displayLastSyncedAt={displayLastSyncedAt}
                />
                {isSyncBusy && showForceSync && (
                    <GoogleIntegrationCardForceSyncCallout
                        isStalled={isStalled}
                        syncButtonBusy={syncButtonBusy}
                        onForceSync={() => handleSync(true)}
                    />
                )}
            </CardContent>
            <CardFooter className="flex justify-between gap-2 pt-0">
                <GoogleIntegrationCardSyncFooter
                    syncButtonBusy={syncButtonBusy}
                    isDisconnecting={isDisconnecting}
                    needsLocation={needsLocation}
                    onSync={() => handleSync()}
                    onDisconnect={handleDisconnect}
                />
            </CardFooter>

            <GoogleIntegrationCardLocationDialog
                open={isPickingLocation}
                onOpenChange={setIsPickingLocation}
                isLoadingLocations={isLoadingLocations}
                accounts={accounts}
                selectedAccount={selectedAccount}
                setSelectedAccount={setSelectedAccount}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                onCancel={() => setIsPickingLocation(false)}
                onSave={saveLocation}
            />
        </Card>
    );
}
