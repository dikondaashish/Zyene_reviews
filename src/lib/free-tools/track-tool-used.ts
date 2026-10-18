/** Pushes a `tool_used` event to the GTM dataLayer (browser only). */
export function trackToolUsed(toolName: string): void {
    if (typeof window === "undefined") return;
    const w = window as unknown as { dataLayer?: unknown[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: "tool_used", tool_name: toolName });
}
