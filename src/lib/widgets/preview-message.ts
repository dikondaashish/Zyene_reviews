export function trustedWidgetPreviewMessage(event: { origin: string; source: unknown; data: unknown }, parent: unknown, ownOrigin: string): boolean {
    if (event.source !== parent || !event.data || typeof event.data !== "object" || !("type" in event.data) || event.data.type !== "zyene-widget-config") return false;
    return event.origin === ownOrigin || ["https://app.zyenereviews.com", "https://www.zyenereviews.com", "https://zyenereviews.com"].includes(event.origin);
}
