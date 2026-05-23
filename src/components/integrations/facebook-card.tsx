"use client";

import { useFacebookIntegrationCard } from "@/components/integrations/use-facebook-integration-card";
import type { FacebookCardProps } from "@/components/integrations/facebook-card-types";
import { FacebookIntegrationCardConnected } from "@/components/integrations/facebook-integration-card-connected";
import { FacebookIntegrationCardError } from "@/components/integrations/facebook-integration-card-error";
import { FacebookIntegrationCardDisconnected } from "@/components/integrations/facebook-integration-card-disconnected";
import { FacebookCardPageSelectDialog } from "@/components/integrations/facebook-card-page-select-dialog";

export function FacebookIntegrationCard(props: FacebookCardProps) {
    const s = useFacebookIntegrationCard(props);

    if (s.isConnected && s.platform) {
        return (
            <FacebookIntegrationCardConnected
                platform={s.platform}
                mounted={s.mounted}
                fbRatingDisplay={s.fbRatingDisplay}
                fbSyncedCount={s.fbSyncedCount}
                syncing={s.syncing}
                showDisconnect={s.showDisconnect}
                setShowDisconnect={s.setShowDisconnect}
                handleSync={s.handleSync}
                handleDisconnect={s.handleDisconnect}
            />
        );
    }

    if (s.isError) {
        return (
            <FacebookIntegrationCardError
                platform={s.platform}
                connecting={s.connecting}
                handleConnect={s.handleConnect}
            />
        );
    }

    return (
        <>
            <FacebookIntegrationCardDisconnected connecting={s.connecting} handleConnect={s.handleConnect} />
            <FacebookCardPageSelectDialog
                open={s.showPageSelect}
                onOpenChange={s.setShowPageSelect}
                pages={s.pages}
                confirmingPage={s.confirmingPage}
                onSelectPage={s.handleSelectPage}
            />
        </>
    );
}

export type { FacebookCardProps } from "@/components/integrations/facebook-card-types";
