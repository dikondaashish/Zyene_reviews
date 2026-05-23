"use client";

import { useGoogleIntegrationCard } from "@/components/integrations/use-google-integration-card";
import type { GoogleCardProps } from "@/components/integrations/google-card-types";
import { GoogleIntegrationCardErrorState } from "@/components/integrations/google-integration-card-error-state";
import { GoogleIntegrationCardDisconnected } from "@/components/integrations/google-integration-card-disconnected";
import { GoogleIntegrationCardConnected } from "@/components/integrations/google-integration-card-connected";

export function GoogleIntegrationCard(props: GoogleCardProps) {
    const s = useGoogleIntegrationCard(props);

    if (s.isConnected && s.isError) {
        return <GoogleIntegrationCardErrorState onReconnect={s.handleConnect} />;
    }

    if (s.isConnected && s.platform) {
        return (
            <GoogleIntegrationCardConnected
                businessName={props.businessName}
                mounted={s.mounted}
                needsLocation={s.needsLocation}
                displayReviewCount={s.displayReviewCount}
                displayLastSyncedAt={s.displayLastSyncedAt}
                isSyncBusy={s.isSyncBusy}
                showForceSync={s.showForceSync}
                isStalled={s.isStalled}
                syncButtonBusy={s.syncButtonBusy}
                isDisconnecting={s.isDisconnecting}
                isPickingLocation={s.isPickingLocation}
                setIsPickingLocation={s.setIsPickingLocation}
                isLoadingLocations={s.isLoadingLocations}
                accounts={s.accounts}
                selectedAccount={s.selectedAccount}
                setSelectedAccount={s.setSelectedAccount}
                selectedLocation={s.selectedLocation}
                setSelectedLocation={s.setSelectedLocation}
                loadLocations={s.loadLocations}
                saveLocation={s.saveLocation}
                handleConnect={s.handleConnect}
                handleSync={s.handleSync}
                handleDisconnect={s.handleDisconnect}
            />
        );
    }

    return <GoogleIntegrationCardDisconnected onConnect={s.handleConnect} />;
}

export type { GoogleCardProps } from "@/components/integrations/google-card-types";
