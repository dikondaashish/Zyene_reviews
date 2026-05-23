"use client";

import { useYelpIntegrationCard } from "./use-yelp-integration-card";
import type { YelpCardProps } from "./yelp-card-types";
import { YelpIntegrationCardConnected } from "./yelp-integration-card-connected";
import { YelpIntegrationCardError } from "./yelp-integration-card-error";
import { YelpIntegrationCardConnectFlow } from "./yelp-integration-card-connect-flow";

export function YelpIntegrationCard(props: YelpCardProps) {
    const s = useYelpIntegrationCard(props);

    if (s.isConnected && s.platform) {
        return (
            <YelpIntegrationCardConnected
                platform={s.platform}
                mounted={s.mounted}
                yelpSyncedCount={s.yelpSyncedCount}
                isSyncing={s.isSyncing}
                setIsSyncing={s.setIsSyncing}
                router={s.router}
                onDisconnect={s.handleDisconnect}
            />
        );
    }

    if (s.hasError) {
        return <YelpIntegrationCardError onReconnect={() => s.setShowConnect(true)} />;
    }

    return (
        <YelpIntegrationCardConnectFlow
            showConnect={s.showConnect}
            onShowConnect={s.setShowConnect}
            searchName={s.searchName}
            onSearchNameChange={s.setSearchName}
            searchLocation={s.searchLocation}
            onSearchLocationChange={s.setSearchLocation}
            isSearching={s.isSearching}
            onSearch={s.handleSearch}
            searchResults={s.searchResults}
            isConfirming={s.isConfirming}
            onConfirm={s.handleConfirm}
            onCancelConnect={() => {
                s.setShowConnect(false);
                s.setSearchResults([]);
            }}
        />
    );
}

export type { YelpCardProps } from "./yelp-card-types";
