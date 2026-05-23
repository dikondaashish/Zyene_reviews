"use client";

import { PlaceActionLinksManagerCreateForm } from "./place-action-links-manager-create-form";
import { PlaceActionLinksManagerLinksTable } from "./place-action-links-manager-links-table";
import type { PlaceActionLinksManagerProps, PlaceLinkRow } from "./place-action-links-manager-types";
import { usePlaceActionLinksManager } from "./use-place-action-links-manager";

export type { PlaceLinkRow } from "./place-action-links-manager-types";

export function PlaceActionLinksManager(props: PlaceActionLinksManagerProps) {
    const m = usePlaceActionLinksManager(props);

    return (
        <div className="space-y-8">
            <PlaceActionLinksManagerCreateForm
                types={m.types}
                typesLoading={m.typesLoading}
                placeActionType={m.placeActionType}
                onPlaceActionTypeChange={m.setPlaceActionType}
                uri={m.uri}
                onUriChange={m.setUri}
                isPreferred={m.isPreferred}
                onIsPreferredChange={m.setIsPreferred}
                creating={m.creating}
                onSubmit={m.handleCreate}
            />

            <div>
                <h5 className="text-sm font-medium mb-3">Current links</h5>
                <PlaceActionLinksManagerLinksTable
                    links={m.links}
                    displayForType={m.displayForType}
                    deletingId={m.deletingId}
                    onDelete={m.handleDelete}
                />
            </div>
        </div>
    );
}
