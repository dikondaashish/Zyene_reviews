export type YelpCardView = "connected" | "error" | "connect";

/** Which Yelp card to render. Reconnect from the error card opens the connect flow. */
export function getYelpCardView(state: {
    isConnected: boolean;
    hasError: boolean;
    showConnect: boolean;
}): YelpCardView {
    if (state.isConnected) return "connected";
    if (state.hasError && !state.showConnect) return "error";
    return "connect";
}
