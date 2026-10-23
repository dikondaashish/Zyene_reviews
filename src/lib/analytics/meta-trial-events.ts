import { hasConsent } from "@/lib/privacy/privacy-store";
import { META_PIXEL_ID } from "@/lib/privacy/tracking-config";

type Fbq = (...args: unknown[]) => void;

const PIXEL_WAIT_MS = 15_000;
const PIXEL_POLL_MS = 250;
const recorded = new Set<string>();

/**
 * Meta `StartTrial` for a Stripe trial the server already confirmed (see
 * `finalizeOnboardingStripeCheckout`). Marketing consent only; no custom data or
 * identity. `eventId` is stable per subscription, so it dedupes repeat calls and can
 * be reused as `event_id` if a Conversions API sender is ever added.
 */
export function trackMetaStartTrial(eventId: string) {
    if (typeof window === "undefined" || !META_PIXEL_ID || recorded.has(eventId) || !hasConsent("marketing")) return;
    const flag = `zyene_meta_${eventId}_tracked`;
    try {
        if (window.localStorage.getItem(flag)) return;
    } catch {
        // Storage restrictions fall back to in-memory deduplication.
    }
    recorded.add(eventId);
    const startedAt = Date.now();

    const send = () => {
        // The pixel loads lazily after consent. Wait for its own `fbq`: a stub defined
        // here would make the pixel snippet skip `init`.
        const fbq = (window as Window & { fbq?: Fbq }).fbq;
        if (typeof fbq !== "function") {
            if (Date.now() - startedAt < PIXEL_WAIT_MS) window.setTimeout(send, PIXEL_POLL_MS);
            else recorded.delete(eventId);
            return;
        }
        try {
            fbq("track", "StartTrial", {}, { eventID: eventId });
            try { window.localStorage.setItem(flag, "1"); } catch { /* In-memory deduplication remains available. */ }
        } catch {
            // Ads measurement is best effort and must never change checkout success.
        }
    };
    send();
}
