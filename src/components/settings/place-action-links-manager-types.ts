export type PlaceLinkRow = {
    id: string;
    place_action_type: string;
    uri: string;
    is_preferred: boolean;
    is_broken: boolean;
};

export type PlaceActionMetaType = { placeActionType?: string; displayName?: string };

export type PlaceActionLinksManagerProps = {
    businessId: string;
    initialLinks: PlaceLinkRow[];
};
