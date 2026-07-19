/**
 * Pure decision helper for App webhook event types (testable without DB).
 * CREATE = install, DELETE = uninstall, UPDATE = subscription change.
 */
export type CloverAppEventAction = "clear_disconnect" | "mark_disconnected" | "log_only";

export function cloverAppEventAction(eventType: string): CloverAppEventAction {
    if (eventType === "DELETE") return "mark_disconnected";
    if (eventType === "CREATE") return "clear_disconnect";
    return "log_only";
}
