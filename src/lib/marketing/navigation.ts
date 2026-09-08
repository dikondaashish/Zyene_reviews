/** Preserve new-tab clicks and actions already handled by another control. */
export function isMarketingNavigationClick(event: Pick<MouseEvent, "defaultPrevented" | "button" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey">) {
  return !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/** Only intercept local page changes; anchors and external links retain native behavior. */
export function getMarketingNavigationTarget(href: string, currentHref: string) {
  try {
    const current = new URL(currentHref);
    const next = new URL(href, current);
    if (!['http:', 'https:'].includes(next.protocol) || next.origin !== current.origin) return null;
    if (next.pathname === current.pathname && next.search === current.search) return null;
    return {
      href: `${next.pathname}${next.search}${next.hash}`,
      label: next.pathname === "/demo" ? "Opening the demo page…" : "Opening page…",
    };
  } catch {
    return null;
  }
}
